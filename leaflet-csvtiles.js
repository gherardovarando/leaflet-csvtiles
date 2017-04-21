/**
 * @author : gherardo varando (gherardo.varando@gmail.com)
 *
 * @license: GPL v3
 *     This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


 */
'use strict';
// leaflet and PapaParse required
if (L != undefined && Papa != undefined) {

    L.CsvTiles = L.FeatureGroup.extend({
        options: {
            bounds: [
                [-256, 0],
                [0, 256]
            ],
            maxTiles: 4,
            tileSize: 256,
            size: 256,
            scale: 1, //scale to apply before draw the point
            localRS: false, //if points are stored within a local (tile) reference system
            origin: [0, 0], //points offset
            offset: [0, 0], //tiles offset
            delimiter: "", // auto-detect
            newline: "", // auto-detect
            quoteChar: '"',
            encoding: "",
            radius: 1,
            color: 'blue',
            fillColor: 'blue',
            weight: 1,
            fillOpacity: 0.3,
            opacity: 1,
            minZoom: 0, //autodetect
            grid: true
        },
        view: {
            row: null,
            col: null
        },
        url: '',

        initialize: function(url, options) {
            L.Util.setOptions(this, options);
            this._url = url;
            this._group = L.featureGroup();
            if (this.options.grid) {
                this._grid = L.featureGroup();
                let scale = this.options.scale;
                let scaleX, scaleY;
                if (Array.isArray(scale)) {
                    scaleX = scale[0];
                    scaleY = scale[1];
                } else if (scale > 0) {
                    scaleX = scale;
                    scaleY = scale;
                }
                for (var x = 0; x < this.options.size; x = x + this.options.tileSize) {
                    for (var y = 0; y < this.options.size; y = y + this.options.tileSize) {
                        let m = L.rectangle([
                            [y * scaleY, x * scaleX],
                            [(y + this.options.tileSize) * scaleY, (x + this.options.tileSize) * scaleX]
                        ], {
                            color: this.options.color,
                            fillColor: this.options.color,
                            opacity: 0.5,
                            fillOpacity: 0,
                            weight: 1
                        });
                        this._grid.addLayer(m);
                    }
                }
            }
            this._group.addEventParent(this);
        },

        onAdd: function(map) {
            this._map = map;
            if (this._map.getZoom() >= this.options.minZoom) {
                if (this.options.grid) {
                    this._map.addLayer(this._grid);
                }
                this._map.addLayer(this._group);
            }
            this._bindEvents();
            this._refreshView();
        },

        onRemove: function(map) {
            //this._group.clearLayers();
            if (this.options.grid) {
                map.removeLayer(this._grid);
            }
            map.removeLayer(this._group);
        },

        _refreshView: function() {
            if (!(this._map instanceof L.Map)) return;
            let zoom = this._map.getZoom();
            let bounds = this._map.getBounds();
            let center = this._map.getCenter();
            if (zoom < this.options.minZoom) return;
            let references = this._getReferences(L.latLngBounds([center]));
            if (this.view.row == references[0].row && this.view.col == references[0].col) return;
            this._group.clearLayers();
            this.view = references[0];
            references.splice(0, this.options.maxTiles).map((ref) => {
                this._read(ref);
            })
        },

        _bindEvents: function() {
            if (this._map instanceof L.Map) {
                this._map.on('zoomend', () => {
                    if (this._map.getZoom() >= this.options.minZoom) {
                        if (this.options.grid) {
                            this._map.addLayer(this._grid);
                        }
                        this._map.addLayer(this._group);
                    } else {
                        if (this.options.grid) {
                            this._map.removeLayer(this._grid);
                        }
                        this._map.removeLayer(this._group);
                    }
                });

                this._map.on('moveend', this._refreshView, this);

            }
        },

        //bounds are latlangbounds
        _getReferences: function(bounds) {
            let tileSize = this.options.tileSize;
            let scale = this.options.scale;
            let scaleX, scaleY;
            if (Array.isArray(scale)) {
                scaleX = scale[0];
                scaleY = scale[1];
            } else if (scale > 0) {
                scaleX = scale;
                scaleY = scale;
            }
            let offset = this.options.offset;
            let origin = this.options.origin;
            let s = 1;
            if (bounds) {
                var temp = [];
                let siz = this.options.size;
                var xstart = Math.floor(bounds.getWest() / (tileSize * scaleX));
                var xstop = Math.floor(bounds.getEast() / (tileSize * scaleX));
                var ystart = Math.floor(bounds.getNorth() / (tileSize * scaleY));
                var ystop = Math.floor(bounds.getSouth() / (tileSize * scaleY));
                if (xstop === (bounds.getEast() / (tileSize * scaleX))) xstop--;
                if (ystop === (bounds.getSouth() / (tileSize * scaleY))) ystop--;
                for (var i = xstart; i <= xstop; i++) {
                    for (var j = ystart; j <= ystop; j++) {
                        //if (i>=0 && j>=0){
                        temp.push([i, j]);
                        //}
                    }
                }

                if (this.options.localRS) {
                    s = tileSize;
                }

                var res = temp.map((coord) => {
                    return ({
                        col: coord[0] + offset[0],
                        row: coord[1] + offset[1],
                        x: coord[0] * s + origin[0],
                        y: coord[1] * s + origin[1]
                    })
                });

                return (res);
            } else {
                return this._getReferences(L.latLngBounds([0, this.options.size], [0, this.options.size]));
            }
        },

        _read: function(reference) {
            let url = this._url;
            url = url.replace("{x}", reference.col);
            url = url.replace("{y}", reference.row);
            Papa.parse(url, {
                dynamicTyping: true,
                fastMode: true,
                download: true,
                delimiter: this.options.delimeter,
                newline: this.options.newline,
                encoding: this.options.encoding,
                step: (results, parser) => {
                    this._addPoints([results.data[0][0] + reference.x, results.data[0][1] + reference.y]);
                },
                complete: (results, file) => {},
                error: (e, file) => {
                    throw e;
                }
            });
        },

        _addPoints: function(point) {
            let scale = this.options.scale;
            let scaleX, scaleY;
            if (Array.isArray(scale)) {
                scaleX = scale[0];
                scaleY = scale[1];
            } else if (scale > 0) {
                scaleX = scale;
                scaleY = scale;
            }
            if (!(point[0] == NaN) && !(point[1] == NaN)) {
                this._group.addLayer(L.circleMarker([point[1] * scaleY, point[0] * scaleX], {
                    radius: this.options.radius,
                    color: this.options.color,
                    fillColor: this.options.fillColor,
                    weight: this.options.weight,
                    opacity: this.options.opacity,
                    fillOpacity: this.options.fillOpacity
                }));
            }
        }
    });

    L.csvTiles = function(url, options) {
        return new L.CsvTiles(url, options);
    };
}

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

    L.TilePoints = L.FeatureGroup.etends({


        initialize: function(url, options) {
            options = Object.assign({
                tileSize = 256,
                size: 256,
                origin: [0, 0]
            }, options);
            this._url = url;
            this._options = options;

        }

        getReferences: function(bounds) {
            let tileSize = this._options.tileSize;
            let x0 = this._options.origin[0];
            let y0 = this._options.origin[1];
            if (bounds) {
                if (!x0) {
                    x0 = 0;
                }

                if (!y0) {
                    y0 = 0;
                }
                var temp = [];
                let siz = this.:options.size;
                Object.keys(bounds).map((k) => {
                    bounds[k] = Math.max(Math.min(bounds[k], siz), 0)
                });
                var xstart = Math.floor(bounds.west / tileSize);
                var xstop = Math.floor(bounds.east / tileSize);
                var ystart = Math.floor(bounds.north / tileSize);
                var ystop = Math.floor(bounds.south / tileSize);
                if (xstop === (bounds.east / tileSize)) xstop--;
                if (ystop === (bounds.south / tileSize)) ystop--;
                for (var i = xstart; i <= xstop; i++) {
                    for (var j = ystart; j <= ystop; j++) {
                        //if (i>=0 && j>=0){
                        temp.push([i, j]);
                        //}
                    }
                }

                var res = temp.map((coord) => {
                    return ({
                        col: coord[0] + x0,
                        row: coord[1] + y0,
                        x: coord[0] * tileSize,
                        y: coord[1] * tileSize
                    })
                });

                return (res);
            } else {
                return this.getReferences({
                    west: 0,
                    east: this.configuration.size,
                    north: 0,
                    south: this.configuration.size
                });
            }
        }

    });

    _read: function(reference, step, error, end) {
        let num = 0;
        let url = this.configuration.pointsUrlTemplate || this.configuration.pointUrl || this.configuration.url;
        url = url.replace("{x}", reference.col);
        url = url.replace("{y}", reference.row);
        Papa.parse(contents, {
            dynamicTyping: true,
            fastMode: true,
            step: (results, parser) => {
                if (!this.configuration.excludeCF || results.data[0][3] == 0) {
                    step([results.data[0][0] + reference.x, results.data[0][1] + reference.y]);
                }
            },
            complete: (results, file) => {
                if (end) {
                    end(num);
                }
            },
            error: (e, file) => {
                if (error) {
                    error(e);
                }
            }
        });
    }


}

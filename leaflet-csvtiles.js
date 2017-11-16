// Copyright (c) 2017 Gherardo Varando
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
'use strict';

// leaflet and PapaParse required
//
//




if (L != undefined && Papa != undefined) {

  L.CsvTiles = L.FeatureGroup.extend({
    options: {
      columns: {
        x: 0,
        y: 1,
        z: undefined
      },
      typeOfPoint: 'circleMarker', //change with the function and change leaflet-map-builder accordingly
      tileSize: 256,
      size: 256,
      scale: [1, 1, 1], //scale to apply before draw the point
      bounds: undefined,
      localRS: false, //if points are stored within a local (tile) reference system
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
    _origin: [0, 0],
    _url: '',
    _multilevel: false,

    initialize: function(url, options) {
      L.Util.setOptions(this, options);
      this._url = url;
      if (typeof this.options.columns.z != 'undefined' && L.MultiLevelHandler) {
        this._multilevel = true;
      }

      if (typeof this.options.typeOfPoint === 'string') {
        switch (this.options.typeOfPoint) {
          case "circleMarker":
            this._pointFunction = L.circleMarker;
            break;
          case 'marker':
            this._pointFunction = L.marker;
            break;
          case 'circle':
            this._pointFunction = L.circle;
            break;
          default:
            this._pointFunction = L.circleMarker;
        }
      }

      if (!Array.isArray(this.options.size)) {
        this.options.size = [this.options.size, this.options.size, this.options.size];
      }
      if (!Array.isArray(this.options.tileSize)) {
        this.options.tileSize = [this.options.tileSize, this.options.tileSize, this.options.tileSize];
      }
      if (this.options.bounds) {
        this._bounds = L.latLngBounds(this.options.bounds);
        this.options.scale = [(this._bounds.getEast() - this._bounds.getWest()) / this.options.size[0], (this._bounds.getSouth() - this._bounds.getNorth()) / this.options.size[1], (Array.isArray(this.options.scale) ? this.options.scale[2] : this.options.scale)];
        this._origin[0] = this._bounds.getWest();
        this._origin[1] = this._bounds.getNorth();
      }
      if (!Array.isArray(this.options.scale)) {
        this.options.scale = [this.options.scale, this.options.scale, this.options.scale];
      }
      this._group = L.featureGroup();
      if (this.options.grid) {
        this._grid = L.featureGroup();
        let scaleX = this.options.scale[0];
        let scaleY = this.options.scale[1];
        let x0 = this._origin[0];
        let y0 = this._origin[1];
        for (var x = 0; x < this.options.size[0]; x = x + this.options.tileSize[0]) {
          L.polyline([
            [y0, x0 + x * scaleX],
            [y0 + this.options.size[1] * scaleY, x0 + x * scaleX]
          ], {
            color: this.options.color,
            opacity: 0.5,
            weight: 1
          }).addTo(this._grid);
        }
        for (var y = 0; y < this.options.size[1]; y = y + this.options.tileSize[1]) {
          L.polyline([
            [y0 + y * scaleY, x0],
            [y0 + y * scaleY, x0 + this.options.size[0] * scaleX]
          ], {
            color: this.options.color,
            opacity: 0.5,
            weight: 1
          }).addTo(this._grid);
        }
      }
      this._grid.addEventParent(this);
      this._group.addEventParent(this);
    },

    onAdd: function(map) {
      this._map = map;
      if (this._multilevel) {
        if (!(this._map.options.multilevel && (typeof this._map.getLevel === 'function'))) {
          this._multilevel = false; //force to no multilevel if the map is not in multilevel mode
        }
      }
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
      this._unbindEvents();
    },

    _refreshView: function() {
      if (!(this._map instanceof L.Map)) return;
      let zoom = this._map.getZoom();
      let bounds = this._map.getBounds();
      let center = this._map.getCenter();
      if (this._bounds) {
        if (!this._bounds.contains(center)) return;
      }
      if (zoom < this.options.minZoom) return;
      let references = this.getReferences(L.latLngBounds([center]));
      if (!references || !references[0]) return;
      if (this.view.row == references[0].row && this.view.col == references[0].col) return;
      this._group.clearLayers();
      this.view = references[0];
      this.read(this.view, (point) => {
        this._addPoints(point)
      });
      // references.splice(0, 1).map((ref) => {
      //     this._read(ref);
      // })
    },

    _bindEvents: function() {
      if (this._map instanceof L.Map) {
        this._map.on('zoomend', this._zoomEnd, this);
        this._map.on('moveend', this._refreshView, this);
        this._map.on('levelchange', this._refreshView, this);
      }
    },

    _zoomEnd: function() {
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
    },

    _unbindEvents: function() {
      this._map.off('moveend', this._refreshView, this);
      this._map.off('zoomend', this._zoomEnd, this);
      this._map.off('levelchange', this._refreshView, this);
    },

    //bounds are latlangbounds
    getReferences: function(bounds) {
      let tileSize = this.options.tileSize;
      let scaleX = this.options.scale[0];
      let scaleY = this.options.scale[1];
      let offset = this.options.offset;
      let s = [1,1];
      if (bounds) {
        var temp = [];
        var xstart = Math.floor((bounds.getWest() - this._origin[0]) / (tileSize[0] * scaleX));
        var xstop = Math.floor((bounds.getEast() - this._origin[0]) / (tileSize[0] * scaleX));
        var ystart = Math.floor((bounds.getNorth() - this._origin[1]) / (tileSize[1] * scaleY));
        var ystop = Math.floor((bounds.getSouth() - this._origin[1]) / (tileSize[1] * scaleY));
        if (xstop === (bounds.getEast() / (tileSize[0] * scaleX))) xstop--;
        if (ystop === (bounds.getSouth() / (tileSize[1] * scaleY))) ystop--;
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
            x: coord[0] * s[0],
            y: coord[1] * s[1]
          })
        });

        return (res);
      }
    },

    read: function(reference, cl) {
      let url = this._url;
      url = url.replace("{x}", reference.col);
      url = url.replace("{y}", reference.row);
      if (url.startsWith('http://') || url.startsWith('file://') || url.startsWith('https://') || (typeof module == 'undefined' || !module.exports)) {
        Papa.parse(url, {
          dynamicTyping: true,
          fastMode: true,
          download: true,
          delimiter: this.options.delimeter,
          newline: this.options.newline,
          encoding: this.options.encoding,
          step: (results, parser) => {
            if (typeof cl === 'function') cl([results.data[0][this.options.columns.x] + reference.x, results.data[0][this.options.columns.y] + reference.y, results.data[0][this.options.columns.z]]);
          },
          complete: (results, file) => {},
          error: (e, file) => {
            throw e;
          }
        });
      } else {
        //we are in node, for example electron app
        try {
          const fs = require('fs');
        } catch (e) {
          throw e;
        } finally {
          require('fs').readFile(url, this.options.encoding || 'utf8', (err, data) => {
            if (err) throw err;
            Papa.parse(data, {
              dynamicTyping: true,
              fastMode: true,
              download: false,
              delimiter: this.options.delimeter,
              newline: this.options.newline,
              step: (results, parser) => {
                this._addPoints([results.data[0][this.options.columns.x] + reference.x, results.data[0][this.options.columns.y] + reference.y, results.data[0][this.options.columns.z]]);
              },
              complete: (results, file) => {},
              error: (e, file) => {
                throw e;
              }
            });
          });
        }
      }
    },

    _addPoints: function(point) {
      let scaleX = this.options.scale[0];
      let scaleY = this.options.scale[1];
      let f = this._pointFunction;
      if (this._multilevel && (typeof f.ml === 'function')) {
        f = f.ml;
      }
      if (!(isNaN(point[0])) && !(isNaN(point[1]))) {
        this._group.addLayer(f([this._origin[1] + point[1] * scaleY, this._origin[0] + point[0] * scaleX], {
          radius: this.options.radius,
          color: this.options.color,
          fillColor: this.options.fillColor,
          weight: this.options.weight,
          opacity: this.options.opacity,
          fillOpacity: this.options.fillOpacity,
          minLevel: Math.floor(point[2]),
          maxLevel: Math.floor(point[2])
        }));
      }
    }
  });

  L.csvTiles = function(url, options) {
    return new L.CsvTiles(url, options);
  };
}

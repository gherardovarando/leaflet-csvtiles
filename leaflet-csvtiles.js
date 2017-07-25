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
if (L != undefined && Papa != undefined) {

  L.CsvTiles = L.FeatureGroup.extend({
    options: {
      tileSize: 256,
      size: 256,
      scale: 1, //scale to apply before draw the point
      bounds: undefined,
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
      if (!Array.isArray(this.options.scale)) {
        this.options.scale = [this.options.scale, this.options.scale];
      }
      if (!Array.isArray(this.options.size)) {
        this.options.size = [this.options.size, this.options.size];
      }
      if (!Array.isArray(this.options.tileSize)) {
        this.options.tileSize = [this.options.tileSize, this.options.tileSize];
      }
      this._group = L.featureGroup();
      if (this.options.grid) {
        this._grid = L.featureGroup();
        let scaleX = this.options.scale[0];
        let scaleY = this.options.scale[1];
        for (var x = 0; x < this.options.size[0]; x = x + this.options.tileSize[0]) {
          for (var y = 0; y < this.options.size[1]; y = y + this.options.tileSize[1]) {
            let m = L.rectangle([
              [y * scaleY, x * scaleX],
              [(y + this.options.tileSize[1]) * scaleY, (x + this.options.tileSize[0]) * scaleX]
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
      this._unbindEvents();
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
      this._read(this.view);
      // references.splice(0, 1).map((ref) => {
      //     this._read(ref);
      // })
    },

    _bindEvents: function() {
      if (this._map instanceof L.Map) {
        this._map.on('zoomend', this._zoomEnd, this);
        this._map.on('moveend', this._refreshView, this);
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
    },

    //bounds are latlangbounds
    _getReferences: function(bounds) {
      let tileSize = this.options.tileSize;
      let scaleX = this.options.scale[0];
      let scaleY = this.options.scale[1];
      let offset = this.options.offset;
      let origin = this.options.origin;
      let s = 1;
      if (bounds) {
        var temp = [];
        var xstart = Math.floor(bounds.getWest() / (tileSize[0] * scaleX));
        var xstop = Math.floor(bounds.getEast() / (tileSize[0] * scaleX));
        var ystart = Math.floor(bounds.getNorth() / (tileSize[1] * scaleY));
        var ystop = Math.floor(bounds.getSouth() / (tileSize[1] * scaleY));
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
            x: coord[0] * s[0] + origin[0],
            y: coord[1] * s[1] + origin[1]
          })
        });

        return (res);
      }
    },

    _read: function(reference) {
      let url = this._url;
      url = url.replace("{x}", reference.col);
      url = url.replace("{y}", reference.row);
      if (url.startsWith('http') || (typeof module == 'undefined' || !module.exports)) {
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
      } else if (url.startsWith('file') || url.startsWith('/')) {
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
                this._addPoints([results.data[0][0] + reference.x, results.data[0][1] + reference.y]);
              },
              complete: (results, file) => {},
              error: (e, file) => {
                throw e;
              }
            });
          });
        }
      } else {
        console.log(url);
        throw 'Error: cant read local file if not in Node.js'
      }
    },

    _addPoints: function(point) {
      let scaleX = this.options.scale[0];
      let scaleY = this.options.scale[1];
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

[![npm version](https://badge.fury.io/js/leaflet-csvtiles.svg)](https://badge.fury.io/js/leaflet-csvtiles)


# leaflet-csvtiles
leaflet-csvtiles is a leaflet plugin that load points from tiled csv files, using the amazing [PapaParse](http://papaparse.com/) library.

**This plugin was developed mainly for application with Simple CRS, with different CRS the tiles will always be uniformly spaced in lat and lng (so not uniformly spaced in the map see the demo for the problem visualization)**

## Demos 

### L.CRS.Simple [demo](https://gherardovarando.github.io/leaflet-csvtiles/demo/index.html)

### L.CRS.EPSG3857 [demo](https://gherardovarando.github.io/leaflet-csvtiles/demo/index2.html) (points have no meaning here)

## API

### Creation

#### `L.csvTiles(url, options, parser)`

- `url` url template of the csv tiled files.
- `options` options object (optional)
- `parser` Parser function (default to global `Papa.parse`) `function(url || data, config)`.

#### Options

The option that can be passed on creation

- `columns` Object:

  - `x` Integer index of the column that stores the x coordinates in the csv, default to `0`. (x coordinates will be mapped to lng)
  - `y` Integer index of the column that stores the y coordinates in the csv, default to `1`. (y coordinates will be mapped to lat).
  - `z` Integer index of the column that stores the z coordinates (levels/slice/elevation) in the csv, default to `undefined`. If set to a a positive integer and the Multi Level handler is enabled the points will be displayed only in the appropriate level.

- `size` Number or Number[] size of the space covered by the csvTiles.

- `tileSize` Number or Number[] size of one tile (same unit as `size`).
- `scale` Number or Number[], scale to apply to the points coordinates.
- `bounds` LatLngBounds, (in map coordinates) if provided the `scale` parameter will be computed to fit the points into the given `bounds`.
- `localRS` boolean, if points are given in local (tile) coordinates in each tile, that is if true it means that in every tile the points coordinates range between (0,0) to tileSize.
- `origin` offset of the points coordinates, will be computed automatically if `bounds` is set.
- `offset` offset of the tile indexes.
- `minZoom` min zoom at which the layer is shown.
- `grid` if a grid showing tiles borders should be plotted.
- `typeOfPoint` String one of `circleMarker`(default), `marker`, `circle`.

the following fields are relative to the appropriate type of points used:

- `radius`
- `color`
- `fillColor`
- `weight`
- `fillOpacity`
- `opacity`

the following fields are as in the PapaParse configuration:

- `delimiter`
- `newline`
- `quoteChar`
- `encoding`
- `worker`

#### Methods

##### `getReferences(bounds)`

- `bounds` latLngBounds

  Return a vector of reference objects (see `read` method).

##### `read(reference, cl)`

- `reference` Object:

  - `col` Number
  - `row` Number
  - `x` Number
  - `y` Number

- `cl` function `cl(point)` , `point = [lng,lat,level]`

#### Events

### LICENSE

The MIT License (MIT)

Copyright (c) 2017 Gherardo Varando (gherardo.varando@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

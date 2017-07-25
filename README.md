#### by  gherardo.varando <gherardo.varando@gmail.com>




#### L.CRS.Simple [demo](https://gherardovarando.github.io/leaflet-csvtiles/demo/index.html)
#### L.CRS.EPSG3857 [demo](https://gherardovarando.github.io/leaflet-csvtiles/demo/index2.html)

leaflet-csvtiles is a leaflet plugin that load points from tiled csv files, using the amazing [PapaParse](http://papaparse.com/) library.

** Currently the use of this plugin with CRS different than Simple is experimental**

## API


### Creation

##### `` L.csvTiles(url, options) ``
- ``url`` url template of the csv tiled files.
-  ``options`` options object (optional)

#### Options

The option that can be passed on creation
- ``size`` Number or Number[] size of the space covered by the csvTiles.
- ``tileSize`` Number or Number[] size of one tile (same unit as ``size``).
- ``scale`` Number or Number[], scale to apply to the points coordinates.
- ``bounds`` LatLngBounds, (in map coordinates) if not scale is provided and ``bounds`` are present the ``scale`` parameter will be computed to fit the points into the given ``bounds``.
- ``localRS `` boolean, if points are given in local (tile) coordinates in each tile.
- ``origin`` offset of the points coordinates
- ``offset`` offset of the tile indexes.
- ``minZoom``
- ``grid`` if a grid showing tiles borders should be plotted.

the following fields are relative to circleMarker options:
- ``radius``
- ``color``
- ``fillColor``
- ``weight``
- ``fillOpacity``
- ``opacity``


the following fields are as in the PapaParse configuration:
- ``delimiter``
- ``newline``
- ``quoteChar``
- ``encoding``

#### Methods


#### Events

### LICENSE

The MIT License (MIT)

Copyright (c) 2016 Gherardo Varando (gherardo.varando@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


This product also includes the following libraries which are covered by the MIT license:

- electron
- leaflet-csvtiles
- marky-mark
- ms
- papaparse
- uuid

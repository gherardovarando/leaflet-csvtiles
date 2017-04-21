# Leaflet CSV Tiles
#### by  gherardo.varando <gherardo.varando@gmail.com>


#### [demo](https://gherardovarando.github.io/leaflet-csvtiles/demo/index.html)
#### [demo](https://gherardovarando.github.io/leaflet-csvtiles/demo/index2.html)

leaflet-csvtiles is a leaflet plugin that load points from tiled csv files, using the amazing [PapaParse](http://papaparse.com/) library.

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

``L.csvTiles`` extends ``L.featureGroup`` and inherits all its methods.

#### Events

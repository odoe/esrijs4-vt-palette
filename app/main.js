define([
  "esri/core/Accessor",
  "esri/core/watchUtils",
  "esri/Color",
  "esri/request",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/VectorTileLayer",
  "esri/widgets/Search",
  "./components/colorpalette",
  "dojo/domReady!"
], function(
  Accessor, watchUtils,
  Color,
  esriRequest,
  Map,
  MapView,
  VectorTileLayer,
  Search, colorPalette) {

  var map = new Map();

  var tileLyr = new VectorTileLayer({
    url: "http://www.arcgis.com/sharing/rest/content/items/dbd2dac5fe39429eb69cd657400419a4/resources/styles/root.json"
  });
  map.add(tileLyr);

  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-118.24, 34.04], // lon, lat
    zoom: 15,
    ui: {
      components: [
        "zoom",
        "attribution",
        "compass"
      ]
    }
  });

  var searchWidget = new Search({
    viewModel: {
      view: view
    }
  });
  searchWidget.startup();
  /* debugging
  view.watch("center", function(center) {
    console.log(center.longitude, center.latitude);
  });
  */

  // Add the search widget to the top left corner of the view
  view.ui.add(searchWidget, {
    position: "top-right",
    index: 1
  });

  esriRequest(tileLyr.url, { f: "json" }).then(function(response) {
    var vtStyle = response.data;
    console.log(response);
    var cp = colorPalette.create({
      style: vtStyle,
      layer: tileLyr
    });
    view.ui.add(cp, "bottom-left");
  });

});
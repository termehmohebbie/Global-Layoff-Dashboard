// We create the tile layer that will be the background of our map.

var defaultMap = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

// grayscale layer
var grayscale = L.tileLayer(
  "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}",
  {
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: "abcd",
    minZoom: 0,
    maxZoom: 20,
    ext: "png",
  }
);

// create watercolor layer
var waterColor = L.tileLayer(
  "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}",
  {
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: "abcd",
    minZoom: 1,
    maxZoom: 16,
    ext: "jpg",
  }
);

// Topography
let topoMap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  maxZoom: 17,
  attribution:
    'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
});

//// Create a basemaps.
let basemaps = {
  Grayscale: grayscale,
  "Water Color": waterColor,
  Topography: topoMap,
  Default: defaultMap,
};

// make a map object
var myMap = L.map("map", {
  attributionControl: false,
  center: [40.41921, 3.69252],
  zoom: 1,
  layers: [grayscale, waterColor, topoMap, defaultMap],
});

// add the default map to the map
defaultMap.addTo(myMap);

// get the data for the tectonic plates and draw on the map
// variable to hold the tectonic plates layer
let tectonicplates = new L.LayerGroup();

// call the api to get the info for the tectonic plates
d3.json(
  "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
).then(function (plateData) {
  // load data using geojson and add to the tectonic plates layer group
  L.geoJson(plateData, {
    //add styling to make the lines visible
    color: "yellow",
    weight: 1,
  }).addTo(tectonicplates);
});

// add tectonic plates to the map
tectonicplates.addTo(myMap);

// add the overlay for the tectonic plates and for the earthquakes
let overlays = {
  "Tectonic Plates": tectonicplates,
  "Earthquake Data": earthquakes,
};

// Create a Layer Control + Pass in baseMaps + Add the Layer Control to the Map
L.control.layers(basemaps, overlays).addTo(myMap);

// variable to hold the earthquake data layer

//d3.json("/layoff/geoJSON")
//.then(
function createMap(filteredGeo) {
  let earthquakes = new L.LayerGroup();
  console.log(filteredGeo);

  //   function radiusSize(Laid_Off_Count){
  //        if (Laid_Off_Count == 0)
  //           return 1;
  //        else
  //            return Laid_Off_Count * 0.002;
  //    }

  function dataColor(Laid_Off_Count) {
    if (Laid_Off_Count > 500) return "red";
    else if (Laid_Off_Count > 200) return "#fc4903";
    else if (Laid_Off_Count > 100) return "#fc8403";
    else if (Laid_Off_Count > 50) return "#fcad03";
    else if (Laid_Off_Count > 10) return "#cafc03";
    else return "green";
  }

  // add on to the style for each data point
  function dataStyle(features) {
    return {
      opacity: 0.5,
      fillOpacity: 0.5,
      fillColor: dataColor(features.properties.Laid_Off_Count), // use index 2 for the depth
      color: "000000", // black outline
      radius: 10, // grabs the magnitude
      weight: 0.5,
      stroke: true,
    };
  }

  // add the geojson data to the earthquake layer group
  L.geoJson(filteredGeo, {
    // make each feature a marker that is on the map, each marker is a circle
    pointToLayer: function (features, latLng) {
      return L.circleMarker(latLng);
    },
    // set the style for each marker
    style: dataStyle,
    // add popups
    onEachFeature: function (features, layer) {
      layer.bindPopup(`Company: <b>${features.properties.Company}</b><br>
                            City: <b>${features.properties.City}</b><br>
                            Laid off Count: <b>${features.properties.Laid_Off_Count}</b>`);
    },
  }).addTo(earthquakes);

  // add the earthquake layer to the map
  earthquakes.addTo(myMap);
}

var selector = d3.select("#selDataset");

//creating a dropdown list
d3.json("/industries").then((data) => {
  data.forEach((sample) => {
    selector.append("option").text(sample).property("value", sample);
  });
});

function buildMetadata(sample) {
  console.log(sample);

  let filteredData = [];

  d3.json("/dataset").then((data) => {
    console.log(data);

    if (sample !== "All") {
      filteredData = data.filter(function (item) {
        return item.Industry == sample;
      });
    } else {
      filteredData = data;
    }

    console.log("Filtered Data: ");
    console.log(filteredData);
  });

  let geoFiltered = [];
  d3.json("/layoff/geoJSON").then((data) => {
    console.log(data);

    let geoData = data.features;

    console.log(geoData);

    if (sample !== "All") {
      geoFiltered = geoData.filter(function (item) {
        return item.properties.Industry == sample;
      });
    } else {
      geoFiltered = geoData;
    }

    console.log("Geo Filtered Data: ");
    console.log(geoFiltered);
    createMap(geoFiltered);
  });
}

function optionChanged(newSample) {
  //myMap.removeLayer(earthquakes);
  // Get new data each time a new sample is selected
  buildMetadata(newSample);

  //createMap(geoFiltered);
}

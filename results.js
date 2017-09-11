//util function
const RANGE = (a, b) => Array.from((function* (x, y) {
  while (x <= y) {
    yield x++;
  }
})(a, b));

//Improve mobile map viewing
if (navigator.userAgent.indexOf('iPhone') !== -1
    || navigator.userAgent.indexOf('Android') !== -1) {
  let mapdiv = document.getElementById("map");
  mapdiv.style.width = '100%';
  mapdiv.style.height = '100%';
}

/**
 * This is the callback function used by the google maps code
 */
function initMap() {
  //create the map
  let map = new google.maps.Map(document.getElementById('map'),
      {
        zoom: 13,
        center: new google.maps.LatLng(35.966566, -83.939979),
        mapTypeId: 'roadmap' //roadmap||satellite||hybrid||terrain
      }
  );

  //some sample heatmap data from Gay street addresses
  // TODO: replace this with real data pulled in from dynamodb
  let heatmap = new google.maps.visualization.HeatmapLayer({
    "data": [
      new google.maps.LatLng(35.9661714, -83.91904110000002),
      new google.maps.LatLng(35.966316, -83.91854799999999),
      new google.maps.LatLng(35.9660563, -83.9191085),
      new google.maps.LatLng(35.9660652, -83.91876960000002),
      new google.maps.LatLng(35.9660871, -83.91895149999999),
      new google.maps.LatLng(35.9660369, -83.91875249999998),
      new google.maps.LatLng(35.965928, -83.919037),
      new google.maps.LatLng(35.9660523, -83.918342),
      new google.maps.LatLng(35.9660087, -83.91889100000003),
      new google.maps.LatLng(35.9659805, -83.91871839999999),
      new google.maps.LatLng(35.9659629, -83.9188729),
      new google.maps.LatLng(35.9643597, -83.9177525),
      new google.maps.LatLng(35.9626807, -83.91676919999998)
    ],
    map: map
  });

}

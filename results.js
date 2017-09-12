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

  //AWS Stuffages
  let dynamodb = new AWS.DynamoDB({
    accessKeyId: "AKIAJRC2BMR6AP5KF3NA",
    secretAccessKey: "CIN6PGDk7KFAjdB+SSH+YTW5pECqb/0SOcPWiiXw",
    region: "us-east-1",
    logger: console
  });


  let allAddrs = [];
  // TODO: replace this with real data pulled in from dynamodb
  dynamodb.scan({TableName: "ViewerData"}, (error, data) => {
    if (error !== null) {
      console.error("DynamoDB Error", error);
    } else {
      console.info("Successful DynamoDB request");
      console.debug(data);
      data.Items.forEach(item => {
        allAddrs.push(
            {
              location: new google.maps.LatLng(
                  item.lat.S, item.lng.S),
              weight: item.appraised.S
            }
        )
      });

      let heatmap = new google.maps.visualization.HeatmapLayer({
        data: allAddrs,
        map: map
      });
    }
  });


}

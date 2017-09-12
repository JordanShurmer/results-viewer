//Some globals
let heatmap, allData;

//Improve mobile map viewing
if (navigator.userAgent.indexOf('iPhone') !== -1
    || navigator.userAgent.indexOf('Android') !== -1) {
  let mapdiv = document.getElementById("map");
  mapdiv.style.width = '100%';
  mapdiv.style.height = '100%';
}

/**
 * This is the callback function used by the google maps code.
 * I.e. This function will get invoked after the google JS loads
 */
function initMap() {
  //create a greyed-out map

  //create the map
  let map = new google.maps.Map(document.getElementById('map'),
      {
        zoom: 13,
        center: new google.maps.LatLng(35.966566, -83.939979),
        mapTypeControlOptions: {
          mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
            'gray_map']
        }
      });

  //Associate the gray map with the MapTypeId and set it to display.
  map.mapTypes.set('gray_map', new google.maps.StyledMapType(MAPSTYLES.gray, {name: 'Gray Map'}));
  map.setMapTypeId('gray_map');

  //AWS Connection
  let dynamodb = new AWS.DynamoDB({
    accessKeyId: "AKIAJRC2BMR6AP5KF3NA",
    secretAccessKey: "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",
    region: "us-east-1",
    logger: console
  });

  //load data from dynamo
  dynamodb.scan({TableName: "ViewerData"}, (error, data) => {

    if (error !== null) {
      //TODO: display this on page in a useful way somehow
      console.error("DynamoDB Error", error);

    } else {
      console.info("Successful DynamoDB request");
      console.debug(data);

      //Save the data
      allData = data.Items;

      //Build the Heatmap layer
      heatmap = new google.maps.visualization.HeatmapLayer({
        map: map
      });

      //set the heatmap data
      setHeatmapData('assessed');
    }
  });

}

function setHeatmapData(attributeName) {
  let heatMapData = [];
  //Add each address to the list of addresses, with a weight coming from the attributeName passed in
  allData.forEach(item => {
    console.debug("Adding item to heatmap data", item);
    heatMapData.push({
      location: new google.maps.LatLng(item.lat.S, item.lng.S),
      weight: item[attributeName].S
    })
  });

  console.debug("Setting heatmap data", heatMapData);
  heatmap.setData(heatMapData);
}

MAPSTYLES = {
  gray: [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dadada"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c9c9c9"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    }
  ]
};

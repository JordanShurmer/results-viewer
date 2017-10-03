//Some globals
let heatmap, allData;

// Improve mobile map viewing
if (navigator.userAgent.indexOf('iPhone') !== -1
    || navigator.userAgent.indexOf('Android') !== -1) {
  let mapdiv = document.getElementById("map");
  mapdiv.style.width = '100%';
  mapdiv.style.height = '100%';
}

//AWS Connection
const dynamodb = new AWS.DynamoDB({
  accessKeyId: "AKIAJRPDORRULGRBZLQA",
  secretAccessKey: "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",
  region: "us-east-1",
  logger: console
});

/**
 * This is the callback function used by the google maps code.
 * I.e. This function will get invoked after the google JS loads
 */
function initMap() {
  //create the map
  let map = new google.maps.Map(document.getElementById('map'),
      {
        zoom: 11,
        center: new google.maps.LatLng(35.966566, -83.939979),
        mapTypeControlOptions: {
          mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
            'gray_map']
        }
      });

  //Associate the gray map with the MapTypeId and set it to display.
  map.mapTypes.set('gray_map', new google.maps.StyledMapType(MAPSTYLES.gray, {name: 'Gray Map'}));
  map.setMapTypeId('gray_map');

  //Build the Heatmap layer
  heatmap = new google.maps.visualization.HeatmapLayer({
    map: map
  });


  //load data from dynamo
  dynamodb.scan({TableName: "ViewerData"}, (error, data) => {

    if (error !== null) {
      //TODO: display this on page in a useful way somehow
      console.error("DynamoDB Error", error);

    } else {
      console.info("Successful DynamoDB request");
      console.debug(data);

      //Cache the data
      allData = data.Items;

      //Add the buttons
      console.info("Generating heatmap buttons");
      let buttonContainer = document.getElementById("heatmap-buttons");
      let template = document.getElementById("T-heatmap-button");
      let allAttributes = {};
      allData.filter(item => item.lat.S && item.lng.S)
      .forEach(item => {
        Object.keys(item)
        .filter(attribute => "parcelId" !== attribute && "lat" !== attribute && "lng" !== attribute)
        .forEach(attribute => allAttributes[attribute] = true)
      });
      Object.keys(allAttributes).forEach(attribute => {
        console.debug(`Adding ${attribute} button`);
        let button = document.importNode(template.content, true).querySelector('button');
        button.onclick = () => setHeatmapData(attribute);
        button.innerText = attribute;
        buttonContainer.appendChild(button);
      });

      //set the heatmap data
      setHeatmapData('Assessment');
    }
  });


}


function setHeatmapData(attributeName) {
  let heatMapData = allData.filter(item => item.lat.S && item.lng.S)
  .filter(item => item.hasOwnProperty(attributeName))
  .filter(item => item[attributeName].S !== 'Unknown')
  //Add each address to the list of addresses, with a weight coming from the attributeName passed in
  .map(item => {
    return {
      location: new google.maps.LatLng(item.lat.S, item.lng.S),
      weight: parseFloat(item[attributeName].S)
    }
  });

  console.info("Setting heatmap data", heatMapData);
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

//Some globals
let heatmap, allData = [];
let allAttributes = {};
const MAX_VALUE = 300000;

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

const params = {TableName: "ViewerData"};

//IndexdDB checks
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

let db;

function openDB(callback) {
  let idbRequest;
  try {
    idbRequest = window.indexedDB.open('PropertyTaxAssessor', 3);
  } catch (e) {
    console.error("error opening", e);
    throw e;
  }
  idbRequest.onupgradeneeded = (event) => {
    db = event.target.result;

    // Create an objectStore for this database
    db.createObjectStore("all-data", {autoIncrement: true}).transaction.oncomplete = (event) => {
      reloadData();
    }
  };

  idbRequest.onsuccess = (event) => {
    db = event.target.result;
    db.onerror = (event) => {
      console.error("IndexedDB error", event.target);
    };
    callback();
  }
}

/**
 * This is the callback function used by the google maps code.
 * I.e. This function will get invoked after the google JS loads
 */
function initMap() {
  //set up the DB

  //create the map
  let map = new google.maps.Map(document.getElementById('map'),
      {
        zoom: 14,
        center: new google.maps.LatLng(36.099546, -83.930513),
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
    map: map,
  });

  openDB(() => {
    //init the data
    initData();
  });
}

function reloadData() {
  //load data from DB
  if (db) {
    allData = [];
    scanForData(() => {
      try {
        //add to the DB
        let objStore = db.transaction('all-data', "readwrite").objectStore('all-data');
        objStore.clear().onsuccess = () => {
          allData.forEach((item) => {
            objStore.put(item);
          });
        }
      } catch (e) {
        console.error("Index DB error", e);
      }

      //set the heatmap data
      setHeatmapData('Appraisal');
    });
  }
}

function initData() {
  //load from DB
  if (db) {

    console.debug("Getting data from DB");
    let objStore = db.transaction('all-data').objectStore('all-data');
    objStore.openCursor().onsuccess = (event) => {
      let cursor = event.target.result;
      if (cursor) {
        allData.push(cursor.value);
        cursor.continue();
      } else {
        console.log("got all stored data");

        //generate the buttons
        console.info("Generating heatmap buttons");
        let buttonContainer = document.getElementById("heatmap-buttons");
        let additionalButtonsContainer = document.getElementById("additional-heatmap-buttons");
        let template = document.getElementById("T-heatmap-button");
        allData.forEach(item => {
          item.AssessmentRatio.S = `${parseFloat(item.AssessmentRatio.S) * 100}`;
          Object.keys(item)
          .filter(attribute => "parcelId" !== attribute && "lat" !== attribute && "lng" !== attribute)
          .forEach(attribute => {
            let currentMax = parseFloat(allAttributes[attribute]) || 0;
            allAttributes[attribute] = Math.max(currentMax, parseFloat(item[attribute].S.replace(',', '')) || 0);
          })
        });
        Object.keys(allAttributes).forEach(attribute => {
          console.debug(`Adding ${attribute} button`);
          let button = document.importNode(template.content, true).querySelector('button');
          button.innerText = attribute;
          button.onclick = () => setHeatmapData(attribute);
          button.dataset['attribute'] = attribute;
          if ('Appraisal' === attribute
              || 'Assessment' === attribute
              || 'AssessmentRatio' === attribute
          ) {
            if ('Appraisal' === attribute) {
              button.classList.add('chosen');
            }
            buttonContainer.appendChild(button);
          } else {
            additionalButtonsContainer.appendChild(button);
          }
        });

        //set the heatmap data
        setHeatmapData('Appraisal');
      }
    };

  }
}

function scanForData(callback) {
  dynamodb.scan(params, (error, result) => {

    if (error !== null) {
      //TODO: display this on page in a useful way somehow
      console.error("DynamoDB Error", error);
    } else {
      console.info("Successful DynamoDB request");
      console.debug(result);

      //Cache the "valid" data
      allData = allData.concat(
          result.Items.filter(item => item.lat.S && item.lng.S && item.Appraisal && item.AssessmentRatio)
          .filter(
              item => !isNaN(parseFloat(item['Appraisal'].S.replace(',', '')))
                  && parseFloat(item['Appraisal'].S.replace(',', '')) < MAX_VALUE
          ).filter(
              item => !isNaN(parseFloat(item['Assessment'].S.replace(',', '')))
                  && parseFloat(item['Assessment'].S.replace(',', '')) < MAX_VALUE
          ).filter(
              item => !item.hasOwnProperty('Bathrooms')
                  || !isNaN(parseFloat(item['Bathrooms'].S.replace(',', '')))
                  && parseFloat(item['Bathrooms'].S.replace(',', '')) < 5
          ).filter(
              item => !item.hasOwnProperty('Zestimate')
                  || !isNaN(parseFloat(item['Zestimate'].S.replace(',', '')))
                  && parseFloat(item['Zestimate'].S.replace(',', '')) < MAX_VALUE
          ).filter(
              item => !isNaN(parseFloat(item['AssessmentRatio'].S))
                  && parseFloat(item['AssessmentRatio'].S) < 1)
      );

      if (result.LastEvaluatedKey) {
        params.ExclusiveStartKey = result.LastEvaluatedKey;
        scanForData(callback);
      } else {
        callback();
      }
    }
  });
}

function setHeatmapData(attributeName) {
  let heatMapData = allData.filter(item => item.lat.S && item.lng.S)
  .filter(item => item.hasOwnProperty(attributeName))
  .filter(item => !isNaN(parseFloat(item[attributeName].S)))
  //Add each address to the list of addresses, with a weight coming from the attributeName passed in
  .map(item => {
    return {
      location: new google.maps.LatLng(item.lat.S, item.lng.S),
      weight: parseFloat(item[attributeName].S.replace(',', ''))
    }
  });

  let options = {
    data: heatMapData,
  };
  if (allAttributes.hasOwnProperty(attributeName)) {
    console.debug(`max intensity = ${allAttributes[attributeName]}`);
    options.maxIntensity = allAttributes[attributeName];
  } else {
    options.maxIntensity = 0;
  }
  heatmap.setOptions(options);

  document.querySelectorAll('button.chosen').forEach(button => button.classList.remove('chosen'));
  document.querySelector(`button[data-attribute=${attributeName}]`).classList.add('chosen');

}

const MAPSTYLES = {
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

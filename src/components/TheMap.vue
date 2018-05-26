<template>
  <div class="the-map">
    <div id='style-menu'>
      <label>
        <input
          v-model="styleChoice"
          id='basic' type='radio' name="styletoggle" value='basic' checked='checked'>
        basic
      </label>
      <label>
        <input
          v-model="styleChoice"
          id='streets' type='radio' name='styletoggle' value='streets'>
        streets
      </label>
      <label>
        <input
          v-model="styleChoice"
          id='bright' type='radio' name='styletoggle' value='bright'>
        bright
      </label>
      <label>
        <input
          v-model="styleChoice"
          id='light' type='radio' name='styletoggle' value='light'>
        light
      </label>
      <label>
        <input
          v-model="styleChoice"
          id='dark' type='radio' name='styletoggle' value='dark'>
        dark
      </label>
      <label>
        <input
          v-model="styleChoice"
          id='satellite' type='radio' name='styletoggle' value='satellite-streets'>
        satellite
      </label>
    </div>


    <div id="map"></div>

  </div>
</template>

<script>
  import axios from 'axios';
  import mapboxgl from 'mapbox-gl';

  mapboxgl.accessToken = 'pk.eyJ1IjoianNodXJtZXIiLCJhIjoiY2pkM3dpZ3RwMHA4bTJxcWZnOXd4ZDdzMCJ9.ntCJOHn6dfVJjRhvfEuWpw';

  export default {
    name: "the-map",
    data() {
      return {
        map: {},
        heatmapLayer: {},
        circlesLayer: {},
        neighborData: {},
        styleChoice: 'basic',

        sources: {alldata: true}
      }
    },
    computed: {
      selectedAttribute() {
        return this.$store.state.selectedAttribute.value;
      }
      // viewerData() {
      //   return this.$store.getters.viewerData;
      // },
      // max() {
      //   return this.$store.getters.currentMax;
      // }

    },
    watch: {
      styleChoice() {
        this.map.on('style.load', this.initMyData);
        this.map.setStyle(`mapbox://styles/mapbox/${this.styleChoice}-v9`);
      },
    },
    async mounted() {
      //create the map
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/basic-v9',
        // center: [-83.966112, 35.936798],
        // zoom: 14
        center: [-83.998522, 35.960773],
        zoom: 11,
      });


      this.heatmapLayer = {
        id: "heatmap-layer",
        type: "heatmap",
        source: "alldata",
        maxzoom: 1,
        paint: {
          // Heatmap assessmentRatio is based on the assessment assessmentRatio
          "heatmap-weight": ["get", "assessmentRatio"],

          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, .2,
            6, .6,
            9, .8,
            10, 1,
            11, 4,
            13, 12,
            15, 29
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparancy color
          // to create a blur-like effect.
          "heatmap-color": [
            "step",
            ["heatmap-density"],
            "rgb(169 ,223 ,191)",
            0.2, "rgb(130 ,224 ,170)",
            0.4, "rgb(82 ,190 ,128)",
            0.6, "rgb(241 ,196 ,15 )",
            0.8, "rgb(230, 126, 34)",
            1, "rgb(192, 57, 43)"
          ],
          // Adjust the heatmap radius by zoom level
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 2,
            9, 4,
            15, 3
          ],
          // Transition from heatmap to circle layer by zoom level
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3, 1,
            14, 1,
            15, 0
          ],
        }
      };

      this.circlesLayer = {
        "id": "circles-layer",
        "type": "circle",
        "source": "alldata",
        "minzoom": 5,
        "paint": {
          // Size circle radius by earthquake magnitude and zoom level
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8, 0,
            9, ["interpolate", ["linear"],
              ["get", "relativeAppraisal"],
              .5, 4,
              1, .5,
              2, 4,
            ],
            11, ["interpolate", ["linear"],
              ["get", "relativeAppraisal"],
              .5, 5,
              1, .8,
              2, 5,
            ],
            16, ["interpolate", ["linear"],
              ["get", "relativeAppraisal"],
              .5, 20,
              1, 2,
              2, 20,
            ]
          ],
          // Color circle by positive or negative
          "circle-color": [
            "step",
            ["get", "relativeAppraisal"],
            "#f44336",
            1, "#009688",
          ],

          "circle-stroke-color": "rgba(255, 255, 255, .2)",
          "circle-stroke-width": 1,
          // Transition from heatmap to circle layer by zoom level
          // "circle-opacity": [
          //   "interpolate",
          //   ["linear"],
          //   ["zoom"],
          //   15, 0,
          //   16, 1
          // ]
        }
      };

      this.map.on('load', this.initMyData);


      this.map.addControl(new mapboxgl.NavigationControl({}));
      this.map.addControl(new mapboxgl.FullscreenControl({}));
      this.map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        showUserLocation: false
      }));


      //*
      //Load all the neighbor data
      //*
      this.neighborData = (await axios.get("https://s3.amazonaws.com/spatial-data-web-support/neighbor-data.json.gz")).data
      console.debug("neighborData", typeof this.neighborData)


    },
    methods: {
      initMyData() {
        this.map.addSource('alldata', {
          "type": "geojson",
          "data": 'https://s3.amazonaws.com/spatial-data-web-support/allData.json.gz'
        });

        const layers = this.map.getStyle().layers;
        // Find the index of the first symbol layer in the map style
        let firstSymbolLayer;
        for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol') {
            firstSymbolLayer = layers[i].id;
            break;
          }
        }
        // this.map.addLayer(this.heatmapLayer, firstSymbolLayer);
        this.map.addLayer(this.circlesLayer, firstSymbolLayer);
        this.map.setFilter('circles-layer', ["all",
            // ["==", ["typeof", ["get", "assessment"]], "number"],
            // ["==", ["typeof", ["get", "appraisal"]], "number"],
            ["==", ["typeof", ["get", "relativeAppraisal"]], "number"],
          ]
        );

        this.map.addSource('neighbors', {
          "type": "geojson",
          "data": {
            "type": "FeatureCollection",
            "features": []
          }
        });
        for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol') {
            firstSymbolLayer = layers[i].id;
            break;
          }
        }
        this.map.addLayer({
            "id": 'neighbor-layer',
            "type": "circle",
            "source": 'neighbors',
            "minzoom": 5,
            "paint": {
              "circle-radius": 9,
              "circle-color": "#cddc39",
              "circle-stroke-color": "rgba(255, 255, 255, .2)",
              "circle-stroke-width": 1,
            }
          }
        );

        this.map.on('click', 'circles-layer', (e) => {
          //*
          //Make a popup and add it to the map
          //*
          let allProps = `<dl class="property-info">`;
          for (let key in e.features[0].properties) {
            if (e.features[0].properties.hasOwnProperty(key)) {
              allProps += `
              <dt class="term">${key}</dt>
              <dd class="definition">${e.features[0].properties[key]}</dd>
            `
            }
          }
          allProps += `</dl>`;

          new mapboxgl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(allProps).addTo(this.map);

          //*
          //Load the neighbors layer for this property
          //*
          const pid = e.features[0].properties.id;
          console.debug(`Adding neighbors layer for parcel ${pid}`);
          const neighbors = this.neighborData[pid];
          if (neighbors) {
            console.debug("Neighbors: ", JSON.stringify(neighbors));
            this.map.getSource('neighbors').setData(neighbors);
          }
        });
      }
    }
  }

</script>

<style scoped lang="scss">

  .the-map {
    height: 100%;
  }

  #map {
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  #style-menu {
    z-index: 2;
    position: absolute;
    background: #fff;
    padding: 10px;
    font-family: 'Open Sans', sans-serif;
  }

  .mapboxgl-ctrl {
    color: #f00;
    background: #000;
    padding: 8px;
    border-radius: 4px;
    margin: 8px;
  }

  .property-info {
    max-width: 20%;
    overflow-y: scroll;
    max-height: 10vh;

    .term {
      font-weight: bold;
    }
  }

</style>

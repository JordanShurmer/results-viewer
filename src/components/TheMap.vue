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
    <template id="map-ctrls">

    </template>
  </div>
</template>

<script>
  import mapboxgl from 'mapbox-gl';

  mapboxgl.accessToken = 'pk.eyJ1IjoianNodXJtZXIiLCJhIjoiY2pkM3dpZ3RwMHA4bTJxcWZnOXd4ZDdzMCJ9.ntCJOHn6dfVJjRhvfEuWpw';

  export default {
    name: "the-map",
    data() {
      return {
        map: {},
        heatmapLayer: {},
        circlesLayer: {},
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
    mounted() {
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
            6, ["interpolate", ["linear"],
              ["get", "assessmentRatio"],
              .1, 5,
              .19, 2,
              .24, .2,
              .35, 2,
              .9, 5,
              100, 7
            ],
            11, ["interpolate", ["linear"],
              ["get", "assessmentRatio"],
              .1, 7,
              .19, 3,
              .24, 1,
              .35, 3,
              .9, 7,
              100, 12
            ],
            13, ["interpolate", ["linear"],
              ["get", "assessmentRatio"],
              .1, 20,
              .19, 7,
              .24, 3,
              .35, 7,
              .9, 20,
              100, 50
            ]
          ],
          // Color circle by earthquake magnitude
          "circle-color": [
            "step",
            ["get", "assessmentRatio"],
            "#525ebe",
            .19, "#52beb8",
            .25, "#52be80",
            .26, "#f1c40f",
            .29, "#E67E22",
            .33, "#C0392B",
            .45, "#681205"
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

      this.map.addControl(new HellowWorldControl());

    },
    methods: {
      initMyData() {
        this.map.addSource('alldata', {
          "type": "geojson",
          "data": 'https://s3.amazonaws.com/spatial-data-web-support/alldata.json.gz'
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
            ["==", ["typeof", ["get", "assessment"]], "number"],
            ["==", ["typeof", ["get", "appraisal"]], "number"],
            ["==", ["typeof", ["get", "assessmentRatio"]], "number"],
          ]
        );

        this.map.on('click', 'circles-layer', (e) => {
          new mapboxgl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(`
<b>Assessment</b>  ${e.features[0].properties.assessment}<br>
<b>Appraisal</b>  ${e.features[0].properties.appraisal}<br>
<b>Assessment Ratio:</b>  ${e.features[0].properties.assessmentRatio}<br>
<b>Parcel ID:</b> ${e.features[0].properties.id} (${e.features[0].properties.lng}, ${e.features[0].properties.lat})`)
            .addTo(this.map);
        });
      }
    }
  }

  class HellowWorldControl {
    onAdd(map) {
      this._map = map;
      this._container = document.createElement('div');
      this._container.className = 'mapboxgl-ctrl';
      this._container.textContent = 'Hello, World!';
      return this._container;
    }

    onRemove() {
      this._container.parentNode.removeChild(this._container);
      this._map = undefined;
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

</style>

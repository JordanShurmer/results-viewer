<template>
  <div class="the-map">
    <div id="map"></div>
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

        sources: {assessmentRatio: true}
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
      selectedAttribute() {
        if (!this.sources[this.selectedAttribute]) {
          this.sources[this.selectedAttribute] = true;
          this.map.addSource(this.selectedAttribute, {
            "type": "geojson",
            "data": `https://s3.amazonaws.com/spatial-data-web-support/${this.selectedAttribute}.json.gz`
          })
        }

        this.heatmapLayer.source = this.selectedAttribute;
        this.circlesLayer.source = this.selectedAttribute;
      }
    },
    mounted() {
      //create the map
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v9',
        center: [-83.998522, 35.960773],
        zoom: 11,
      });


      this.heatmapLayer = {
        id: "heatmap-layer",
        type: "heatmap",
        source: "assessmentRatio",
        maxzoom: 16,
        paint: {
          // Heatmap weight is based on the assessment weight
          "heatmap-weight": ["/", ["get", "weight"], 10],

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
          // "heatmap-opacity": [
          //   "interpolate",
          //   ["linear"],
          //   ["zoom"],
          //   3, 1,
          //   15, 0
          // ],
        }
      };

      this.circlesLayer = {
        "id": "circles-layer",
        "type": "circle",
        "source": "assessmentRatio",
        "minzoom": 15,
        "paint": {
          // Size circle radius by earthquake magnitude and zoom level
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            7, [
              "interpolate",
              ["linear"],
              ["get", "weight"],
              1, 1,
              6, 4
            ],
            16, [
              "interpolate",
              ["linear"],
              ["get", "weight"],
              1, 5,
              6, 50
            ]
          ],
          // Color circle by earthquake magnitude
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "weight"],
            1, "rgba(33,102,172,0)",
            2, "rgb(103,169,207)",
            3, "rgb(209,229,240)",
            4, "rgb(253,219,199)",
            5, "rgb(239,138,98)",
            6, "rgb(178,24,43)"
          ],
          "circle-stroke-color": "white",
          "circle-stroke-width": 1,
          // Transition from heatmap to circle layer by zoom level
          "circle-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            7, 0,
            8, 1
          ]
        }
      };

      this.map.on('load', async () => {
        try {
          this.map.addSource('assessmentRatio', {
            "type": "geojson",
            "data": 'https://s3.amazonaws.com/spatial-data-web-support/assessmentRatio.json.gz'
          });
          this.map.addLayer(this.heatmapLayer, 'waterway-label');
          this.map.addLayer(this.circlesLayer, 'waterway-label');
        } catch (e) {
          console.error("error in map load callback");
          console.error(e);
        }
      });
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
  }

</style>

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
    props: ['heatmapData'],
    data() {
      return {
        map: {},
      }
    },
    computed: {
      // viewerData() {
      //   return this.$store.getters.viewerData;
      // },
      // max() {
      //   return this.$store.getters.currentMax;
      // }
    },
    watch: {
      // viewerData() {
      //   console.debug("Setting heatmap data");
      //   console.debug("Done setting heatmap data");
      // }
    },
    mounted() {
      //create the map
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v10',
        center: [-83.928522, 35.987773],
        zoom: 10,
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

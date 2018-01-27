<template>
  <div class="the-map">
    <div id="map"></div>
  </div>
</template>

<script>
  import GrayMap from '../map-styles/gray_map';

  export default {
    name: "the-map",
    props: ['heatmapData'],
    data() {
      return {
        map: {},
        heatmap: new google.maps.visualization.HeatmapLayer({
          dissipating: false,
          radius: 0.0003,
        })
      }
    },
    computed: {
      viewerData() {
        return this.$store.getters.viewerData;
      }
    },
    watch: {
      viewerData() {
        console.debug("Setting heatmap data");
        this.heatmap.setData(this.viewerData);
        console.debug("Done setting heatmap data");
      }
    },
    mounted() {
      //create the map
      let mapdiv = document.getElementById("map");
      const options = {
        zoom: 14,
        center: new google.maps.LatLng(35.987773, -83.928522),
        mapTypeControlOptions: {
          mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', 'gray_map']
        }
      };
      this.map = new google.maps.Map(mapdiv, options);
      this.map.mapTypes.set('gray_map', new google.maps.StyledMapType(GrayMap, {name: 'Gray Map'}));
      this.map.setMapTypeId('gray_map');

      this.heatmap.setMap(this.map);
      this.heatmap.setData(this.viewerData);
    }
  }
</script>

<style scoped lang="scss">

  #map {
    width: 100%;
    height: 100%;
  }

</style>

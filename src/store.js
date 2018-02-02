import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex);


async function populateAndCacheData() {
}

export default new Vuex.Store({
  state: {
    selectedAttribute: {value: 'assessmentRatio'},
    allData: [],
    maxValues: {
      assessmentRatio: 99,
      assessment: 150000,
      appraisal: 400000,
      yearBuilt: 2018,
      yearAssessed: 2018,
      zestimate: 400000,
    },
    range: [0, 26],
  },
  getters: {
    geoJson(state) {
    },
    currentMax(state) {
      return state.maxValues[state.selectedAttribute.value];
    },
    viewerData(state) {
      const selection = state.selectedAttribute.value;
      return state.allData
        .filter(item => item.hasOwnProperty(selection))
        .filter(item => item[selection] > state.range[0] && item[selection] < state.range[1])
        //return a list of {location, weight} items to be used in the heatmap
        .map(item => {
          return {
            location: [item.lat, item.lng],
            weight: item[selection],
          }
        })
    }
  },
  mutations: {
    selectAttribute(state, value) {
      state.selectedAttribute = value;
    },
    setData(state, allData) {
      state.allData = allData;
    },
    range(state, range) {
      state.range = range;
    }
  },
  actions: {

    /**
     * refresh the data
     * This updates the store's state and the localforage cache
     * @returns {Promise<void>} which resolves when all data has been retrieved
     */
    async refresh(context) {
      try {
        await localforage.clear();
        console.debug('Database is now empty.');

        const allData = await populateAndCacheData();
        console.debug(`Got ${allData.length} new items`);
        context.commit('setData', allData);

      } catch (err) {
        console.error("Error refreshing data", err);
      }
    },

    /**
     * Load the data stored in Local Forage
     * @returns {Promise<void>} which resolved when all the data has been initialized and committed to the store
     */
    async init({commit, state}) {
      try {

        commit('setGeoJson', response.data);

      } catch (e) {
        console.error(`Could not get ${state.selectedAttribute.value} geojson`);
        console.error(e);
      }

    }
  },
});

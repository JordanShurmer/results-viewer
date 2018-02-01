import Vue from 'vue'
import Vuex from 'vuex'
import localforage from 'localforage'
import axios from 'axios'

Vue.use(Vuex);


async function populateAndCacheData() {
  const response = await axios.get('https://s3.amazonaws.com/spatial-data-web-support/viewer-data.json');

  //save the item (don't await so that we can move on while it's being saved)
  localforage.setItem('viewerdata-all', response.data);

  return response.data.map((item) => {
    item.assessmentRatio = item.assessmentRatio*100;
    return item;
  });
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
    range: [0, 26]
  },
  getters: {
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
            location: new google.maps.LatLng(item.lat, item.lng),
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
    async init(context) {
      const localAllData = await localforage.getItem('viewerdata-all');
      context.commit('setData', localAllData);

    }
  },
});

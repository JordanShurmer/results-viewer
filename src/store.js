import Vue from 'vue'
import Vuex from 'vuex'
import localforage from 'localforage'
import DynamoDB from 'aws-sdk/clients/dynamodb'

Vue.use(Vuex);

//set up the DB connection
const dynamodb = new DynamoDB({
  apiVersion: '2012-08-10',
  region: "us-east-1",
  accessKeyId: "AKIAJRPDORRULGRBZLQA",
  secretAccessKey: "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",
  logger: console
});


function scanForViewerData() {
  const request = dynamodb.scan({TableName: "ViewerData"});

  let pageNum = 0;
  return new Promise((resolve, reject) => {
    let viewerData = new Array(250000);

    request.eachPage((err, data) => {
      if (err) {
        console.error("Error getting ViewerData page from DyanamoDB", err);
        reject(err);
      }

      if (data === null) {
        console.debug("Got all pages from dynamodb");
        resolve(viewerData);
      }

      if (data && data.Items) {
        try {
          console.debug("Got a page of ViewerData", data);
          localforage.setItem(`viewerdata-${pageNum++}`,
            data.Items.filter(item => {
              return item.lat.S
                && item.lng.S
                // && item.RoomCount
                // && item.Appraisal
                && item.AssessmentRatio
            })
          )
            .then((value) => {
              viewerData.push(...value);
              // viewerData = value;
            })
            .catch((err) => {
              console.error(err);
            });
        } catch (e) {
          console.error(e);
          reject(e);
        }
      }
    });
  });
}

export default new Vuex.Store({
  state: {
    selectedAttribute: {value: 'AssessmentRatio'},
  },
  getters: {
    viewerData(state) {
      const selection = state.selectedAttribute.value;
      return heatmapData
        .filter(item => item.hasOwnProperty(selection))
        .filter(item => !isNaN(parseFloat(item[selection].S.replace(',', ''))))

        //return a list of {location, weight} items to be used in the heatmap
        .map(item => {
          return {
            location: new google.maps.LatLng(item.lat.S, item.lng.S),
            weight: parseFloat(item[selection].S.replace(',', ''))
          }
        })
    }
  },
  mutations: {
    selectAttribute(state, value) {
      state.selectedAttribute = value;
    },
    setData(state, allData) {
      heatmapData = allData;
    }
  },
  actions: {

    /**
     * refresh the data from dynamodb.
     * This updates the store's state as results come back from dynamo.
     * @returns {Promise<void>} which resolves when all data has been retrieved
     */
    async refresh(context) {
      try {
        await localforage.clear();
        console.log('Database is now empty.');
        const viewerData = await scanForViewerData();
        context.commit('setData', viewerData);

      } catch (err) {
        // This code runs if there were any errors
        console.log(err);
      }
    },

    /**
     * Load the data stored in Local Forage
     * @returns {Promise<void>} which resolved when all the data has been initialized and committed to the store
     */
    async init(context) {
      const localViewerData = new Array(250000);
      let i = 0;
      const keys = await localforage.keys();
      let allPages = [];
      for (let k = 0; k < keys.length; k++) {
        let key = keys[k];
        console.debug(`Local Forage key ${key}`);
        if (key.startsWith("viewerdata-")) {
          allPages.push(localforage.getItem(key));
        }
      }

      console.debug(`Got ${allPages.length} pages of data from local forage`);
      await Promise.all(allPages).then(pageDatas => {
        pageDatas.forEach(pageData => {
          console.debug(`Another localforage page starting at index ${i}`);
          pageData.forEach(datum => {
            localViewerData[i++] = datum;
          });
        })
      });
      context.commit('setData', localViewerData);

    }
  },
});

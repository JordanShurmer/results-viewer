<template>
  <div class="controls">

    <div class="attribute-selectors">
      <attribute-selector v-for="attr in allAttributes"
                          :key="attr.value"
                          :attr="attr"
                          v-model="selectedAttribute"
      />
    </div>

    <div class="range-filter">
      Max value
      <vue-slider-component
        :min="ranges[selectedAttribute.value].min"
        :max="ranges[selectedAttribute.value].max"
        :interval="ranges[selectedAttribute.value].interval"
        @drag-end="setRange"
        v-model="selectedRange"
        class="range-slider"
      />
    </div>

    <div class="cache-controls">
      <button
        class="minimal"
        @click="$store.dispatch('refresh')">
        <mdi-refresh-icon/>
      </button>
    </div>
  </div>
</template>

<script>
  import AttributeSelector from "./AttributeSelector";
  import 'mdi-vue/RefreshIcon'
  import VueSliderComponent from "vue-slider-component/src/vue2-slider";

  const allAttributes = [
    {
      value: 'assessmentRatio',
      label: 'Assessment Ratio',
      min: 0,
      max: 100,
      interval: 5,
      start: 26,
    },
    {
      value: 'assessment',
      label: 'Assessment',
      min: 5000,
      max: 350000,
      interval: 10000,
      start: 120000,
    },
    {
      value: 'appraisal',
      label: 'Appraisal',
      min: 50000,
      max: 1000000,
      interval: 10000,
      start: 400000,
    }
  ];

  const ranges = {};
  allAttributes.forEach(attr => {
    ranges[attr.value] = {
      min: attr.min,
      max: attr.max,
      value: [attr.min, attr.start]
    }
  });

  export default {
    components: {
      VueSliderComponent,
      AttributeSelector
    },
    name: "the-controls",
    data() {
      return {
        allAttributes,
        ranges,
        selectedRange: [0,26]
      }
    },

    computed: {
      selectedAttribute: {
        get() {
          return this.$store.state.selectedAttribute || this.allAttributes[0];
        },

        set(value) {
          this.selectedRange = ranges[value.value].value;
          this.$store.commit('selectAttribute', value);
          this.$store.commit('range', this.selectedRange);
        }
      },
    },
    methods: {
      setRange() {
        console.debug(`Commit range ${this.selectedRange}`);
        this.$store.commit('range', this.selectedRange);
      }
    }
  }
</script>

<style scoped>

  .range-slider {
    margin-top: 30px;
  }

</style>

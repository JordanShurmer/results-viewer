<template>
  <div class="controls">

    <div class="attribute-selectors">
      <attribute-selector v-for="attr in allAttributes"
                          :key="attr.value"
                          :attr="attr"
                          v-model="selectedAttribute"
      ></attribute-selector>
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

  const allAttributes = [
    {
      value: 'AssessmentRatio',
      label: 'Assessment Ratio',
    },
    {
      value: 'Assessment',
      label: 'Assessment',
    },
    {
      value: 'Appraisal',
      label: 'Appraisal',
    }
  ];

  export default {
    components: {AttributeSelector},
    name: "the-controls",
    data() {
      return {
        allAttributes: allAttributes,
      }
    },
    computed: {
      selectedAttribute: {
        get() {
          return this.$store.state.selectedAttribute || this.allAttributes[0];
        },
        set(value) {
          this.$store.commit('selectAttribute', value);
        }
      }
    }
  }
</script>

<style scoped>

</style>

<template>
  <div class="pretty p-default p-round p-thick">
    <input id="assessmentRatio-button"
           type="radio"
           name="attributeSelector"
           @change="$emit('input', attr)"
           :checked="value.value === attr.value"
           />
    <div class="state p-success-o">
      <label for="assessmentRatio-button">{{ attr.label || attr.value }}</label>
    </div>
  </div>
</template>

<script>
  export default {
    name: "attribute-selector",
    props: ['value', 'attr'],
  }
</script>

<style scoped>

</style>

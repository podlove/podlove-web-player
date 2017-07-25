<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
    <path :fill="color" d="M24 10.935v2.131l-8 3.947v-2.23l5.64-2.783-5.64-2.79v-2.223l8 3.948zm-16 3.848l-5.64-2.783 5.64-2.79v-2.223l-8 3.948v2.131l8 3.947v-2.23zm7.047-10.783h-2.078l-4.011 16h2.073l4.016-16z" />
  </svg>
</template>

<script>
export default {
  props: ['color']
}
</script>

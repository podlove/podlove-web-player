<template>
  <svg v-if="muted || volume <= 0" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 21">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <g :stroke="color || 'currentColor'">
          <polyline points="9 17 12.5 20.5 12.5 12"></polyline>
          <path d="M12.5,6 L12.5,0.5 L5.5,7.5 L2,7.5 C1.172,7.5 0.5,8.172 0.5,9 L0.5,12 C0.5,12.828 1.172,13.5 2,13.5 L4.5,13.5"></path>
          <path d="M15.5,10.5 C15.5,11.881 14.381,13 13,13 L12.5,13"></path>
          <path d="M1.5,20.5 L21.5,0.5"></path>
        </g>
    </g>
  </svg>
  <svg v-else-if="!muted && volume > 0 && volume <= 25" width="18" height="21" viewBox="0 0 18 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <g :stroke="color || 'currentColor'">
          <path d="M5.5,7.5 L2,7.5 C1.172,7.5 0.5,8.172 0.5,9 L0.5,12 C0.5,12.828 1.172,13.5 2,13.5 L5.5,13.5 L12.5,20.5 L12.5,0.5 L5.5,7.5 L5.5,7.5 Z"></path>
          <path d="M15.5,7 C16.625,7.818 17.5,9.002 17.5,10.5 C17.5,11.998 16.626,13.182 15.5,14"></path>
        </g>
    </g>
  </svg>
  <svg v-else-if="!muted && volume > 25 && volume <= 50" width="21" height="21" viewBox="0 0 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <g :stroke="color || 'currentColor'">
          <path d="M5.5,7.5 L2,7.5 C1.172,7.5 0.5,8.172 0.5,9 L0.5,12 C0.5,12.828 1.172,13.5 2,13.5 L5.5,13.5 L12.5,20.5 L12.5,0.5 L5.5,7.5 L5.5,7.5 Z"></path>
          <path d="M17.5,4.5 C19.167,5.876 20.5,8.17 20.5,10.5 C20.5,12.826 19.162,15.125 17.5,16.5"></path>
          <path d="M15.5,7 C16.625,7.818 17.5,9.002 17.5,10.5 C17.5,11.998 16.626,13.182 15.5,14"></path>
        </g>
    </g>
  </svg>
  <svg v-else width="24" height="21" viewBox="0 0 24 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g :stroke="color || 'currentColor'">
            <path d="M5.5,7.5 L2,7.5 C1.172,7.5 0.5,8.172 0.5,9 L0.5,12 C0.5,12.828 1.172,13.5 2,13.5 L5.5,13.5 L12.5,20.5 L12.5,0.5 L5.5,7.5 L5.5,7.5 Z"></path>
            <path d="M20,2.5 C22.201,4.425 23.5,7.346 23.5,10.5 C23.5,13.654 22.201,16.575 20,18.5"></path>
            <path d="M17.5,4.5 C19.167,5.876 20.5,8.17 20.5,10.5 C20.5,12.826 19.162,15.125 17.5,16.5"></path>
            <path d="M15.5,7 C16.625,7.818 17.5,9.002 17.5,10.5 C17.5,11.998 16.626,13.182 15.5,14"></path>
          </g>
      </g>
  </svg>
</template>

<script>
  export default {
    props: ['color', 'volume', 'muted']
  }
</script>


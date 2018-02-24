<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <path fill="none" :stroke="color || 'currentColor'" stroke-width=".82229346" d="M2.7270036 9.5946722h16.035961v8.6017895H2.7270036z"/>
    <path fill="none" :stroke="color || 'currentColor'" stroke-width=".79365057" d="M.93963873 6.5861716h16.42688v2.0641451h-16.42688z" transform="matrix(.96632 -.25733 .22394 .9746 0 0)"/>
    <path fill="#fff" fill-rule="evenodd" :stroke="color || 'currentColor'" stroke-width=".82200003" d="M3.3859545 8.5247829a.84745765.80508476 0 0 1-.7612853.8781919.84745765.80508476 0 0 1-.9256172-.7218293.84745765.80508476 0 0 1 .7583533-.8804784.84745765.80508476 0 0 1 .9280194.71904" stroke-linecap="round"/>
    <path fill="#fff" fill-rule="evenodd" :stroke="color || 'currentColor'" stroke-width=".72010225" d="M2.6609156 9.4405775h16.118847v2.2205417H2.6609156z" stroke-linecap="round"/>
    <path fill="none" :stroke="color || 'currentColor'" stroke-width="1.10197592" d="M6.0140037 11.598303l1.9198581-2.2124744M3.3868851 11.598303l1.9198581-2.2124744m3.1648876 2.3819664l1.9198582-2.2124749m.70726 2.1277289l1.919858-2.2124747m.792007 2.1277287l1.919858-2.2124745m.622514 2.2124745l1.919858-2.2124745"/>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>

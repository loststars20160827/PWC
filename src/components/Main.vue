<template>
  <div class="wrap">
    <NavigationBar />
      <div class="main-part">
        <router-view />
      </div>
  </div>
</template>

<script>
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'Main',
  components:{
    NavigationBar
  },
  data(){
    return{

    }
  }
}
</script>

<style scoped>
.wrap{
  height: 100%;
}
.main-part{
  height:100%;
}
</style>

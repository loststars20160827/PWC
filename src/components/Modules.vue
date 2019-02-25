<template>
  <el-container class="whole">
    <el-header class="spec-head" height="48">
      <PathNavigator v-bind:path="[{ name: '首页', link: 1}]"></PathNavigator>
    </el-header>
    <!-- <div v-if="modules.length == 0">模板不存在</div> -->

    <div v-if="dataLoaded" class="wrap">
      <div class="whole-wrap" v-if="hasModule">
        <div v-for="module in modules" v-bind:key="module.id" class="module-wrap" @click="enterModule(module)">
          <img :src="module.img" alt="">
          <div>{{module.name}}</div>
        </div>
      </div>
      <div v-else class="has-no-module">
        暂无模块
      </div>
    </div>
    <div class="loader" v-else>
      数据加载中...
    </div>
    
  </el-container>
</template>

<script>
import PathNavigator from './PathNavigator.vue'
import Vue from 'vue'

export default {
  name: 'Modules',
  components: {
    PathNavigator
  },
  data: function() {
    return {
      dataLoaded: false,
      modules:[],
      hasModule: false
    }
  },
  methods: {
    getData:function(){
      if(this.$store.state.role == 'ROLE_ADMIN2'){
        this.modules = [{
          id:1,
          name:'用户管理',
          img:require('../image/用户管理.png')
        },{
          id:2,
          name:'数据管理',
          img:require('../image/数据管理.png')
        },{
          id:3,
          name:'ESG管理',
          img:require('../image/数据管理.png')
        },]
        this.hasModule = true
        this.dataLoaded = true
      } else {
        this.$axios.get(`/api/companies/getModules/${this.$store.state.companyId}`,{
          headers:{
            'authorization':localStorage.getItem('token')
          }
        })
        .then(res => {
          if(res.status == 200){
            this.modules = res.data
            this.sortChinese(this.modules,'name')
            this.hasModule = true
            this.modules.forEach(ele => {
              let img = require('../image/'+ele.name+'.png')
              Vue.set(ele,'img',img)
            });
            this.dataLoaded = true
          } else if(res.status == 204){
            this.hasModule = false
          }
        })
        .catch(err => {
          console.log(err)
          if(err.response.status == 403){
            this.$router.push('/403')
          }
        })
      }
    },
    enterModule:function(module){
      if(module.name == '模板管理'){
        this.$axios.get(`/api/templates/getTemplate/${this.$store.state.companyId}`,{
          headers:{
            'authorization':localStorage.getItem('token')
          }
        })
        .then(res => {
          let template = res.data
          this.$router.push(`/main/templateForm/${this.$store.state.companyId}/${template.name}-${template.id}`)
        })
      } else if(module.name == '用户管理') {
        this.$router.push(`/main/companyUsers/${this.$store.state.companyId}`)
      }else if(module.name == '数据管理') {
        this.$router.push('/main/dataManagement')
      } else if(module.name == 'ESG管理') {
        this.$router.push('/main/esgManagement')
      } else {
        this.$router.push(`/main/module/${module.name}-${module.id}`)
      }
    },
    sortChinese:function(arr, dataLeven) {
      function getValue (option) { // 参数： option 数组元素
        if (!dataLeven) return option
        var data = option
        dataLeven.split('.').filter(function (item) {
          data = data[item]
        })
        return data + ''
      }
      arr.sort(function (item1, item2) {
        return getValue(item1).localeCompare(getValue(item2), 'zh-CN');
      })
    }
  },
  mounted: function() {
    
  },
  created(){
    this.modules=[]
    this.getData()
  },
  beforeRouteEnter:function(to,from,next){
    next(vm => {
      if(vm.$store.state.role == 'ROLE_ADMIN1'){
        vm.$router.push('/403')
      }
    })
    // next()
  }
}
</script>

<style scoped>
.whole {
  height: 100% !important;
  text-align: center;
}
.spec-head {
  padding: 0;
  margin: 0;
}
.wrap{
  height:100%;
  width:100%;
  position: relative;
  text-align: center;
}
.has-no-module{
  color:#777;
  font-size: 20px;
}
.whole-wrap{
  margin: 30px 0;
  min-width: 260px;
  max-width: 1040px;
  display: inline-block;
}
.module-wrap{
  width: 200px;
  height: 200px;
  border:1px solid #E47808;
  border-radius: 5px;
  float: left;
  margin:20px 29px;
  text-align: center;
  position: relative;
}
.module-wrap img{
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
}
.module-wrap div{
  position: absolute;
  left: 50%;
  top: 75%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  color: #E47808;
}
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }

</style>

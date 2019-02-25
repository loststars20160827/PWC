<template>
  <div class="whole">
    <NavigationBar />
    <el-row style="height:100%">
      <el-col :span="4" style="height:inherit">
        <el-menu
        :default-active="$route.path"
        style="height:inherit"
        router>
        <el-menu-item
        v-for="item in menu" :key="item.index" :index="item.index">
          <i :class="item.icon"></i>
          <span slot="title" style="margin-left:10px">{{item.name}}</span>
        </el-menu-item>
      </el-menu>
      </el-col>
      <el-col :span="20" style="height:inherit">
        <router-view></router-view>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'HomePage',
  components: {
    NavigationBar
  },
  data: function() {
    return {
      menu:[],
      itemsFirst:[{
        index:'/homepage/templateList',
        name:'模板管理',
        icon:'iconfont icon-mobanguanli'
      },{
        index:'/homepage/guests',
        name:'客户管理',
        icon:'iconfont icon-kehu'
      },{
        index:'/homepage/analysis',
        name:'数据管理',
        icon:'iconfont icon-shuju'
      }],
      itemsSecond:[{
        index:`/homePage/companyUsers/${this.$store.state.companyId}`,
        name:'用户管理',
        icon:'iconfont icon-yonghuguanli'
      },{
        index:'/homepage/dataManagement',
        name:'数据管理',
        icon:'iconfont icon-shuju'
      },{
        index:'/homepage/esgManagement',
        name:'ESG管理',
        icon:'iconfont icon-huobanguanli'
      }],
    }
  },
  methods: {
    
  },
  mounted: function() {
    if(this.$store.state.role == 'ROLE_ADMIN1'){
      this.menu = this.itemsFirst
    } else {
      this.menu = this.itemsSecond
    }
  },
  beforeRouteEnter:function(to,from,next){
    // next(vm => {
    //   if(vm.$store.state.role != 'ROLE_ADMIN1'){
    //     vm.$router.push('/403')
    //   }
    // })
    next()
  }
}
</script>

<style scoped>
.whole {
  height: 100% !important;
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

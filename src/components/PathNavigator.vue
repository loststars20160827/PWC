<template>
  <div class="navigator">
    <el-breadcrumb seperator-class="el-icon-arrow-right">
      <el-breadcrumb-item v-for="item in path" v-bind:key="item.link" :to="{path:jumpHandler(item.name)}">{{ item.name }}</el-breadcrumb-item>
    </el-breadcrumb>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'PathNavigator',
  data: function() {
    return {}
  },
  props: {
    path: Array
  },
  methods:{
    jumpHandler:function(name){
      switch(name){
        case '首页': 
          if(this.$store.state.role == 'ROLE_ADMIN1'){
            return '/homepage/templateList'
          } else if(this.$store.state.role == 'ROLE_ADMIN2'){
            return `/homePage/companyUsers/${this.$store.state.companyId}`
          } else {
            return '/main/modules'
          }
        case '模板列表':
          if(this.$store.state.role == 'ROLE_ADMIN1'){
            return '/homepage/templateList'
          } 
      }
    }
  }
}
</script>

<style>
.navigator {
  background-color: #f4bd25;
  padding: 16px 0 16px 16px;
  /* border-top: 1px solid lightgray;  border-bottom: 1px solid lightgray; */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.navigator .el-breadcrumb__inner{
  color:#fff;
}
</style>

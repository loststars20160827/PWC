<template>
  <el-container class="whole">
    <div style="margin:20px auto" v-if="dataLoaded" id="transfer-wrap">
      <div>
        <div class="top-bar">
          <!-- <i></i> -->
          <span style="color:white;margin:20px">利益相关方选择</span>
          <el-select placeholder="请选择利益相关方类型" v-model="industry" class="select" size="small">
            <el-option v-for="item in industries" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </div>
        <el-transfer
          style="margin:0 auto"
          filterable
          :filter-method="filterStakeholders"
          filter-placeholder="请输入利益相关方名称"
          v-model="selectedStakeholders"
            :data="stakeholders"
          :props="{key:'id',label:'name'}"
          :titles="['利益相关方', '调研的利益相关方']">
        </el-transfer>
      </div>
      
      <div style="margin:40px auto">
        <div class="top-bar">
          <!-- <i></i> -->
          <span style="color:white;margin:20px">ESG实质性评估议题选择</span>
          <el-select placeholder="请选择议题范畴" v-model="domain" class="select" size="small">
            <el-option v-for="item in domains" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </div>
        <el-transfer
          style="margin:0 auto"
          filterable
          :filter-method="filterTopics"
          filter-placeholder="请输入议题名称"
          v-model="selectedtopics"
            :data="topics"
          :props="{key:'id',label:'content'}"
          :titles="['议题', '实质性评估议题']">
        </el-transfer>
      </div>
    </div>
    


  </el-container>
</template>

<script>
import PathNavigator from './PathNavigator.vue'
import Vue from 'vue'

export default {
  name: 'esgManagement',
  components: {
    PathNavigator
  },
  data: function() {
    return {
      dataLoaded: true,
      stakeholders:[
        {id:1,name:'巴斯夫'},
        {id:2,name:'陶氏杜邦'}
      ],
      selectedStakeholders:[],
      industry:'',
      industries:[],
      topics:[
        {id:1,content:'topic1'},
        {id:2,content:'topic2'}
      ],
      selectedtopics:[],
      domain:'',
      domains:['环境','社会','治理']
    }
  },
  watch:{
    industry:function(){
      this.stakeholders = []
      this.$axios.get(`/api/survey/Stakeholders/${this.industry}`,{
        headers:{
          'authorization':localStorage.getItem('token')
        }
      })
      .then(res => {
        if(res.status == 200){
          let index = 1
          res.data.forEach(ele => {
            this.stakeholders.push({
              id:index,
              name:ele
            })
            index++
          })
        }
      })
    },
    domain:function(){
      this.topics = []
      this.$axios.get(`/api/survey/topics/${this.domain}`,{
        headers:{
          'authorization':localStorage.getItem('token')
        }
      })
      .then(res => {
        if(res.status == 200){
          let index = 1
          res.data.forEach(ele => {
            this.topics.push({
              id:index,
              content:ele
            })
            index++
          })
        }
      })
    }
  },
  methods: {
    getData: function() {
      this.$axios.get('/api/survey/indutries',{
        headers:{
          'authorization':localStorage.getItem('token')
        }
      })
      .then(res => {
        if(res.status == 200){
          this.industries = res.data
        }
      })
    },
    filterStakeholders:function(query,item){
      return item.name.indexOf(query) > -1
    },
    filterTopics:function(query,item){
      return item.content.indexOf(query) > -1
    },
  },
  created:function(){
    this.stakeholders = []
    this.topics = []
    this.getData()
  },
  beforeRouteEnter:function(to,from,next){
    next(vm => {
      if(vm.$store.state.role != 'ROLE_ADMIN2'){
        vm.$router.push('/403')
      }
    })
  }
}
</script>

<style>
.whole {
  height: 100% !important;
}
.spec-head {
  padding: 0;
  margin: 0;
}
.down-part {
  height: 100%;
}
.float-left{
  float: left;
}
#transfer-wrap .el-transfer-panel{
  width: 350px;
}
.top-bar{
  height:40px;
  background-color:#d94721;
  line-height:40px;
}
.select{
  float: right;
  margin-right: 20px;
}
</style>

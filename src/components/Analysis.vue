<template>
  <el-container class="whole">
    <div v-if="dataLoaded" class="down-part">
      <div>
        <el-form :inline="true" ref="form" :model="form" label-width="80px" class="form">
          <el-form-item label="模块">
            <el-select v-model="selectedModuleId" placeholder="请选择模块" >
              <el-option
                v-for="module in modules"
                :key="module.id"
                :label="module.name"
                :value="module.id">
              </el-option>
            </el-select>
          </el-form-item>
        <el-form-item label="父级指标"  v-if="indicators.length">
        <el-cascader
          expand-trigger="hover"
          :options="parentOptions"
          v-model="parentPath">
        </el-cascader>
        </el-form-item>
        <el-form-item label="三级指标" v-if="indicators.length">
          <el-select v-model="selectedThirdIndicator" placeholder="请选择三级指标">
          <el-option
                v-for="(item,index) in indicators[firstIndex].children[secondIndex].children"
                :key="index"
                :label="item"
                :value="item"
                >
              </el-option>
          </el-select>
          
        </el-form-item>
        <el-form-item v-else>
          <span style="color:#999">暂无可分析的三级指标</span>
        </el-form-item>
        
        </el-form>
      </div>
        <div id="chart" style="width:80%;height:400px;margin:0 auto" v-if="hasData">
          <div id="left-chart"></div>
          <div id="right-chart"></div>
        </div>
        <div v-else style="color:#777;font-size:20px">
          暂无数据
        </div>
    </div>

    <div v-else class="loader">
      数据加载中...
    </div>
  </el-container>
</template>

<script>
import PathNavigator from './PathNavigator.vue'

export default {
  name: 'Analysis',
  components: {
    PathNavigator
  },
  data: function() {
    return {
      dataLoaded:false,
      hasData:false,
      parentPath:[],
      selectedThirdIndicator:'',
      form:{
        
      },
      indicators:[
        {
        name:'排放管理',children:[{
          name:'废气管理',children:['二氧化硫','硫化氢','二氧化碳']
          }]
        },{
        name:'能源管理',children:[{
          name:'一级能源',children:['天然气']
          }]
        }
      ],
      data:[{
        companyName:'ABC',
        data: 2.5,
        unit:'m^3'
      },{
        companyName:'DEF',
        data:4.3,
        unit:'m^3'
      },{
        companyName:'GHI',
        data:2.9,
        unit:'m^3'
      }],
      modules:[{
        id: 0,
        name: '环境管理'
      }, {
        id:1,
        name: '安全管理'
      }],
      selectedModuleId: -1
    }
  },
  computed: {
    parentOptions: function() {
      
      let options = []
      let indicators = this.indicators  
      for(let i = 0;i < indicators.length; i++){
        let result = {}
        result.label = indicators[i].name;
        result.value = indicators[i].name;
          let children = indicators[i].children
          result.children = [];
          for(let j = 0;j < children.length;j++){
            result.children.push({
              label: children[j].name,
              value: children[j].name
            })
          }
        options.push(result)
      }
      return options
    },
    firstIndex: function(){
      for(let i = 0; i < this.indicators.length; i++){
        if(this.indicators[i].name == this.parentPath[0]){
          return i
        }
      }
      return 0
    },
    secondIndex: function(){
      if(this.indicators.length){
        let secondIndicators = this.indicators[this.firstIndex].children
        for(let i = 0; i < secondIndicators.length; i++){
          if(secondIndicators[i].name == this.parentPath[1]){
            return i
          }
        }
      }
      return 0
    }
  },
  watch: {
    firstIndex: function(){
      this.selectedThirdIndicator = ''
    },
    secondIndex: function(){
      this.selectedThirdIndicator = ''
    },
    selectedThirdIndicator: function(){
      this.drawLine()
    },
    selectedModuleId: function(){
      this.indicators = []
      this.selectedThirdIndicator = ''
      this.$axios.get(`/api/indicators/${this.selectedModuleId}/getAllLevelOne`,{
        headers:{
          'Authorization': localStorage.getItem('token')
        }
      })
      .then(res => {
        this.indicators = []
        if(res.status == 200){
          let result = {}
          res.data.forEach(first => {
            result.name = first.name
            result.children = []
            let secondIndicators = []
            this.$axios.get(`/api/indicators/${first.id}/children`,{
              headers:{
                'Authorization': localStorage.getItem('token')
              }
            })
            .then(res => {
              if(res.status == 200){
                if(res.data.length){
                  let secondIndicator = {}
                  res.data.forEach(second => {
                    this.$axios.get(`/api/indicators/${second.id}/children`,{
                      headers:{
                        'Authorization': localStorage.getItem('token'),
                        "Content-type": "x-www-form-urlencoded;charset=UTF-8"
                      }
                    })
                    .then(res => {
                      let thirdIndicators = []
                      if(res.status == 200){
                        if(res.data.length){
                          res.data.forEach(third => {
                            if(third.type == 'quantity'){
                              thirdIndicators.push(third.name)
                            }
                          })
                        }
                        if(thirdIndicators.length){
                          if(this.indicators.length == 0){
                            result.children.push({
                              name: second.name,
                              children: thirdIndicators
                            })
                            this.indicators.push(result)
                          } else{
                            thirdIndicators.forEach(third => {
                              
                              let flag1 = 0
                              for(let i = 0; i < this.indicators.length; i++){
                                let firstIndicator = this.indicators[i]
                                if(firstIndicator.name != first.name){
                                  flag1++
                                } else {
                                  let flag2 = 0
                                  for(let j = 0; j < firstIndicator.children.length; j++){
                                    let secondIndicator = firstIndicator.children[j]
                                    // console.log(secondIndicator.name)
                                    // console.log(second.name)
                                    if(secondIndicator.name != second.name){
                                      console.log('1')
                                      flag2++
                                    } else {
                                      let flag3 = 0
                                      for(let k = 0; k < secondIndicator.children.length; k++){
                                        let thirdIndicator = secondIndicator.children[k]
                                        if(thirdIndicator != third.name){
                                          flag3++
                                        }
                                        if(flag3 == secondIndicator.children.length-1&&secondIndicator.children.length!=1){
                                          result.children.push({
                                            name: second.name,
                                            children: thirdIndicators
                                          })
                                          this.indicators.push(result)
                                        }
                                      }
                                    }
                                    if(flag2 == firstIndicator.children.length-1&&firstIndicator.children.length!=1){
                                      result.children.push({
                                        name: second.name,
                                        children: thirdIndicators
                                      })
                                      this.indicators.push(result)
                                    }
                                  }
                                }
                                if(flag1 == this.indicators.length-1&&this.indicators.length!=1){
                                  result.children.push({
                                    name: second.name,
                                    children: thirdIndicators
                                  })
                                  this.indicators.push(result)
                                }
                              }
                            })
                          }
                          this.parentPath = [this.indicators[0].name,this.indicators[0].children[0].name]
                          this.selectedThirdIndicator = this.indicators[0].children[0].children[0]
                          this.drawLine()
                        }
                        
                      }
                      
                    })
                    .catch()
                  })
                }
              }
            })
            .catch()
          })
        }
        
      })
      .catch(err => {

      })
    }
  },
  methods: {
    drawLine:function(){
      this.data = []
      if(this.selectedThirdIndicator == ''){
        this.hasData = false
      } else {
        this.$axios.get('/api/data/'+this.selectedThirdIndicator,{
          headers:{
            'Authorization': localStorage.getItem('token')
          }
        })
        .then(res => {
          if(res.status == 200){
            this.hasData = true
            
            this.data = res.data
            let leftChart = this.$echarts.init(document.getElementById('left-chart'))
            let rightChart = this.$echarts.init(document.getElementById('right-chart'))

            let companyName = []
            let data1 = []
            let data2 = []
            let color = []
            this.data.forEach(ele => {
              companyName.push(ele.companyName)
              data1.push(ele.data)
              data2.push({
                value: ele.data,
                name: ele.companyName
              })
              color.push(this.getColor())
            })
            leftChart.setOption({
                title: {  },
                tooltip: {},
                xAxis: {
                    type: 'category',
                    data: companyName
                },
                yAxis: {
                    type: 'value',
                    axisLabel:{
                      formatter:'{value} '+this.data[0].unit
                    }
                },
                series: [{
                    name:this.selectedThirdIndicator,
                    data: data1,
                    type: 'bar',
                    itemStyle: {
                      normal: {
                        color: function (params){
                          return color[params.dataIndex];
                      }
                      },
                  },
                }]
            })

            rightChart.setOption({
              title : {
                text: this.selectedThirdIndicator,
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: companyName
            },
            series : [
                {
                    name: this.selectedThirdIndicator,
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '60%'],
                    data:data2,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ],
            color: color
            })
          } else if(res.status == 204){
            this.hasData = false
          }
        })
        .catch(err => {})
      }
      
      
  },
  getColor:function(){
    let rgb='rgb('+Math.floor(Math.random()*255)+',' 
      +Math.floor(Math.random()*255)+','  
      +Math.floor(Math.random()*255)+')'
      return rgb
  },
    getData:function(){
      this.$axios.get('/api/modules',{
        headers:{
          'Authorization': localStorage.getItem('token')
        }
      })
      .then(res => {
        if(res.status == 200){
          this.modules = res.data
          this.selectedModuleId = this.modules[0].id
          this.dataLoaded = true
          this.hasData = true
        } 
      })
      .catch(err => {
      
      })
    }
  },
  mounted: function() {
    this.data = []
    this.modules = []
    this.indicators = []
    this.getData()
  },
  beforeRouteEnter:function(to,from,next){
    next(vm => {
      if(vm.$store.state.role != 'ROLE_ADMIN1'){
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
.down-part {
  width: 100%;
}
.select-module{
  margin:20px 0;
}
.select-parent{
  margin:20px 0;
}
.indicator-options{

}
.form{
  margin-top: 30px
}
#left-chart{
  float:left;
  height:inherit;
  width:70%;
}
#right-chart{
  float:left;
  height:inherit;
  width:30%;
}
</style>

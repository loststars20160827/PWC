<template>
  <el-container class="whole">
    <div style="width:90%;margin:20px auto" v-if="dataLoaded">
      <div class="select-module">
        <el-radio-group v-model="selectedModuleName" @change="handleChange">
          <el-radio-button
            v-for="mod in modules" :key="mod.id"
            :label="mod.name">
          </el-radio-button>
        </el-radio-group>
      </div>
      <div style="float:right">
        <el-button @click="submitHandler" plain type="primary">提交</el-button>
      </div>
      <el-table
        :data="tableData"
        :span-method="objectSpanMethod"
        :cell-style="cellStyle"
        border
        fit
        @selection-change="handleSelectionChange">
        <el-table-column prop="firstIndicator" label="一级指标" width="100" align="center"></el-table-column>
        <el-table-column prop="secondIndicator" label="二级指标" width="100" align="center"></el-table-column>
        <el-table-column prop="thirdIndicator.name" label="三级指标" width="100" align="center"></el-table-column>
        <el-table-column label="描述" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.thirdIndicator.type == 'quality'">{{scope.row.thirdIndicator.indicatorDataDTO.context}}</span>
            <el-table
            :data="scope.row.thirdIndicator.data"
            
            v-else>
              <el-table-column 
              v-for="item in tableColumn" 
              :key="item.value" 
              :prop="item.value" 
              :label="item.label" 
              align="center">
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column align="center" label="审核" width="100">
          <template slot-scope="scope" v-if="scope.row.thirdIndicator.name != '指标'" >
            <div v-if="scope.row.thirdIndicator.indicatorDataDTO.status == '通过'">
              <el-button @click="submitSingleHandler(scope.row)" type="text" >提交</el-button>
            </div>
            <div v-if="scope.row.thirdIndicator.indicatorDataDTO.status == '提交'">
              <span style="color:#4ad47e">
                已提交
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="60" align="center" :selectable="isSelectable"></el-table-column>
      </el-table>
    </div>
  </el-container>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'DataManagement',
  data: function() {
    return {
      dataLoaded: false,
      companyId:this.$store.state.companyId,
      selectionPath: [],
      selectedIndicators:[],
      form: {
        selection: null
      }, 
      indicators:[{
        description:'',
          id: 13,
          indicatorDataDTO:{
            context: '',
            id: 0,
            sections: '',
            unit: ''
          },
          level: 1,
          name: '排放管理',
          parent: null,
          type: null,
          moduleId: 1,
          children:[{
              description:'',
              id: 30,
              indicatorDataDTO:{
                context: '',
                id: 0,
                sections: '',
                unit: ''
              },
              level: 2,
              name: '废水管理',
              parent: 13,
              type: null,
              moduleId: 1,
              children: [
                { description: '相关法律法规',id: 31,indicatorDataDTO: {
                    unit: '',
                    sections: '',
                    id: 0,
                    context: '遵守相关法律法规'
                  },level: 3, name: '法律法规', parent: 30,type: 'quality', moduleId: 1},
                { description: '相关管理制度',id: 32, indicatorDataDTO: {
                    unit: '',
                    sections: '',
                    id: 0,
                    context: '遵守相关管理制度'
                  },level: 3, name: '管理制度', parent:30, type: 'quality',moduleId: 1}
              ]
            },
            {
              description: '',
              id: 75,
              indicatorDataDTO:{
                context: '',
                id: 0,
                sections: '',
                unit: ''
              },
              level: 2,
              name: '废气管理',
              parent: 13,
              type: null,
              moduleId: 1,
              children: [
                { description: '废气排放量',  id: 71,indicatorDataDTO: {
                  unit: 'm^3',
                  sections: '',
                  context: null,
                  datas:[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2],
                  status: '待审核'
                }, level: 3, name: '废气排放量',parent:75, type: 'quantity', moduleId: 1},
                { description: '废气利用量',  id: 83,indicatorDataDTO: {
                  unit: 'm^3',
                  sections: '',
                  context: null,
                  datas:[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2],
                  status: '通过'
                
                }, level: 3, name: '废气利用量',parent:75, type: 'quantity', moduleId: 1}
              ]
            }
          ]
      },{
        description:'',
          id: 22,
          indicatorDataDTO:{
            context: '',
            id: 0,
            sections: '',
            unit: ''
          },
          level: 1,
          name: '能源管理',
          parent: null,
          type: null,
          moduleId: 1,
          children:[{
              description:'',
              id: 36,
              indicatorDataDTO:{
                context: '',
                id: 0,
                sections: '',
                unit: ''
              },
              level: 2,
              name: '能源方法',
              parent: 13,
              type: null,
              moduleId: 1,
              children: [
                { description: '相关法律法规',id: 17,indicatorDataDTO: {
                    unit: '',
                    sections: '',
                    id: 0,
                    context: '遵守相关法律法规',
                    status:'退回'
                  },level: 3, name: '法律法规', parent: 30,type: 'quality', moduleId: 1},
                { description: '相关管理制度',id: 18, indicatorDataDTO: {
                    unit: '',
                    sections: '',
                    id: 0,
                    context: '遵守相关管理制度'
                  },level: 3, name: '管理制度', parent:30, type: 'quality',moduleId: 1},
                  { description: '相关管理办法',id: 77, indicatorDataDTO: {
                    unit: '',
                    sections: '',
                    id: 0,
                    context: '遵守相关管理办法'
                  },level: 3, name: '管理办法', parent:30, type: 'quality',moduleId: 1},
              ]
            },
            {
              description: '',
              id: 29,
              indicatorDataDTO:{
                context: '',
                id: 0,
                sections: '',
                unit: ''
              },
              level: 2,
              name: '一级能源',
              parent: 13,
              type: null,
              moduleId: 1,
              children: [
                { description: '废气排放量',  id: 25,indicatorDataDTO: {
                  unit: 'm^3',
                  sections: '',
                  context: null,
                  datas:[1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0,2.1,2.2]
                }, level: 3, name: '某一级能源',parent:75, type: 'quantity', moduleId: 1}
              ]
            }
          ]
      }],
      modules:[{
        id: 1, name: '安全管理'
      },{
        id: 2, name:'环境管理'
      }],
      hasModule:false,
      selectedModuleName: '',
      firstSpan:[],
      secondSpan:[],
      thirdSpan:[],
      tableColumn: [{label:'单位' ,value:'unit' },{label:'1月' ,value:'1月' },{label:'2月' ,value:'2月' },{label:'3月' ,value:'3月' },{label:'4月' ,value:'4月' },
      {label:'5月' ,value:'5月' },{label:'6月' ,value:'6月' },{label:'7月' ,value:'7月' },{label:'8月' ,value:'8月' },{label:'9月' ,value:'9月' },
      {label:'10月' ,value:'10月' },{label:'11月' ,value:'11月' },{label:'12月' ,value:'12月' },{label:'总计' ,value:'total' }]
    }
  },
  methods: {
    isSelectable:function(row,index){
      if(row.thirdIndicator.name!='指标'&&row.thirdIndicator.indicatorDataDTO.status == '通过'){
        return true
      } else {
        return false
      }
    },
    handleChange:function(val){
      let module = this.modules.find(mod => mod.name == val)
      this.getIndicators(module.id)
    },
    objectSpanMethod:function({ row, column, rowIndex, columnIndex }){
      if(columnIndex === 0){
        const _row = this.firstSpan[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
      if(columnIndex === 1){
        const _row = this.secondSpan[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
      if(columnIndex === 3){
        const _row = this.thirdSpan[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    cellStyle:function({ row, column, rowIndex, columnIndex }){
      if(columnIndex === 3){
        const _row = this.thirdSpan[rowIndex]
        if( _row != 0){
          return 'padding:0px;'
        }
      }
      if(columnIndex === 4){
        return 'padding:0px;'
      }
    },
    handleSelectionChange:function(val){
      this.selectedIndicators = val
    },
    submitSingleHandler:function(row){
      this.selectedIndicators.push(row)
      this.submitHandler()
    },
    submitHandler:function(){
      let indicators = this.selectedIndicators
      let submit = []
      for(let i = 0; i < indicators.length ; i++){
        let indicator = indicators[i].thirdIndicator
        if(indicator.name != '指标'&&indicator.indicatorDataDTO.status == '通过'){
          submit.push(indicator.id)
        }
      }
      if(submit.length){
        this.$confirm('是否确认要提交所选指标？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$axios({
            method: 'PUT',
            url: '/api/indicators/submitData',
            data: submit,
            headers: {
              'Authorization': localStorage.getItem('token')
            }
          })
          .then(res => {
            if(res.status == 200){
              this.$message({
                message:'提交成功',
                type:'success'
              })
              this.selectedIndicators.forEach(ele => {
                ele.thirdIndicator.indicatorDataDTO.status = '提交'
              })
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          });          
        })
      } else {
        this.$message({
          message: '没有可以提交的指标',
          type: 'error'
        })
      }
    },
    auditHandler:function(data,status){
      this.$axios({
        method: 'PUT',
        url: `/api/indicators/auditData/${data.thirdIndicator.id}/${status}`,
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      })
      .then(res => {
        if(res.status == 200){
          this.$message({
            message: '操作成功！',
            type: 'success'
          })
          data.thirdIndicator.indicatorDataDTO.status = status
        }
      })
      .catch(err => {
        this.$message({
          message: '操作失败，请重试！',
          type: 'error'
        })
      })
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
    },
    getData: function() {
      this.$axios.get(`/api/companies/getModules/${this.$store.state.companyId}`,{
        headers:{
          'authorization':localStorage.getItem('token')
        }
      })
      .then(res => {
        this.modules = res.data
        this.sortChinese(this.modules,'name')
        this.selectedModuleName = this.modules[0].name
      })
      .then(() => {
        this.getIndicators(this.modules[0].id)
        this.dataLoaded = true
      })  
    },
    getIndicators:function(id){
      this.$axios.get(`/api/modules/${this.companyId}/${id}/indicators`,{
          headers:{
            'authorization':localStorage.getItem('token')
          }
        })
        .then(res => {
          res.data.forEach(first => {
            Vue.set(first,'children',[])
            this.$axios.get(`/api/indicators/${first.id}/children`,{
              headers:{
                'authorization':localStorage.getItem('token')
              }
            })
            .then(res2 => {
              res2.data.forEach(sec => {
                Vue.set(sec,'children',[])
                this.$axios.get(`/api/indicators/${sec.id}/children`,{
                  headers:{
                    'authorization':localStorage.getItem('token')
                  }
                })
                .then(res3 => {
                  let thirdIndicators = []
                  res3.data.forEach(third => {
                    third.moduleId = first.moduleId
                    if(third.type == 'quantity'){
                      if(third.indicatorDataDTO.sections){
                        third.indicatorDataDTO.datas = this.stringToArray(third.indicatorDataDTO.sections)
                      } else {
                        third.indicatorDataDTO.datas = []
                      }
                    }
                    if(third.indicatorDataDTO.status == '通过'||third.indicatorDataDTO.status == '提交'){
                      thirdIndicators.push(third)
                    } 
                  })
                  sec.children = thirdIndicators
                })
                sec.moduleId = first.moduleId
                first.children = res2.data
              })
            })
          })
          this.indicators = res.data
        }).
        catch(err => {})
    },
    stringToArray:function(str){
      let arr = str.split(',')
      for(let i =0;i<arr.length;i++){
        let data = parseFloat(arr[i])
        arr[i] = data
      }
      return arr
    }
  },
  computed:{
    tableData(){
      let data =[]
      if(this.indicators.length){
          let firstIndicators = this.indicators
          
          firstIndicators.forEach(first => {
            let secondIndicators = first.children
            if(secondIndicators.length){
              secondIndicators.forEach(sec => {
              let thirdIndicators = sec.children
              let secondFirstChild = {}
              if(thirdIndicators.length){
                if(thirdIndicators[0].type == 'quantity'){
                  secondFirstChild = {
                    firstIndicator: first.name,
                    secondIndicator: sec.name,
                    thirdIndicator: { name: '指标',type:'quantity',data:[] }
                  }
                  data.push(secondFirstChild)
                }

                thirdIndicators.forEach(third => {
                    if(third.type == 'quantity'){
                      if(true||third.indicatorDataDTO.status == '提交'){
                        let total = 0
                        let table = {}
                        let i = 1
                        third.indicatorDataDTO.datas.forEach(ele => {
                          total += ele
                          let month = (i++)+'月'
                          Vue.set(table,month,ele)
                        })
                        table.total = total.toFixed(2)
                        table.unit = third.indicatorDataDTO.unit
                        data[data.indexOf(secondFirstChild)].thirdIndicator.data.push(table)
                      } 
                    }
                    data.push({
                      firstIndicator: first.name,
                      secondIndicator: sec.name,
                      thirdIndicator: third,
                    })
                  
                })
              }
            })
            }
          })
          
          let firstPos = 0 , secondPos = 0 , thirdPos = 0
          let first = ''
          let second = ''
          
          for(let i = 0 ; i < data.length ; i++){
            if(data[i].firstIndicator == first){
              this.firstSpan.push(0)
              this.firstSpan[firstPos]++
            } else {
              first = data[i].firstIndicator
              this.firstSpan.push(1)
              firstPos = i
            }
            
            if(data[i].secondIndicator == second){
              this.secondSpan.push(0)
              this.secondSpan[secondPos]++
            } else {
              second = data[i].secondIndicator
              this.secondSpan.push(1)
              secondPos = i
            }

            if(data[i].thirdIndicator.type == 'quantity'){
              if(data[i].thirdIndicator.name == '指标'){
                this.thirdSpan.push(1)
                thirdPos = i
              } else {
                this.thirdSpan.push(0)
                this.thirdSpan[thirdPos]++
              }
            } else {
              this.thirdSpan.push(1)
            }
          }
        }
      return data
    }
  },
  created:function(){
    this.indicators = []
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

<style scoped>
.whole {
  height: 100% !important;
  text-align: center;
}
.left-tree {
  border-right: 1px solid lightgray;
  overflow-y: scroll;
}
.spec-head {
  padding: 0;
  margin: 0;
}
.filter-input {
  max-width: 300px;
  max-height: 20px;
  margin-top: -8px;
  margin-right: 20px;
}
.down-part {
  height: 100%;
}
.input-with-select .el-select{
    width: 130px;
}
.float-left{
  float: left;
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
  width: 30px;
}
.right-editor{
  width:80%;
  margin-left: 50px;
}
.select-module{
  float: left;
  margin-bottom: 20px;
}
</style>

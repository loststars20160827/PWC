<template>
  <el-container class="whole">
    <el-header class="spec-head" height="48">
      <PathNavigator v-bind:path="[{ name: '首页', link: 1}, { name: moduleName, link: 2}]">
        <div class="filter-input">
          <el-input size="mini" placeholder="输入文字以筛选指标" v-model="filterText">
            <i slot="suffix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
      </PathNavigator>
    </el-header>
    <el-container v-if="dataLoaded && !check" class="down-part">
      <el-aside class="left-tree">
          <el-tree
            :load="loadNode"
            ref="tree"
            lazy
            :props="indicatorLabels"
            :data="indicators"
            :highlight-current="true"
            :render-content="renderTreeItemContent"
            :expand-on-click-node="false"
            node-key="id"
            @node-click="nodeClickHandler"
            :filter-node-method="filterNode">
          </el-tree>
      </el-aside>
      <el-main >
        <div class="right-editor">
          <div v-if="selectionPath && selectionPath.length > 0">
            <el-breadcrumb class="indicator-path-text" separator-class="el-icon-arrow-right">
              <el-breadcrumb-item v-for="item in selectionPath" v-bind:key="'' + item.level + item.id">{{ item.name }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <el-form v-if="form.selection" ref="form" :model="form">
            <el-form-item label="指标名称">
              <el-input v-model="form.selection.data.name" disabled></el-input>
            </el-form-item>
            <el-form-item label="指标描述">
              <el-input type="textarea" v-model="form.selection.data.description" disabled></el-input>
            </el-form-item>
            <!-- 不在这里修改指标等级和父级节点 -->
            <el-form-item v-if="form.selection.data.type == 'quantity'" label="指标数据">
              <el-input placeholder="请输入数据" v-model="form.selection.data.indicatorDataDTO.datas[selectMonth-1]" class="input-with-select">
                <el-select v-model="selectMonth" slot="prepend" placeholder="请选择">
                  <el-option
                    v-for="month in months"
                    :key="month.value"
                    :label="month.label" 
                    :value="month.value">
                  </el-option>
                </el-select>
                <span slot="append" icon="el-icon-search">{{form.selection.data.indicatorDataDTO.unit}}</span>
              </el-input>
            </el-form-item>
            <el-form-item v-if="form.selection.data.type == 'quality'" label="指标内容">
              <el-input type="textarea" v-model="form.selection.data.indicatorDataDTO.context"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
          </el-form>
        </div>
        
      </el-main>
    </el-container>
    <div v-if="dataLoaded && check" style="width:90%;margin:20px auto">
      <el-table
        :data="tableData"
        :span-method="objectSpanMethod"
        :cell-style="cellStyle"
        border
        fit>
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
            <div v-if="scope.row.thirdIndicator.indicatorDataDTO.status == '待审核'">
              <el-button @click="auditHandler(scope.row,'通过')" type="text" >通过</el-button>
              <el-button @click="auditHandler(scope.row,'退回')" type="text" style="color:#ff6066">退回</el-button>
            </div>
            <div v-else>
              <span v-if="scope.row.thirdIndicator.indicatorDataDTO.status == '通过'" style="color:#4ad47e">
                {{scope.row.thirdIndicator.indicatorDataDTO.status}}
              </span>
              <span v-if="scope.row.thirdIndicator.indicatorDataDTO.status == '提交'" style="color:#ff6066">
                {{scope.row.thirdIndicator.indicatorDataDTO.status}}
              </span>
              <span v-if="scope.row.thirdIndicator.indicatorDataDTO.status == '退回'" style="color:#ff6066">
                {{scope.row.thirdIndicator.indicatorDataDTO.status}}
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-if="!dataLoaded" class="loader">
      数据加载中...
    </div>
  </el-container>
</template>

<script>
import PathNavigator from './PathNavigator.vue'
import Vue from 'vue'

export default {
  name: 'Module',
  components: {
    PathNavigator
  },
  data: function() {
    return {
      check:false,
      filterText: '',
      months:[{ label:'一月', value:1 },{ label:'二月', value:2 },{ label:'三月', value:3 },{ label:'四月', value:4 },
      { label:'五月', value:5 },{ label:'六月', value:6 },{ label:'七月', value:7 },{ label:'八月', value:8 },
      { label:'九月', value:9},{ label:'十月', value:10 },{ label:'十一月', value:11 },{ label:'十二月', value:12 }],
      selectMonth:'月份',
      dataLoaded: false,
      companyId:this.$store.state.companyId,
      selectionPath: [],
      form: {
        selection: null
      },
      indicatorLabels: {
        label: 'name',
        children: 'children'
      },
      moduleId: parseInt(this.$route.params.id), 
      moduleName: this.$route.params.name, 
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
      firstSpan:[],
      secondSpan:[],
      thirdSpan:[],
      tableColumn: [{label:'单位' ,value:'unit' },{label:'1月' ,value:'1月' },{label:'2月' ,value:'2月' },{label:'3月' ,value:'3月' },{label:'4月' ,value:'4月' },
      {label:'5月' ,value:'5月' },{label:'6月' ,value:'6月' },{label:'7月' ,value:'7月' },{label:'8月' ,value:'8月' },{label:'9月' ,value:'9月' },
      {label:'10月' ,value:'10月' },{label:'11月' ,value:'11月' },{label:'12月' ,value:'12月' },{label:'总计' ,value:'total' }]
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    nodeClickHandler: function(data, node) {
      this.$data.selectionPath = []
      let path = node
      while (path && path.data.level) {
        this.$data.selectionPath.unshift(path.data)
        path = path.parent
      }
      this.$data.form = {
        selection: node,
      }
      this.selectMonth = '月份'
    },
    loadNode: function(node,resolve){
      if(node.level === 0){
        return resolve(this.indicators)
      }else if(node.level === 1){
        return resolve(node.data.children)
      }else if(node.level === 2){
        return resolve(node.data.children)
      }else{
        return resolve([])
      }
    },
    levelToChinese: function(level) {
      const arr = ['模版', '一级指标', '二级指标', '三级指标']
      return arr[level]
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
    onSubmit: function() {
      let form = this.form.selection
      let failed = []
      if(form.data.type == 'quantity'){
        
        for(let i =0;i<12;i++){
          if(!form.data.indicatorDataDTO.datas[i]){
            failed.push(i+1)
          }
        }
      }
      if(form.data.type == 'quantity' && failed.length){
        
        this.$message({
        message:'月份'+failed.join('、')+'尚未填入数据',
        type:'error'
      })
      } else {
        if(form.data.type == 'quantity'){
          form.data.indicatorDataDTO.sections = this.arrayToString(form.data.indicatorDataDTO.datas)
        }
        this.$axios({
          method: 'PUT',
          url: '/api/indicators/updateData',
          data: {
            companyId: this.companyId,
            description:form.data.description,
            id: form.data.id,
            indicatorDataDTO:{
              context: form.data.indicatorDataDTO.context,
              id: form.data.indicatorDataDTO.id,
              sections: form.data.indicatorDataDTO.sections,
              unit: form.data.indicatorDataDTO.unit
            },
            level: form.data.level,
            name: form.data.name,
            moduleId: form.data.moduleId,
            parent: form.data.parent,
            type: form.data.type,
          },
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        }).then(res => {
          if(res.status == 200){
            form.data.indicatorDataDTO.status = '待审核'
            this.$message({
              message: '提交成功',
              type: 'success'
            })
          }
        }).catch(err => {
          this.$message({
            message: '修改失败',
            type: 'error'
          })
        })
      }
    },
    auditHandler:function(data,status){
        this.$confirm(`是否确认要${status}指标？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
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
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          });          
        })
    },
    renderTreeItemContent: function(h, { node,data }) {
      
      if(data.level == 3){
        let status = data.indicatorDataDTO.status
        if(status == '待审核'){
          return(
            <div style="width:100%;line-height:16px">
              <div style="float:left">{ node.label }</div>
              <div style="margin-right:30px;display: inline-block;float: right;font-size:12px;color:#ecaf14">{status}</div>
            </div>
          )
        } else if(status == '退回'){
          return(
            <div style="width:100%;line-height:16px">
              <div style="float:left">{ node.label }</div>
              <div style="margin-right:30px;display: inline-block;float: right;font-size:12px;color:red">{status}</div>
            </div>
          )
        } else {
          return(
            <div style="width:100%;line-height:16px">
              <div style="float:left">{ node.label }</div>
              <div style="margin-right:30px;display: inline-block;float: right;font-size:12px;color:#4ad47e;">{status}</div>
            </div>
          )
        }
        
      }
      return (
        <span class="item-node">
          <div class="float-left">{ node.label }</div>
        </span>)
    },
    auditorGetData: function() {
      this.check = true
      this.moduleId = parseInt(this.$route.params.id)
      this.$axios.get(`/api/modules/${this.companyId}/${this.moduleId}/indicators`,{
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
                  if(third.indicatorDataDTO.status&&third.indicatorDataDTO.status != '提交'){
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
        this.dataLoaded = true
      })
      .catch(err => {
        if(err.response.status == 403){
          this.$router.push('/403')
        }
      })
    },
    operatorGetData: function() {
      this.moduleId = parseInt(this.$route.params.id)
      this.$axios.get(`/api/modules/${this.companyId}/${this.moduleId}/indicators`,{
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
                res3.data.forEach(third => {
                  third.moduleId = first.moduleId
                  if(third.type == 'quantity'){
                    if(third.indicatorDataDTO.sections){
                      third.indicatorDataDTO.datas = this.stringToArray(third.indicatorDataDTO.sections)
                    } else {
                      third.indicatorDataDTO.datas = []
                    }
                  }
                })
                sec.children = res3.data
              })
              sec.moduleId = first.moduleId
              first.children = res2.data
            })
          })
        })
        this.indicators = res.data
        this.dataLoaded = true
      })
      .catch(err => {
        if(err.response.status == 403){
          this.$router.push('/403')
        }
      })
    },
    arrayToString:function(arr){
      return arr.join(',')
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
                data.push({
                  firstIndicator: first.name,
                  secondIndicator: sec.name,
                  thirdIndicator: third
                })
              })
              }
            })
            }
          })
          if(this.$store.state.role == 'ROLE_AUDITOR'){
          let firstPos = 0 , secondPos = 0 , thirdPos = 0
          let first = ''
          let second = ''
          this.firstSpan = []
          this.secondSpan = []
          this.thirdSpan = []
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
      }
      return data
    }
  },
  mounted: function() {
    
  },
  created:function(){
    this.indicators = []
    if(this.$store.state.role == 'ROLE_OPERATOR'){
      this.operatorGetData()
    } else {
      this.auditorGetData()
    }
  },
  beforeRouteEnter:function(to,from,next){
    next(vm => {
      if(vm.$store.state.role == 'ROLE_ADMIN1'||vm.$store.state.role == 'ROLE_ADMIN2'){
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
  height: 100%;
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
.indicator-path-text {
  border-bottom: 1px solid lightgray;
  padding-bottom: 6px;
  width: 100%;
}
.indicator-path-text span {
  font-size: 18px;
}
.item-node{
  width: 100%;
}
.module-name {
  font-weight: bold;
  background-color: lightgray;
  display: block;
  width: 100%;
  text-align: left;
  border-bottom: 1px solid lightgray;
  border-top: 1px solid lightgray;
  padding: 4px 0 4px 6px;
}
.indicator-status{
  margin-right:30px;
  display: inline-block;
  float: right;
  font-size:12px;
}
.pass{
  color: #4ad47e;
}
.back{
  color:red;
}
.wait{
  color: #ecaf14;
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
</style>

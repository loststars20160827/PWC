<template>
  <el-container class="whole">
    <el-header class="spec-head" height="48">
      <PathNavigator v-bind:path="[{ name: '模板列表', link: 1},{name: this.$route.params.name,link:2}]">
        <!-- <div class="filter-input">
          <el-input size="mini" placeholder="输入文字以筛选指标" v-model="filterText">
            <i slot="suffix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div> -->
      </PathNavigator>
    </el-header>
    <el-container v-if="dataLoaded" class="down-part">
      <el-aside class="left-tree">
        <div v-for="module in modules" v-bind:key="module.id">
          <span class="module-name">{{ module.name }}</span>
          <el-tree
          :load="loadNode"
          :ref="module.name"
            lazy
            :props="indicatorLabels"
            :data="module.indicators"
            :highlight-current="true"
            :render-content="renderTreeItemContent"
            :expand-on-click-node="false"
            node-key="id"
            @node-click="nodeClickHandler"
            >
          </el-tree>
        </div>
        <el-button @click="newItemHandler" size="medium" icon="el-icon-circle-plus" type="text">添加新指标</el-button>
      </el-aside>
      <el-main class="right-editor">
        <div v-if="selectionPath && selectionPath.length > 0">
          <el-breadcrumb class="indicator-path-text" separator-class="el-icon-arrow-right">
            <el-breadcrumb-item v-for="item in selectionPath" v-bind:key="'' + item.level + item.id">{{ item.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <el-form v-if="form.selection" ref="form" :model="form">
          <el-form-item label="指标名称">
            <el-input v-model="form.selection.data.name"></el-input>
          </el-form-item>
          <!-- 不在这里修改指标等级和父级节点 -->
          <el-form-item v-if="form.selection.data.level == 3" label="数据类别">
            <el-radio-group v-model="form.selection.data.type">
              <el-radio label="quantity">定量</el-radio>
              <el-radio label="quality">定性</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="单位" v-if="form.selection.data.level == 3 && form.selection.data.type == 'quantity'">
            <el-input v-model="form.selection.data.indicatorDataDTO.unit"></el-input>
          </el-form-item>
          <el-form-item label="指标描述">
            <el-input type="textarea" v-model="form.selection.data.description"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button v-if="form.selection.data.level == 3" type="primary" @click="onSubmit">更新</el-button>
            <el-button type="danger" @click="onRemove">删除</el-button>
          </el-form-item>
        </el-form>
        <el-dialog title="创建新指标" :visible.sync="newItemFormVisible">
          <el-form :model="newItemForm">
            <el-form-item label="指标名称" label-width="68px">
              <el-input v-model="newItemForm.name" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="所属模块" label-width="68px">
              <el-select v-model="newItemForm['moduleId']" placeholder="请选择所属模块" style="width:100%;">
                <el-option
                v-for="item in modules"
                :key="item.id"
                :label="item.name"
                :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="指标级别" label-width="68px">
              <el-select v-model="newItemForm['level']" placeholder="请选择指标级别" style="width:100%">
                <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="指标类型" v-if="newItemForm.level == 3">
              <el-radio-group v-model="newItemForm.type">
                <el-radio label="quantity">定量</el-radio>
                <el-radio label="quality">定性</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="单位" v-if="newItemForm.level == 3&&newItemForm.type == 'quantity'">
              <el-input v-model="newItemForm.unit" ></el-input>
            </el-form-item>
            <el-form-item label="父级指标" v-if="newItemForm.level > 1" >
              <div class="block">
                <el-cascader style="width:100%"
                  expand-trigger="hover"
                  :options="parentItemOptions"
                  v-model="newItemForm.parentPath">
                </el-cascader>
              </div>
            </el-form-item>
            <el-form-item label="指标描述">
              <el-input type="textarea" v-model="newItemForm.description"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="newItemFormVisible = false">取消</el-button>
            <el-button type="primary" @click="createNewItem">确定</el-button>
          </div>
        </el-dialog>
      </el-main>
    </el-container>
    <div v-else class="loader">
      数据加载中...
    </div>
  </el-container>
</template>

<script>
import PathNavigator from './PathNavigator.vue'
import Vue from 'vue'

export default {
  name: 'TemplateForm',
  components: {
    PathNavigator
  },
  data: function() {
    return {
      // filterText:'',
      currentModule:{},
      companyId:1,
      templateId:0,
      dataLoaded: false,
      currentModule: null,
      newItemFormVisible: false,
      selectionPath: [],
      options:[{
        value:1,
        label:'一级指标'
      },{
        value:2,
        label:'二级指标'
      },{
        value:3,
        label:'三级指标'
      }],
      newItemForm: {
        name:'',
        level:1,
        moduleId:0,
        type:null,
        parentPath:[],
        description:'',
        unit:''
      },
      form: {
        selection: null,
        description: '',
        id: 0,
        indicatorDataDTO: {
          unit: '',
          sections: '',
          id: 0,
          context: ''
        },
        level: 0,
        name: '', 
        parent: 0,
        type: '', 
        moduleId: 0
      },
      indicatorLabels: {
        label: 'name',
        children: 'children'
      },
      templates:[],
      indicators:[],
      modules: [
        { level: 0, id: 2, name: '第二模块', indicators: [] },
        { level: 0, id: 1, name: '第一模块', indicators: [
        {
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
          children: [
            {
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
                  context: null
                }, level: 3, name: '废气排放量',parent:75, type: 'quantity', moduleId: 1}
              ]
            },
          ]
        }]}
      ]
    }
  },
  methods: {
    nodeClickHandler: function(data, node) {
      this.$data.selectionPath = []
      let path = node
      while (path && path.data.level) {
        this.$data.selectionPath.unshift(path.data)
        path = path.parent
      }
      this.$data.currentModule = this.$data.modules.find(m => m.id == node.data.moduleId)
      this.$data.selectionPath.unshift(this.$data.currentModule)
      this.$data.form = {
        selection: node,
      }
    },
    
    levelToChinese: function(level) {
      const arr = ['模版', '一级指标', '二级指标', '三级指标']
      return arr[level]
    },
    onSubmit: function() {
      let form = this.form.selection
      if(form.data.type == 'quality'){
        form.data.indicatorDataDTO.unit = ''
      }
      this.$axios({
        method: 'PUT',
        url: '/api/indicators/update',
        data: {
          companyId: this.companyId,
          description:form.data.description,
          id: form.data.id,
          indicatorDataDTO:form.data.indicatorDataDTO,
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
          this.$message({
            message: '修改成功',
            type: 'success'
          })
        }
      }).catch(err => {
        this.$message({
          message: '修改失败',
          type: 'error'
        })
      })
    },
    onRemove: function() {
      let selection = this.$data.form.selection
      this.removeItem(selection, selection.data)
    },
    removeItem: function(node, data) {
      this.$confirm(`是否确认要删除${this.levelToChinese(data.level)}“${data.name}”？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios.delete(`/api/indicators/${data.id}`,{
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        })
        .then(res => {
          if(res.status == 200){
            this.$data.form = {}
            this.$data.selectionPath = []
            const parent = node.parent
            const children = parent.data.children || parent.data
            const index = children.findIndex(d => d.id === data.id)
            children.splice(index, 1)

            let module = {}
            for(let i = 0; i < this.modules.length;i++){
              if(this.modules[i].id == data.moduleId){
                module = this.modules[i]
              }
            }
            let tree = this.$refs[module.name][0]
            tree.remove(data)

            this.$message({
              type: 'success',
              message: '删除成功'
            })
          }
        })
        .catch(err => {
          this.$message({
            type: 'error',
            message: '删除失败'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    renderTreeItemContent: function(h, { node }) {
      return (
        <span class="item-node">
          <span>{ node.label }</span>
        </span>)
      

    },
    createNewItem: function() {
      let newForm = this.$data.newItemForm
      if (newForm.name.trim().length === 0 || !newForm.level) {
        return
      }
      this.$data.newItemFormVisible = false
      
      let result = {
        description: newForm.description,
        id: 0,
        indicatorDataDTO: {
          context: null,
          id: 0,
          sections: null,
          unit: null
        },
        level: newForm.level,
        name: newForm.name,
        type: null,
        companyId: this.companyId,
        moduleId: newForm.moduleId
      }
      if (newForm.level == 3) {
        result.type = newForm.type
        result.indicatorDataDTO.unit = newForm.unit
      }
      if(newForm.level == 1){
        result.moduleId = newForm.moduleId
        result.parent = 0
      }else{
        result.parent = newForm.parentPath[newForm.parentPath.length-1]
      }

      this.$axios({
        method:'POST',
        url:'/api/indicators',
        data: result,
        headers: {
            'Authorization': localStorage.getItem('token')
          }
      })
      .then(res => {
        if(res.status == 200){
          result.id = res.data
          if(result.level < 3){
            result.children = []
          }

          let module = {}
          for(let i = 0; i < this.modules.length;i++){
            if(this.modules[i].id == newForm.moduleId){
              module = this.modules[i]
            }
          }
          let tree = this.$refs[module.name][0]
          if(result.level == 1){
            this.modules.find(t => t.id === newForm.moduleId).indicators.push(result)
          } else {
            tree.append(result,result.parent)
          }

          this.$message({
            message: '添加成功',
            type: 'success'
          })
        }
      })
      .catch(err => {
        if(err.response.status == 400){
          this.$message({
            message: '添加失败，同一级指标下不能有重名的指标',
            type: 'error'
          })
        }
      })
    },
    newItemHandler: function() {
      this.$data.newItemFormVisible = true
      this.$data.newItemForm = {}
    },
    getData: function() {
      this.templateId = parseInt(this.$route.params.tid);
      this.companyId = parseInt(this.$route.params.cid);
      
      let modules = []
      this.$axios.get('/api/modules',{
        headers:{
          'authorization':localStorage.getItem('token')
          }
      })
      .then(res => {
        res.data.forEach(ele => {
            let module = {
              id: ele.id,
              name: ele.name,
              level: 0,
              indicators: []
            }
            this.modules.push(module)
          })
          
            this.modules.forEach(ele => {
            this.$axios.get(`/api/modules/${this.companyId}/${ele.id}/indicators`,{
              headers:{
                'authorization':localStorage.getItem('token')
              }
            })
              .then(res => {
                ele.indicators = res.data
                ele.indicators.forEach(element => {
                  element.moduleId = ele.id
                })
                let firstLevelIndicators = ele.indicators
                  firstLevelIndicators.forEach(first => {
                    this.$axios.get(`/api/indicators/${first.id}/children`,{
                      headers:{
                          'authorization':localStorage.getItem('token')
                      }
                    })
                    .then(res2 => {
                      first.children = res2.data
                      first.children.forEach(sec => {
                        this.$axios.get(`/api/indicators/${sec.id}/children`,{
                          headers:{
                            'authorization':localStorage.getItem('token')
                          }
                        })
                        .then(res3 => {
                          res3.data.forEach(third => {
                            third.moduleId = first.moduleId
                          })
                          sec.children = res3.data
                        })
                        sec.moduleId = first.moduleId
                      })
                    })
                  })
                  ele.indicators = firstLevelIndicators
                  this.dataLoaded = true
              })
          })
      })
      .catch(err => {
        if(err.response.status == 403){
          this.$router.push('/403')
        }
      });
    },
    loadNode: function(node,resolve){
      if(node.level === 0){
        return resolve(this.modules[this.currentModule++].indicators)
      }else if(node.level === 1){
        return resolve(node.data.children)
      }else if(node.level === 2){
        return resolve(node.data.children)
      }else{
        return resolve([])
      }
    },
  },
  props: {
  },
  computed: {
    parentItemOptions: function() {
      let options = [];
      let module = []
      for(let i=0;i<this.modules.length;i++){
        if(this.newItemForm.moduleId == this.modules[i].id){
          module = this.modules[i]
        }
      }
      let indicators = module.indicators  
      for(let i = 0;i < indicators.length; i++){
        let result = {}
        result.label = indicators[i].name;
        result.value = indicators[i].id;
        if(this.newItemForm.level == 3){
          let children = indicators[i].children
          result.children = [];
          for(let j = 0;j < children.length;j++){
            result.children.push({
              label: children[j].name,
              value: children[j].id
            })
          }
        }
        options.push(result)
      }

      return options
    },
  },
  mounted: function() {

  },
  created:function(){
    this.modules=[]
    this.getData()
  },
  
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
.indicator-path-text {
  border-bottom: 1px solid lightgray;
  padding-bottom: 6px;
  width: 100%;
}
.indicator-path-text span {
  font-size: 18px;
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
</style>

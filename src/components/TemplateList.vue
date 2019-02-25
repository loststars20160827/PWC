<template>
  <el-container class="whole">
    <el-header class="spec-head" height="48">
      <PathNavigator v-bind:path="[{ name: '模板列表', linkP: 1}]"></PathNavigator>
    </el-header>

    <div v-if="dataLoaded" class="wrap">
      <el-row type="flex" style="margin:30px 0;" justify="space-between">
        <el-col :span="4">
          <el-button plain type="primary" @click="newTemplateFormVisible=true">创建模板</el-button>
        </el-col>
        <el-col :span="14" :offset="4">
          <el-input placeholder="搜索模板" v-model="searchInput">
            <el-button slot="append" icon="el-icon-search" @click="searchHandler"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="text" @click="showAll">显示全部</el-button>
        </el-col>
      </el-row>
      
      
      <div class="template-list" v-if="isFound">

        <el-table
          stripe
          :data="currentTemplates"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="companyName" label="公司名称"></el-table-column>
          <!-- <el-table-column prop="industry" label="所属行业" width="120"></el-table-column> -->
          <el-table-column prop="name" label="模板名称">
            <template slot-scope="scope">
              <el-button @click="enterTemplate(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button @click="deleteHandler(scope.row)" type="text" size="small" style="color:#ff6066">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div>
          <div style="height:40px;">
            <el-button type="text" @click="deleteSelectedTemplates" style="float:left;color:#ff6066">删除所选</el-button>
          </div>
          <el-pagination
            background
            layout="total, prev, pager, next"
            :total="totalTemplates.length"
            :page-size="6"
            :current-page.sync="currentPage"
            @current-change="changePage">
          </el-pagination>
        </div>
      </div>
      <div class="no-search" v-else >
        没有找到相关模板
      </div>
      <el-dialog title="新建模板" :visible.sync="newTemplateFormVisible">
        <el-form :model="newTemplateForm" style="width:60%;margin:0 auto">
          <el-form-item label="模板名称" label-width="80px">
            <el-input v-model="newTemplateForm.name" placeholder="请输入模板名称"></el-input>
          </el-form-item>
          <el-form-item label="所属行业" label-width="80px">
            <el-input v-model="newTemplateForm.industry" placeholder="请输入所属行业"></el-input>
          </el-form-item>
          <el-form-item label="所属公司" label-width="80px">
            <el-input v-model="newTemplateForm.companyName" placeholder="请输入所属公司"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="newTemplateFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="newTemplate">确 定</el-button>
        </div>
      </el-dialog>
      
    </div>
    <div class="loader" v-if="!dataLoaded">
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
      newTemplateFormVisible:false,
      newTemplateForm:{
        name:'',
        industry:'',
        companyName:''
      },
      dataLoaded: false,
      isFound:true,
      searchInput:'',
      currentTemplates:[],
      totalTemplates:[
        {id: 1,name: '模板A',companyName: 'A公司',companyId:1},{id: 2,name: '模板B',companyName: 'B公司',companyId:2}
      ],
      selectedTemplates:[],
      currentPage:1
    }
  },
  methods: {
    showAll:function(){
      this.isFound = true
      this.searchInput = ''
      this.getData()
    },
    handleSelectionChange:function(val){
      this.selectedTemplates = val
    },
    getData:function(){
      this.totalTemplates = []
      this.$axios.get('/api/templates',{
        headers:{
        'authorization':localStorage.getItem('token')
        }
      })
      .then(res => {
        this.totalTemplates = res.data;
        this.currentTemplates = this.totalTemplates.slice(0,6)
        this.dataLoaded = true
      })
      .catch(err => {
        if(err.response.status == 403){
          this.$router.push('/403')
        }
      })
    },
    enterTemplate:function(item){
      this.$router.push(`/homepage/TemplateForm/${item.companyId}/${item.name}-${item.id}`)
    },
    deleteHandler:function(item){
      this.$confirm(`是否确认要删除${item.name}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios.delete(`/api/templates/${item.id}`,{
          headers:{
            'authorization':localStorage.getItem('token')
          }
        })
        .then(res => {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          let index = this.totalTemplates.indexOf(item)
          this.totalTemplates.splice(index,1)
          this.currentTemplates = this.totalTemplates.slice((this.currentPage-1)*6,(this.currentPage-1)*6+6)
        })
        .catch(err => {
          
        })
        
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    deleteSelectedTemplates:function(){
      let deleteTotal = this.selectedTemplates.length
      let failed= []
      if(this.selectedTemplates.length == 0){
        this.$message({
          message:'没有选择任何模板',
          type:'error'
        })
        return
      }
      this.$confirm('是否确认要删除所选的模板？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.selectedTemplates.forEach(ele => {
          this.$axios.delete(`/api/templates/${ele.id}`,{
            headers: {
              'Authorization': localStorage.getItem('token')
            }
          })
          .then(res => {
            if(res.status != 200){
              failed.push(ele)
            } else{
              let index =this.totalTemplates.indexOf(ele)
              this.totalTemplates.splice(index,1)
              this.currentTemplates = this.totalTemplates.slice((this.currentPage-1)*6,(this.currentPage-1)*6+6)
              if(this.currentTemplates.length == 0){
                this.currentPage -= 1
                this.currentTemplates = this.totalTemplates.slice((this.currentPage-1)*6,(this.currentPage-1)*6+6)
              }
            }
          })
          this.selectedTemplates = failed
          if(failed.length){
            this.$message({
              message: '仍处于选中状态的模板删除失败，请重试',
              type: 'error'
            })
          } else {
            this.$message({
              message: '已删除选中的模板',
              type: 'success'
            })
          }
        })        
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    },
    searchHandler:function(){
      this.totalTemplates=[]
      this.$axios.get(`/api/templates/name/${this.searchInput}`,{
        headers:{
          'Content-Type': 'application/json;charset=UTF-8',
          'authorization':localStorage.getItem('token')
        }
      })
      .then(res => {
        if(res.data.length == 0){
          this.isFound = false
        } else {
          let img = require('../image/'+res.data.companyName+'.png')
          Vue.set(res.data,'img',img)
          this.totalTemplates.push(res.data)
          this.currentTemplates=this.totalTemplates.slice(0,6)
        }
      })
      .catch(err => {
        let status = err.response.status
        if(status == 404){
          this.isFound = false
        }
      })
    },
    changePage:function(){
      this.currentTemplates = this.totalTemplates.slice((this.currentPage-1)*6,(this.currentPage-1)*6+6)
    },
    newTemplate:function(){
      this.$axios({
        method:'POST',
        url:'/api/templates',
        data: {
          name:this.newTemplateForm.name,
          id: 0, 
          industry:this.newTemplateForm.industry,
          companyName:this.newTemplateForm.companyName
        },
        headers:{
          'authorization':localStorage.getItem('token')
        }
      })
      .then(res => {
        if(res.status == 201){
          this.$message({
            message: '创建成功',
            type: 'success'
          })
          this.totalTemplates.push({
            name:this.newTemplateForm.name,
            id: 0, 
            industry:this.newTemplateForm.industry,
            companyName:this.newTemplateForm.companyName
          })
          this.currentTemplates = this.totalTemplates.slice((this.currentPage-1)*6,(this.currentPage-1)*6+6)
          this.newTemplateFormVisible = false ;
          let template = res.data
          this.$router.push(`/homepage/templateForm/${template.companyId}/${this.newTemplateForm.name}-${template.id}`);
        } 
      })
      .catch(err => {
        let status = err.response.status
        if(status == 400){
          this.$message({
            message: '创建失败，该公司已经拥有模板',
            type: 'error'
          })
        } else if(status == 404){
          this.$message({
            message: '创建失败，该公司尚未登记为客户',
            type: 'error'
          })
        }
        
      })
    }
  },
  mounted: function() {
    this.getData()
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
  width:70%;
  margin: 0 auto;
  position: relative;
}
.list-wrap{
  width: 100%;
  height: 520px;
}
.template-wrap{
  height: 100px;
  width: 100%;
  border:1px solid #999;
  background: #d1ecfb;
  margin: 20px 0;
  text-align: left;
}
.company-logo{
  width: 40%;
  height: 100%;
  float: left;
}
.template-info{
  float: left;
  width: 60%;
}
.template-name{
  margin-left: 10px;
}
.template-company{
  margin: 20px 10px 0px 10px;
}
</style>

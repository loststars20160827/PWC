<template>
  <el-container class="whole">
    <el-header class="spec-head" height="48">
      <!-- <PathNavigator v-bind:path="[{ name: '首页', link: 1}, { name: '客户管理', link: 2}]">
      </PathNavigator> -->
    </el-header>
    <div v-if="dataLoaded" class="down-part">
      
      <div style="width:1080px;margin:0 auto;">
        <div style="margin-top: 20px;height:40px;">
          <div style="float:left">
            <el-button type="primary" @click="newUserHandler" plain size="medium">添加客户</el-button>
          </div>
        </div>
        <el-table
          stripe
          :data="currentUsers"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60"></el-table-column>
          <el-table-column prop="companyName" label="公司名称" width="180"></el-table-column>
          <el-table-column prop="industry" label="所属行业" width="120"></el-table-column>
          <el-table-column prop="templateName" label="模板名称" width="180"></el-table-column>
          <el-table-column prop="username" label="管理员账号" width="180"></el-table-column>
          <el-table-column prop="contactor" label="联系人" width="120"></el-table-column>
          <el-table-column prop="telephone" label="联系电话" width="180"></el-table-column>
          <el-table-column label="账号管理" width="60">
            <template slot-scope="scope">
              <el-button @click="deleteHandler(scope.row)" type="text" size="small" style="color:#ff6066">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div>
          <div style="height:40px;">
            <el-button type="text" @click="deleteSelectedUsers" style="float:left;color:#ff6066">删除所选</el-button>
          </div>
          <el-pagination
            background
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-size="6"
            layout="total, prev, pager, next"
            :total="totalUsers.length">
          </el-pagination>
        </div>
      </div>
      <el-dialog title="新建客户" :visible.sync="newUserFormVisible">
        <el-form :model="newUserForm">
          <el-form-item label="公司名称">
            <el-input v-model="newUserForm.companyName" placeholder="请输入公司名称"></el-input>
          </el-form-item>
          <el-form-item label="所属行业">
            <el-input v-model="newUserForm.industry" placeholder="请输入所属行业"></el-input>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="newUserForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="newUserForm.password" placeholder="请输入密码" type="password"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="newUserFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="createNewUser">确 定</el-button>
        </div>
      </el-dialog>
      
    </div>
    <div v-else class="loader">
      数据加载中...
    </div>
  </el-container>
</template>

<script>
import PathNavigator from './PathNavigator.vue'

export default {
  name: 'Guests',
  components: {
    PathNavigator
  },
  data: function() {
    return {
      dataLoaded:false,
      newUserFormVisible: false,
      newUserForm: {
        companyName: '',
        industry: '',
        username: '',
        password: ''
      },
      totalUsers: [{
        id:0,
        companyName:'ABC',
        industry:'',
        templateName:'',
        username:'',
        password:''
      }, {
        id:0,
        companyName:'DEF',
        industry:'',
        templateName:'',
        username:'',
        password:''
      }],
      currentUsers:[],
      currentPage: 1,
      selectedUsers:[]
    }
  },
  methods: {
    newUserHandler:function(){
      this.newUserFormVisible = true
      this.newUserForm = {}
    },
    createNewUser:function(){
      let form = this.newUserForm
      this.$axios({
        method:'POST',
        url:'/api/companies/create',
        data: {
          industry: form.industry,
          name: form.companyName,
          users:[{
            password: form.password,
            username: form.username
          }]
        },
        headers:{
          'Authorization': localStorage.getItem('token')
        }
      })
      .then(res => {
        if(res.status == 200){
          this.totalUsers.unshift({
            companyName: form.companyName,
            industry: form.industry,
            templateName: '',
            username: form.username,
            password: form.password
          })
          this.currentUsers = this.totalUsers.slice((this.currentPage-1)*6,(this.currentPage-1)*6+6)
          this.$message({
            message: '新建成功',
            type: 'success'
          })
          this.newUserFormVisible = false
        } else {
          this.$message({
            message: '新建失败',
            type: 'error'
          })
        }
      })
      .catch(err => {
        if(err.response.status == 400){
          this.$message({
            message: '该公司已经是客户，请重新输入',
            type: 'error'
          })
        }
      })
      
    },
    handleSelectionChange:function(val){
      this.selectedUsers = val
    },
    deleteHandler:function(row){
      this.selectedUsers.push(row)
      this.deleteSelectedUsers()
    },
    deleteSelectedUsers:function(){
      let deleteTotal = this.selectedUsers.length
      let failed= []
      if(this.selectedUsers.length == 0){
        this.$message({
          message:'没有选择任何用户',
          type:'error'
        })
        return
      }
      this.$confirm('是否确认要删除所选的客户？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.selectedUsers.forEach(ele => {
          this.$axios.delete(`/api/companies/delete/${ele.id}`,{
            headers: {
              'Authorization': localStorage.getItem('token')
            }
          })
          .then(res => {
            if(res.status != 200){
              failed.push(ele)
            } else{
              let index =this.totalUsers.indexOf(ele)
              this.totalUsers.splice(index,1)
              this.currentUsers = this.totalUsers.slice((this.currentPage-1)*6,(this.currentPage-1)*6+6)
              if(this.currentUsers.length == 0){
                this.currentPage -= 1
                this.currentUsers = this.totalUsers.slice((this.currentPage-1)*6,(this.currentPage-1)*6+6)
              }
            }
          })
          this.selectedUsers = failed
          if(failed.length){
            this.$message({
              message: '仍处于选中状态的客户删除失败，请重试',
              type: 'error'
            })
          } else {
            this.$message({
              message: '已删除选中的客户',
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
    handleCurrentChange:function(){
      this.currentUsers = this.totalUsers.slice((this.currentPage-1)*6,(this.currentPage-1)*6+6)
    },
    getData:function(){
      this.$axios.get('/api/companies/all',{
        headers:{
          'Authorization': localStorage.getItem('token')
        }
      })
      .then(res => {
        if(res.status == 200){
          console.log(res.syt)
          res.data.forEach(ele => {
            this.totalUsers.push({
              id: ele.id,
              companyName: ele.name,
              industry: ele.industry,
              templateName: ele.template,
              username: ele.users[0].username,
              contactor: ele.users[0].contactor,
              telephone: ele.users[0].telephone
            })
          })
          this.currentUsers = this.totalUsers.slice(0,6)
          this.dataLoaded = true
        }
      })
      .catch(err => {
        // if(err.response.status == 403){
        //   this.$router.push('/403')
        // }
      })
    }
  },
  mounted: function() {
    this.totalUsers = []
    this.getData()
  },
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

</style>

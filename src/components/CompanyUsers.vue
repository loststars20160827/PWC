<template>
  <div class="whole">
    <div v-if="dataLoaded" class="down-part">
      <div style="width:920px;margin:0 auto;">
        <div style="margin-top: 20px;height:40px;">
          <div style="float:left">
            <el-button type="primary" @click="newUserHandler" plain size="medium">添加用户</el-button>
          </div>
        </div>
        <el-table
          stripe
          :data="currentUsers"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center"></el-table-column>
          <el-table-column prop="username" label="用户名" width="120" align="center"></el-table-column>
          <el-table-column prop="role" label="账号类型" width="100" align="center"></el-table-column>
          <el-table-column prop="contactor" label="联系人" width="100" align="center"></el-table-column>
          <el-table-column prop="telephone" label="联系电话" width="180" align="center"></el-table-column>
          <el-table-column prop="email" label="邮箱" width="180" align="center"></el-table-column>
          <el-table-column label="账号管理" width="180" align="center">
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
      <el-dialog title="新建用户" :visible.sync="newUserFormVisible">
        <el-form :model="newUserForm" label-width="80px" label-position="left">
          <el-form-item label="用户名" class="new-form-item">
            <el-input v-model="newUserForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="密码" class="new-form-item">
            <el-input v-model="newUserForm.password" placeholder="请输入密码" type="password"></el-input>
          </el-form-item>
          <el-form-item label="账号类型" class="new-form-item">
            <el-select v-model="newUserForm['role']" style="width:100%">
              <el-option label="录入" value="ROLE_OPERATOR"></el-option>
              <el-option label="审核" value="ROLE_AUDITOR"></el-option>
            </el-select>
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
  </div>
</template>

<script>
import PathNavigator from './PathNavigator.vue'

export default {
  name: 'CompanyUser',
  components: {
    PathNavigator
  },
  data: function() {
    return {
      dataLoaded:false,
      newUserFormVisible: false,
      newUserForm: {
        username: '',
        password: '',
        role: ''
      },
      totalUsers: [{
        id:0,
        username:'录入A',
        password:'******',
        role:'录入'
      }, {
        id:1,
        username:'审核B',
        password:'******',
        role:'审核'
      }],
      currentUsers:[],
      currentPage: 1,
      selectedUsers:[]
    }
  },
  methods: {
    roleToChinese:function(role){
      return role == 'ROLE_OPERATOR' ? '录入' : '审核'
    },
    newUserHandler:function(){
      this.newUserFormVisible = true
      this.newUserForm = {}
    },
    createNewUser:function(){
      let form = this.newUserForm
      this.$axios({
        method:'POST',
        url:'/api/user/create',
        data: {
          companyId:this.$store.state.companyId,
          username: form.username,
          password: form.password,
          role: form.role
        },
        headers:{
          'Authorization': localStorage.getItem('token')
        }
      })
      .then(res => {
        if(res.status == 200){
          this.totalUsers.unshift({
            id: res.data,
            username: form.username,
            password: form.password,
            role: this.roleToChinese(form.role)
          })
          this.currentUsers = this.totalUsers.slice((this.currentPage-1)*6,(this.currentPage-1)*6+6)
          this.$message({
            message: '新建成功',
            type: 'success'
          })
          this.newUserFormVisible = false
        } 
      })
      .catch(err => {
        let status = err.response.status
        if(status == 400){
          this.$message({
            message: '用户名已存在，请重新输入',
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
      this.$confirm('是否确认要删除所选的用户？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.selectedUsers.forEach(ele => {
          this.$axios.delete(`/api/user/delete/${ele.id}`,{
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
          });
          this.selectedUsers = failed
          if(failed.length){
            this.$message({
              message: '仍处于选中状态的用户删除失败，请重试',
              type: 'error'
            })
          } else {
            this.$message({
              message: '已删除选中的用户',
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
      this.currentUsers = this.totalUsers.slice(0,6)
      this.$axios.get(`/api/companies/${this.$store.state.companyId}/getAllUsers`,{
        headers:{
          'Authorization': localStorage.getItem('token')
        }
      })
      .then(res => {
        if(res.status == 200){
          res.data.forEach(ele => {
            this.totalUsers.push({
              id: ele.id,
              username: ele.username,
              role:this.roleToChinese(ele.role),
              email:ele.email,
              contactor:ele.contactor,
              telephone:ele.telephone
            })
          })
          this.currentUsers = this.totalUsers.slice(0,6)
          this.dataLoaded = true
        }
      })
      .catch(err => {
        if(err.response.status == 403){
          this.$router.push('/403')
        }
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
.new-form-item{
  width:80%;
  margin:20px auto
}

</style>

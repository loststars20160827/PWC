<template>
  <div class="whole">
      <PathNavigator v-bind:path="[{ name: '首页', link: 1}]"></PathNavigator>
    <el-tabs type="border-card" v-model="option" @tab-click="onTabClick" style="margin:30px auto;width:60%;height:600px;">
      <el-tab-pane label="个人信息" name="个人信息">
        <el-form ref="infoForm" :rules="infoRules" :model="infoForm" status-icon class="form">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="infoForm.username" 
            placeholder="请输入用户名" clearable>
          </el-input>
        </el-form-item>
        <el-form-item prop="contactor" label="姓名">
          <el-input v-model="infoForm.contactor" 
            placeholder="请输入姓名" clearable> 
          </el-input>
        </el-form-item>
        <el-form-item prop="telephone" label="联系电话">
          <el-input v-model="infoForm.telephone" 
            placeholder="请输入联系电话" maxlength="11" clearable>
          </el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="infoForm.email" 
            placeholder="请输入邮箱" clearable>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain style="margin-top:20px" @click="finishHandler('infoForm')">保存</el-button>
        </el-form-item>
      </el-form>
      </el-tab-pane>
      <el-tab-pane label="修改密码" name="修改密码">
        <el-form ref="changePasswordForm" :rules="changePasswordRules" :model="changePasswordForm" status-icon class="form">
        <el-form-item prop="currentPassword" label="当前密码">
          <el-input v-model="changePasswordForm.currentPassword" 
            placeholder="请输入当前密码" clearable>
          </el-input>
        </el-form-item>
        <el-form-item prop="newPassword" label="新密码">
          <el-input type="password" v-model="changePasswordForm.newPassword" 
            placeholder="请输入新密码" maxlength="18" clearable> 
          </el-input>
        </el-form-item>
        <el-form-item prop="checkPassword" label="确认密码">
          <el-input type="password" v-model="changePasswordForm.checkPassword" 
            placeholder="请再次输入密码" maxlength="18" clearable>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain style="margin-top:30px" @click="changePasswordHandler('changePasswordForm')">确认</el-button>
        </el-form-item>
      </el-form>
      </el-tab-pane>
      
    </el-tabs>
  </div>
</template>

<script>
import PathNavigator from './PathNavigator.vue'

export default {
  name: 'PersonalPage',
  components: {
    PathNavigator
  },
  data() {
    var validateUsername = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入用户名'));
        } else {
          callback();
        }
      };
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.changePasswordForm.checkPassword !== '') {
            this.$refs.changePasswordForm.validateField('checkPassword');
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.changePasswordForm.newPassword) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      var validateCurrentPassword = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入当前密码'));
        } else if (!this.isValidPassword(value)) {
          callback(new Error('密码不正确'));
        } else {
          callback();
        }
      };
      
      return {
        option:'个人信息',
        infoForm: {
          username: this.$store.state.username,
          contactor: '',
          telephone: '',
          email:''
        },
        infoRules: {
          username: [{
              required: true,
              message: '请输入用户名',
              trigger: 'blur'
            }],
            contactor: [{
              required: true,
              message: '请输入姓名',
              trigger: 'blur'
            }], 
            telephone: [{
              required: true,
              message: '请输入联系电话',
              trigger: 'blur'
            },
            {
              pattern: /^1[3|4|5|7|8][0-9]{9}$/,
              message: '请输入合法联系电话'
            }
          ],
          email: [{
              required: true,
              message: '请输入邮箱',
              trigger: 'blur'
            },
            {
              pattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
              message: '请输入合法邮箱'
            }
          ],
          
        },
        changePasswordForm: {
          currentPassword: '',
          newPassword: '',
          checkPassword: ''
        },
        changePasswordRules: {
          currentPassword: [{
              validator: validateCurrentPassword,
              trigger: 'blur'
          }],
          newPassword: [{
              validator: validatePass,
              trigger: 'blur'
            },
            {
              min: 6,
              max: 15,
              message: '密码长度为6~15',
              trigger: 'blur'
            }
          ],
          checkPassword: [{
            validator: validatePass2,
            trigger: 'blur'
          }]
        }
      };
    },
    methods: {
      onTabClick:function(){
        this.$refs['changePasswordForm'].resetFields();
      },
      isValidPassword: function (password) {
        return this.$store.state.password == password ? true : false
      },
      finishHandler: function (formName) {
        let form = this.infoForm
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let info = {
              companyId: this.$store.state.companyId,
              contactor: form.contactor,
              email: form.email,
              telephone: form.telephone
            }
            if(form.username != this.$store.state.username){
              info.username = form.username
            }
            this.$axios({
              method:'PUT',
              url:`/api/user/update/${this.$store.state.username}`,
              data: info
            })
            .then(res => {
                this.$store.commit('setUsername',form.username)
                this.$message({
                  message:'修改成功',
                  type:'success'
                })
            })
            .catch(err => {
              if(err.response.status == 409){
                form.username = this.$store.state.username
                this.$message({
                  message:'用户名已存在，请重新设置',
                  type:'error'
                })
              }
            })
          }
        });
      },
      changePasswordHandler:function(formName){
        let form = this.changePasswordForm
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$axios({
              method: 'PUT',
              url: '/api/user/changePassword',
              params: {
                CId: this.$store.state.companyId,
                username:this.$store.state.username,
                newPassword: form.newPassword
              },
              headers: {
                'Authorization': localStorage.getItem('token')
              }
            }).then(res => {
              if(res.status == 200){
                this.$store.commit('setPassword',form.newPassword)
                this.$refs['changePasswordForm'].resetFields();
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
          } else {
            return false
          }
        });
      },
      getData:function(){
        this.$axios.get(`/api/user/getDetails/${this.$store.state.companyId}/${this.$store.state.username}`,{
          headers:{
            'Authorization': localStorage.getItem('token')
          }
        })
        .then(res => {
          if(res.status == 200){
            let form = this.infoForm
            form.contactor = res.data.contactor
            form.telephone = res.data.telephone
            form.email = res.data.email
          }
        })
        .catch()
      }
    },
    created(){
      this.getData()
    }
}
</script>

<style scoped>
.reset-password{
  height: 100%;
  width: 100%;
  background-size: cover;
}
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
.form{
  width:40%;
  margin: 20px auto;
}
</style>

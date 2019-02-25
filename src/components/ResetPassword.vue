<template>
  <div class="reset-password">
    <div class="wrap">
      <div class="login-wrap-top">
          <el-row>
            <img src="../image/login_logo_1.png" style="width:30%;" alt="">
          </el-row>
          <el-row style="margin-top:10px;">
            <span>重置密码</span>
          </el-row>
        </div>
      <div class="reset-form">
        <el-row type="flex" justify="center">
          <el-col :span="18">
            <el-form ref="emailForm" :rules="emailRules" :model="emailForm" status-icon class="form" v-show="isValidEmail">
              <el-form-item prop="email">
                <el-input v-model="emailForm.email" placeholder="邮箱" clearable>
                   <el-button slot="append" @click="validateEmailHandler">验证</el-button>
                </el-input>
              </el-form-item>
              <el-form-item prop="code">
                <el-input v-model="emailForm.code" placeholder="验证码" clearable>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button @click="validateCodeHandler" plain type="primary" style="width:100%">确认</el-button>
              </el-form-item>
            </el-form>
              <el-form ref="passwordForm" :rules="passwordRules" :model="passwordForm" status-icon class="form" v-show="!isValidEmail">
                <el-form-item prop="username" >
                  <el-input v-model="passwordForm.username" placeholder="用户名" maxlength="18" style="margin-top:10px;" clearable>
                    <i slot="prefix" class="iconfont icon-yonghu"></i>
                  </el-input>
                </el-form-item>
                <el-form-item prop="newPassword" >
                  <el-input type="password" v-model="passwordForm.newPassword" placeholder="新密码" maxlength="18" style="margin-top:10px;" clearable>
                    <i slot="prefix" class="iconfont icon-mima"></i>
                  </el-input>
                </el-form-item>
                <el-form-item prop="checkPassword">
                  <el-input type="password" v-model="passwordForm.checkPassword" placeholder="确认密码" maxlength="18" style="margin-top:10px;" clearable>
                    <i slot="prefix" class="iconfont icon-mima"></i>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-row type="flex" justify="space-between" style="margin-top:30px;">
                    <el-col :span="8">
                      <el-button @click="cancelHandler" plain style="width:100%">取消</el-button>
                    </el-col>
                    <el-col :span="8">
                      <el-button type="primary" plain style="width:100%" @click="finishHandler('passwordForm')">完成</el-button>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-form>
              <div @click="giveUpReset" style="color:#999;font-size:14px">放弃重置</div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ResetPassword',
  data() {
var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.passwordForm.checkPassword !== '') {
            this.$refs.passwordForm.validateField('checkPassword');
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();

        }
      };
      var validateEmail = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入邮箱'));
        } else {
          callback();
        }
      };
      var validateCode = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入验证码'));
        } else {
          callback();
        }
      };
      var validateUsername = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入用户名'));
        } else if(value != this.user.username){
          callback(new Error('用户名错误'))
        }else {
          callback();
        }
      };
      
      return {
        email: '',
        emailForm: {
          email: '',
          code:''
        },
        emailRules: {
          email: [{
              validator: validateEmail,
              trigger: 'blur'
          }],
          code: [{
            validator: validateCode,
            trigger: 'blur'
          }]
        },
        passwordForm:{
          username:'',
          newPassword:'',
          checkPassword:''
        },
        passwordRules:{
          username: [{
              validator: validateUsername,
              trigger: 'blur'
          }],
          newPassword: [{
              validator: validatePass,
              trigger: 'blur'
            },
            {
              min: 6,
              max: 12,
              message: '密码长度为6~12',
              trigger: 'blur'
            }],
          checkPassword: [{
              validator: validatePass2,
              trigger: 'blur'
            },
            {
              min: 6,
              max: 12,
              message: '密码长度为6~12',
              trigger: 'blur'
            }],
        },
        isValidEmail:true,
        companyId: 0,
        user:{}
      }
    },
    methods: {
      validateEmailHandler: function () {
        this.$axios.get(`/api/mails/getCheckCode/${this.emailForm.email}`)
        .then(res => {
          if(res.status == 200){
            this.user = res.data
            this.companyId = this.user.companyId
            this.$message({
              message: '验证码已发送，请登录邮箱查看验证码',
              type: 'success'
            })
          }
        })
        .catch(err => {
          if(err.response.status == 404){
            this.$message({
              message:'邮箱不存在，请重新输入',
              type:'error'
            })
          }
        })
        return true;
      },
      validateCodeHandler: function () {
        this.$axios({
          method:'POST',
          url:`/api/mails/checkCode/${this.emailForm.code}`,
          data: this.user
          })
        .then(res => {
          if(res.status == 200){
            this.isValidEmail = false
            this.$message({
              message:'验证成功',
              type:'success'
            })
          }
        })
        .catch(err => {
          if(err.response.status == 400){
            this.$message({
              message:'验证码错误，请重新输入',
              type:'error'
            })
          }
        })
        return true;
      },
      finishHandler: function (formName) {
        let form = this.passwordForm
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$axios({
              method: 'PUT',
              url: '/api/user/changePassword',
              params: {
                CId: this.companyId,
                username:form.username,
                newPassword: form.newPassword
              }
            }).then(res => {
              if(res.status == 200){
                this.$store.commit('setPassword',form.newPassword)
                this.$refs['passwordForm'].resetFields();
                this.resetHandler(true);
              }
            }).catch(err => {
              
            })
          }
        });
      },
      toLogin: function () {
        this.$router.push('/');
      },
      giveUpReset:function(){
        this.toLogin()
      },
      resetHandler: function (result) {
        if (result) {
          this.$message({
            message: '密码重置成功，将在三秒后跳转至登录界面',
            type: 'success'
          });
          setTimeout(this.toLogin, 3000);
        } else {
          this.$message.error('密码重置失败，请重试！');
        }
      },
      cancelHandler: function () {
        this.$confirm('放弃重置密码?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.toLogin();
        }).catch();
      },
      beforeRouteLeave(to, from, next) {
        this.email = '';
        next();
      }
    }
}
</script>

<style scoped>
.reset-password{
  height: 100%;
  width: 100%;
  background-size: cover;
  text-align: center;
}
.wrap{
  width: 30%;
  height: 480px;
  position: absolute;
  top: 350px;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
}
.login-wrap-top{
  height: 100px;
  margin: 25px;
  font-size: 20px;
  color: rgb(75, 75, 75);
  font-weight: 500;
}
.wrap-top{
  height: 100px;
  line-height: 100px;
  font-size: 24px;
  color: #EB8C00;
}
.form{
  margin:20px 0;
}
</style>

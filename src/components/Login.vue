<template>
  <div class="login">
    <div style="background:rgba(0,0,0,0.2);height:100%;width:100%;">
      <div class="login-wrap">
        <div class="login-wrap-top">
          <el-row>
            <img src="../image/login_logo.png" style="width:30%;" alt="">
          </el-row>
          <el-row style="margin-top:10px;">
            <span>登录</span>
          </el-row>
        </div>
        <div class="login-form">
          <el-row type="flex" justify="center">
            <el-col :span="18">
              <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="form">
                <el-form-item prop="username">
                  <el-input v-model="ruleForm.username" placeholder="用户名" class="login-input">
                    <i slot="prefix" class="iconfont icon-yonghu"></i>
                  </el-input>
                </el-form-item>
                <el-form-item label="" prop="password" class="password">
                  <el-input type="password" v-model="ruleForm.password" placeholder="密码"  class="login-input" style="margin-top:20px;">
                    <i slot="prefix" class="iconfont icon-mima"></i>
                  </el-input>
                </el-form-item>
                <el-form-item class="login-button">
                  <el-button type="primary" @click="handleLogin('ruleForm')" style="margin:50px 0 0 0;width:100%" >登录</el-button>
              </el-form-item>
                  <el-button type="text" @click="toResetPassword" style="color:#ddd;">重置密码</el-button>
              </el-form>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'Login',
  data(){
      return{
        responseStatus:0,
        ruleForm: {
          username: '',
          password: ''
        },
        vedioCanPlay: false,
        fixStyle: '',
        rules: {
          username: [{
              required: true,
              message: '请输入用户名',
              trigger: 'blur'
            }
          ],
          password: [{
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            },
            {
              min: 4,
              max: 15,
              message: '密码长度为6~15',
              trigger: 'blur'
            }
          ],
        }
      }
  },
  methods:{
    handleLogin(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$axios.post('/api/user/login?password='+this.ruleForm.password+
            '&username='+this.ruleForm.username)
            .then(res => {
              if(res.status == 200){
                this.$message({
                  message: '登录成功',
                  type: 'success'
                });
                this.$store.commit('setUsername', this.ruleForm.username);
                this.$store.commit('setPassword', this.ruleForm.password);
                this.$store.commit('setRole',res.data.role);
                this.$store.commit('setToken',res.headers.authorization);
                this.$store.commit('setCompanyId',res.data.companyId)
                
                this.afterLogin()
              }
            })
            .catch(err => {
              let status = err.response.status
              if(status == 404){
                this.$message({
                  message: '用户不存在，请重试',
                  type: 'error'
                })
              } else if (status == 400){
                this.$message({
                  message: '密码错误，请重试',
                  type: 'error'
                })
              }
              this.$refs[formName].resetFields();
            })
          } else {
            return false;
          }
        });
    },
    afterLogin:function(){
      let role = this.$store.state.role;
      if(role == 'ROLE_ADMIN1'){
        this.$router.push('/homePage/templateList')
      } else if (role == 'ROLE_ADMIN2'){
        this.$router.push(`/homePage/companyUsers/${this.$store.state.companyId}`)
      } else {
        this.$router.push('/main/modules')
      }
    },
    toResetPassword:function(){
      this.$router.push('/resetPassword')
    }
  }
}
</script>

<style>
.login{
  height: 100%;
  width: 100%;
  background: url('../image/login_background.jpg');
  background-size: cover;
  text-align: center;
}
/* .login-wrap{
  width: 400px;
  position: absolute;
  top: 350px;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
} */
.login-wrap{
  width: 30%;
  position: absolute;
  top: 350px;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0);
}
.login-wrap-top{
  height: 100px;
  margin: 25px;
  font-size: 20px;
  color: #EB8C00;
  font-weight: 500;
}
.login-button .el-button--primary:hover{
  color: #fff;
  background-color: rgb(236, 159, 44);
  border: rgb(238, 156, 34) solid 1px;
}
.login-button .el-button--primary{
  color: #FFF;
  background-color: #EB8C00;
  border: #EB8C00 solid 1px;
}
.login-input .el-input__inner{
  background: rgba(255, 255, 255, 0.2);
  border: 0;
  color: #fff;
}
</style>

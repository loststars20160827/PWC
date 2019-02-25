<template>
  <div class="banner">
    <img class="logo" src="../image/logo.png" alt="avatar" />
    <div class="text">
      <span class="name">ESG 管理平台</span>
      <span class="account">
        <el-dropdown @command="handleCommand">
          
          <span class="el-dropdown-link">
            <i class="iconfont icon-yonghu1"  style="color:#fff;font-size:14px;margin-right:5px;"></i>
            {{this.$store.state.username}}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="personalPage">个人主页</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavigationBar',
  data: function() {
    return {}
  },
  methods: {
    handleCommand(command) {
      if(command == 'personalPage'){
        this.$router.push('/main/personalPage')
      } else if(command == 'logout') {
        this.$store.commit('setToken','')
        this.$router.push('/')
      }
    }
  },
  props: {
  },
  computed: {
  }
}
</script>

<style scoped>
.banner {
  display: flex;
  flex-direction: row;
}
.logo {
  width: 80px;
  height: 80px;
}
.text {
  color: white;
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: #f68600;
  align-items: center;
}
.name {
  margin-left: 20px;
  font-weight: bold;
  font-size: 18px;
}
.account {
  margin-right: 20px;
  font-size: 14px;
}

 .el-dropdown-link {
    cursor: pointer;
    color: #fff;
    font-weight: bold
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
</style>

import Vue from 'vue'
import './assets/theme/index.css'
import ElementUI from 'element-ui'
import App from './App'
import router from './router'
import './icon_font/iconfont.css'
import store from './store'
import http from 'axios'

Vue.config.productionTip = false

Vue.prototype.$axios=http
Vue.use(ElementUI)

import echarts from 'echarts'
Vue.prototype.$echarts = echarts

new Vue({
  render: h => h(App),
  router,
  store,
}).$mount('#app')
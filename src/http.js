import axios from 'axios'
import router from './router'

axios.defaults.baseURL = 'http://47.100.234.18:8080'

// http request 拦截器
axios.interceptors.request.use(
  config => {
      if (localStorage.getItem('token')) {  // 判断是否存在token，如果存在的话，则每个http header都加上token
          config.headers.authorization = localStorage.getItem('token')
      }
      config.baseURL = '/api'
      return config;
  },
  err => {
      return Promise.reject(err);
  });

// http response 拦截器
axios.interceptors.response.use(
  response => {
      return response;
  },
  error => {
      if (error.response) {
          switch (error.response.status) {
              case 401:
                  // TODO:清除token信息并跳转到登录页面
                  localStorage.removeItem('token')
                  router.replace({
                      name: 'login',
                      param: {redirect: router.currentRoute.fullPath}
                  })
                  break
            // case 403: 
            //       router.replace({
            //         path: '403',
            //         query: {redirect: router.currentRoute.fullPath}
            //     })
          }
      }
      return Promise.reject(error.response.data)   // 返回接口返回的错误信息
  });
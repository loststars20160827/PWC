import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import TemplateForm from '@/components/TemplateForm'
import Main from '@/components/Main'
import ResetPassword from '@/components/ResetPassword'
import Modules from '@/components/Modules'
import Module from '@/components/Module'
import TemplateList from '@/components/TemplateList'
import HomePage from '@/components/HomePage'
import Guests from '@/components/Guests'
import Forbidden from '@/components/Forbidden'
import CompanyUsers from '@/components/CompanyUsers'
import Analysis from '@/components/Analysis'
import PersonalPage from '@/components/PersonalPage'
import DataManagement from '@/components/DataManagement'
import ESGManagement from '@/components/ESGManagement'

Vue.use(Router)

const router = new Router({
  routes:[{
    path:'/',
    name:'login',
    component: Login
  },{
    path:'/resetPassword',
    name:'resetPassword',
    component: ResetPassword
  },{
    path:'/403',
    name:'forbidden',
    component: Forbidden
  },
  {
      path:'/homepage',
      name:'homePage',
      component:HomePage,
      children:[{
        path:'templateForm/:cid/:name-:tid',
        name:'templateForm',
        meta:{
          requireAuth: true
        },
        component:TemplateForm
      },{
        path:'guests',
        name:'guests',
        meta:{
          requireAuth: true
        },
        component:Guests
      },{
        path:'analysis',
        name:'analysis',
        meta:{
          requireAuth: true
        },
        component:Analysis
      },{
        path:'templateList',
        name:'templateList',
        meta:{
          requireAuth: true
        },
        component:TemplateList
      },{
        path:'companyUsers/:id',
        name:'companyUsers',
        meta:{
          requireAuth: true
        },
        component:CompanyUsers
      },{
        path:'dataManagement',
        name:'dataManagement',
        meta:{
          requireAuth: true
        },
        component:DataManagement
      },{
        path:'esgManagement',
        name:'esgManagement',
        meta:{
          requireAuth: true
        },
        component:ESGManagement
      }]
    },
  {
    path:'/main',
    name:'main',
    component: Main,
    children:[{
      path:'modules',
      name:'modules',
      meta:{
        requireAuth: true
      },
      component:Modules
    },{
      path:'module/:name-:id',
      name:'module',
      meta:{
        requireAuth: true
      },
      component:Module
    },{
      path:'personalPage',
      name:'personalPage',
      meta:{
        requireAuth: true
      },
      component:PersonalPage
    },]
  }]
});


router.beforeEach((to, from, next) => {
  if (to.matched.some(r => r.meta.requireAuth)) {
    if (localStorage.getItem('token')) {
      next();
    }
    else {
      next({
        name: 'login',
        param: {redirect: to.fullPath}
      })
    }
  }
  else {
    next();
  }
})


export default router;
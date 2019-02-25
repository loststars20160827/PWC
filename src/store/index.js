import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        username: localStorage.getItem('username')?localStorage.getItem('username'):'',
        password: localStorage.getItem('password')?localStorage.getItem('password'):'',
        token:localStorage.getItem('token')?localStorage.getItem('token'):'',
        role:localStorage.getItem('role')?localStorage.getItem('role'):'',
        companyId: localStorage.getItem('companyId')?localStorage.getItem('companyId'): 0
    },
    mutations: {
        setUsername(state, username) {
            state.username = username;
            localStorage.setItem('username',username);
        },
        setPassword(state, password) {
            state.password = password;
            localStorage.setItem('password',password);
        },
        setToken(state,token){
            state.token = token;
            localStorage.setItem('token',token);
        },
        setRole(state,role){
            state.role = role;
            localStorage.setItem('role',role);
        },
        setCompanyId(state,companyId){
            state.companyId = companyId ;
            localStorage.setItem('companyId',companyId);
        }
    }
})
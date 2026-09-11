import { createRouter, createWebHistory } from 'vue-router'
import LogIn from '../components/LogIn.vue' 
import adminView from '../views/adminView.vue' 

const routes = [
  { path: '/', name: 'login', component: LogIn },
  { path: '/admin', name: 'admin', component: adminView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
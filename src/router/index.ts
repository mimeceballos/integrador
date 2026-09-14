import { createRouter, createWebHistory } from 'vue-router'
import LogIn from '../components/LogIn.vue' 
import adminView from '../views/adminView.vue' 
import inicio from '../views/inicio.vue' 
import historias from '../views/principal/Historias.vue'
import sistemas from '../views/principal/Sistemas.vue'
import roles from '../views/principal/Roles.vue'
import usuarios from '../views/principal/Usuarios.vue'


const routes = [
  { path: '/', name: 'login', component: LogIn },
  { path: '/admin', name: 'admin', component: inicio },
  {path: '/admin/historias', name:'historias', component:historias},
  {path: '/admin/sistemas', name:'sistemas', component:sistemas},
  {path: '/admin/roles', name:'roles', component:roles},
  {path: '/admin/usuarios', name:'usuarios', component:usuarios}
]



const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
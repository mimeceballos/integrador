import { createRouter, createWebHistory } from 'vue-router'
import LogIn from '../components/LogIn.vue' 
// import adminView from '../views/adminView.vue' 
import inicio from '../views/inicio.vue' 

import historias from '../views/principal/Historias.vue'
import sistemas from '../views/principal/Sistemas.vue'
import roles from '../views/principal/Roles.vue'
import usuarios from '../views/principal/Usuarios.vue'

// Componentes internos de Sistemas
import SistemaLista from '../components/sistemas/SistemaLista.vue'
import SistemaDetalle from '../components/sistemas/SistemaDetalle.vue'
import SistemaForm from '../components/sistemas/SistemaForm.vue'

const routes = [
  { path: '/', name: 'login', component: LogIn },
  { path: '/admin', name: 'admin', component: inicio },

    // Módulos existentes de los compañeros
  {path: '/admin/historias', name:'historias', component:historias},
  {path: '/admin/roles', name:'roles', component:roles},
  {path: '/admin/usuarios', name:'usuarios', component:usuarios},

   // Nuevo Módulo para enrutar Sistemas
  {
    path: '/admin/sistemas',
    name: 'sistemas',
    component: sistemas,

    children: [
      {
        path: '',
        name: 'sistemas-lista',
        component: SistemaLista
      },
      {
        path: 'nuevo',
        name: 'sistemas-nuevo',
        component: SistemaForm
      },
      {
        path: ':id',
        name: 'sistemas-detalle',
        component: SistemaDetalle
      },
      {
        path: ':id/editar',
        name: 'sistemas-editar',
        component: SistemaForm
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
import { createRouter, createWebHistory } from 'vue-router'
import LogIn from '../components/LogIn.vue' 
import inicio from '../views/inicio.vue' 

import historias from '../views/principal/Historias.vue'
import roles from '../views/principal/Roles.vue'
import usuarios from '../views/principal/Usuarios.vue'

// Componentes de Sistemas
import SistemaLista from '../components/sistemas/SistemaLista.vue'
import SistemaDetalle from '../components/sistemas/SistemaDetalle.vue'
import SistemaForm from '../components/sistemas/SistemaForm.vue'

const routes = [
  { path: '/', name: 'login', component: LogIn },

  // RUTA PADRE: inicio.vue (Barra lateral + Header + Área de contenido)
  { 
    path: '/portal', 
    name: 'portal', 
    component: inicio, 
    children: [
      // Al entrar a /admin, redirige directo a la lista de sistemas
      {
        path: '',
        redirect: '/portal/sistemas'
      },

      // Módulos de tus compañeros
      { path: 'historias', name: 'historias', component: historias },
      { path: 'roles', name: 'roles', component: roles },
      { path: 'usuarios', name: 'usuarios', component: usuarios },

      // RUTAS DIRECTAS DE SISTEMAS (sin necesidad de Sistemas.vue)
      {
        path: 'sistemas',
        name: 'sistemas-lista',
        component: SistemaLista
      },
      {
        path: 'sistemas/nuevo',
        name: 'sistemas-nuevo',
        component: SistemaForm
      },
      {
        path: 'sistemas/:id',
        name: 'sistemas-detalle',
        component: SistemaDetalle
      },
      {
        path: 'sistemas/:id/editar',
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
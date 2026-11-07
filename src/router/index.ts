import { createRouter, createWebHistory } from 'vue-router'
import LogIn from '../components/LogIn.vue' 
import inicio from '../views/inicio.vue' 

// NUEVO: Importación de los componentes de Historias de Usuario desde src/historias/
import HistoriaLista from '../components/historias/HistoriaLista.vue'
import HistoriaForm from '../components/historias/HistoriaForm.vue'

// Importación de los componentes de usuarios desde src/components/usuarios/
import UsuarioLista from '../components/usuarios/UsuarioLista.vue'
import UsuarioForm from '../components/usuarios/UsuarioForm.vue'

// Importación de los componentes de sistemas desde src/components/sistemas/
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
      // Al entrar a /portal, redirige directo a la lista de sistemas
      {
        path: '',
        redirect: '/portal/sistemas'
      },

      /* =========================================================================
       * RUTAS DEL MÓDULO DE HISTORIAS DE USUARIO
       * Gestiona la visualización del listado, creación y edición
       * ========================================================================= */
      { 
        path: 'historias', 
        name: 'historias-lista', 
        component: HistoriaLista 
      },
      {
        path: 'historias/nuevo',
        name: 'historias-nuevo',
        component: HistoriaForm
      },
      {
        path: 'historias/:id/editar',
        name: 'historias-editar',
        component: HistoriaForm
      },

      /* =========================================================================
       * RUTAS DEL MÓDULO DE USUARIOS
       * ========================================================================= */
      { 
        path: 'usuarios', 
        name: 'usuarios', 
        component: UsuarioLista 
      },
      {
        path: 'usuarios/nuevo',
        name: 'usuarios-nuevo',
        component: UsuarioForm
      },
      {
        path: 'usuarios/:id/editar',
        name: 'usuarios-editar',
        component: UsuarioForm
      },

      /* =========================================================================
       * RUTAS DEL MÓDULO DE SISTEMAS
       * ========================================================================= */
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
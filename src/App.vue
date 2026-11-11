<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, computed, provide, onMounted, onUnmounted } from 'vue'

/*SESIÓN Y PERMISOS*/
export type PermissionCode = 1 | 2 | 3

//estructura exacta que debe tener el usuario autenticado
export interface UserProfile {
  email: string
  name: string
  roleName: string
  permissions: {
    sistemas: PermissionCode
    usuarios: PermissionCode
    roles: PermissionCode
    historias: PermissionCode
  }
}

/* Permite UserProfile o null (el usuario ya identificado) */
const currentUser = ref<UserProfile | null>(null)

//recupera el texto guardado (del localStorage) bajo la clave 'auth_user' y convierte de texto JSON a un objeto JavaScript
function cargarUsuarioSesion() {
  const sessionData = localStorage.getItem('auth_user')
  currentUser.value = sessionData ? JSON.parse(sessionData) : null
}

//lee la sesión existente
cargarUsuarioSesion()


//---sincronizacionnn

//vuelve a llamar cargarUsuarioSesion() para refrescar los datos
function manejarCambioSesion() {
  cargarUsuarioSesion()
}

onMounted(() => {
  window.addEventListener('storage', manejarCambioSesion) //Detecta cambios en el localStorage
  window.addEventListener('auth-change', manejarCambioSesion) //evento al cambiar de usuario 
})

onUnmounted(() => {
  window.removeEventListener('storage', manejarCambioSesion)
  window.removeEventListener('auth-change', manejarCambioSesion)
})

//evalúan en tiempo real el nivel de acceso para cada módulo / por defecto debe ser 1
const permSistemas = computed(() => currentUser.value?.permissions?.sistemas ?? 1)
const permUsuarios = computed(() => currentUser.value?.permissions?.usuarios ?? 1)
const permHistorias = computed(() => currentUser.value?.permissions?.historias ?? 1)
const permRoles = computed(() => currentUser.value?.permissions?.roles ?? 1)

//Pone a disposición de cualquier vista/componente el acceso directo a los permisos computados mediante la clave asignada
//si la sesión cambia en App.vue, todas las vistas de la aplicación se actualizan
provide('permisoSistemas', permSistemas)
provide('permisoUsuarios', permUsuarios)
provide('permisoHistorias', permHistorias)
provide('permisoRoles', permRoles)
</script>

<template>
  <RouterView />
</template>
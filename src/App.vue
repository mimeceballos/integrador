<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'
import { ref, computed, provide, onMounted, onUnmounted } from 'vue'
import {
  verificarSesionActiva,
  setCookie,
  getCookie,
  cerrarSesionCompleta
} from './utils/cookies'

/* SESIÓN Y PERMISOS */
export type PermissionCode = 1 | 2 | 3

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

const router = useRouter()
const route = useRoute()
const currentUser = ref<UserProfile | null>(null)

// Tiempo máximo sin actividad antes de cerrar sesión (en minutos)
const MINUTOS_INACTIVIDAD = 2
let timerInactividad: ReturnType<typeof setTimeout>

function cargarUsuarioSesion() {
  // Ahora exige que TANTO la cookie 'usuario' como 'auth_user' existan
  if (verificarSesionActiva()) {
    const sessionData = localStorage.getItem('auth_user')
    currentUser.value = sessionData ? JSON.parse(sessionData) : null
  } else {
    currentUser.value = null
  }
}

cargarUsuarioSesion()

function manejarCambioSesion() {
  cargarUsuarioSesion()
  reiniciarTemporizador()
}

// --- CONTROL DE INACTIVIDAD Y VERIFICACIÓN DE COOKIE ---
function expiroPorInactividad() {
  if (verificarSesionActiva()) {
    cerrarSesionCompleta()
    currentUser.value = null
    alert('Tu sesión ha expirado por inactividad.')
    router.push('/')
  }
}

function reiniciarTemporizador() {
  clearTimeout(timerInactividad)
  const usuarioCookie = getCookie('usuario')

  if (usuarioCookie && localStorage.getItem('auth_user')) {
    // Renueva la cookie por otros 5 minutos mientras el usuario siga activo
    setCookie('usuario', usuarioCookie, MINUTOS_INACTIVIDAD)
    timerInactividad = setTimeout(expiroPorInactividad, MINUTOS_INACTIVIDAD * 60 * 1000)
  } else if (route.path !== '/') {
    // Si el usuario abrió el inspector, borró la cookie y mueve el mouse dentro de /portal:
    cerrarSesionCompleta()
    currentUser.value = null
    router.push('/')
  }
}

const eventosActividad = ['mousemove', 'keydown', 'click', 'scroll']

onMounted(() => {
  window.addEventListener('storage', manejarCambioSesion)
  window.addEventListener('auth-change', manejarCambioSesion)
  eventosActividad.forEach(ev => window.addEventListener(ev, reiniciarTemporizador))
  reiniciarTemporizador()
})

onUnmounted(() => {
  window.removeEventListener('storage', manejarCambioSesion)
  window.removeEventListener('auth-change', manejarCambioSesion)
  eventosActividad.forEach(ev => window.removeEventListener(ev, reiniciarTemporizador))
  clearTimeout(timerInactividad)
})

// Permisos reactivos (exactamente como los tenías)
const permSistemas = computed(() => currentUser.value?.permissions?.sistemas ?? 1)
const permUsuarios = computed(() => currentUser.value?.permissions?.usuarios ?? 1)
const permHistorias = computed(() => currentUser.value?.permissions?.historias ?? 1)
const permRoles = computed(() => currentUser.value?.permissions?.roles ?? 1)

provide('permisoSistemas', permSistemas)
provide('permisoUsuarios', permUsuarios)
provide('permisoHistorias', permHistorias)
provide('permisoRoles', permRoles)
</script>

<template>
  <RouterView />
</template>
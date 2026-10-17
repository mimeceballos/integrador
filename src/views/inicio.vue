<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide, type Component } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LogOut, Monitor, Users, ShieldCheck, BookOpen } from 'lucide-vue-next'

// Importamos los datos compartidos de los sistemas
import { sistemas } from '../data/sistemas'

const router = useRouter()
const route = useRoute()

type PermissionCode = 1 | 2 | 3

interface UserProfile {
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

// Estructura de cada item del menú lateral
interface MenuItem {
  key: string
  name: string
  route: string
  level: number
  icon: Component
  requiresProject: boolean
  isAllowedByProject: boolean
  blockedReason: string
}

const isUserMenuOpen = ref(false)
const currentUser = ref<UserProfile | null>(null)

// ID del proyecto seleccionado en la app
const proyectoActivoId = ref<number | null>(null)

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function closeUserMenu() {
  isUserMenuOpen.value = false
}

function cargarProyectoActivo() {
  // Siempre iniciará sin proyecto seleccionado por defecto
  proyectoActivoId.value = null
  localStorage.removeItem('proyecto_activo_id')
}

// Callback que reacciona cada vez que SistemasView emite el evento 'proyecto-cambiado'
function handleProyectoCambiado(event: Event) {
  const customEvent = event as CustomEvent<number | null>
  proyectoActivoId.value = customEvent.detail
}

onMounted(() => {
  const sessionData = localStorage.getItem('auth_user')
  if (sessionData) {
    currentUser.value = JSON.parse(sessionData)
  } else {
    router.push('/')
  }

  cargarProyectoActivo()
  // Escuchamos el evento personalizado global enviado desde SistemasView.vue
  window.addEventListener('proyecto-cambiado', handleProyectoCambiado)
})

onUnmounted(() => {
  // Limpiamos el listener cuando el componente se desdesmonta
  window.removeEventListener('proyecto-cambiado', handleProyectoCambiado)
})

/* =========================================================================
 * PROYECTO SELECCIONADO EN TIEMPO REAL
 * Busca en la lista de sistemas el objeto completo que coincida con el ID activo
 * ========================================================================= */
const proyectoActivo = computed(() => {
  if (!proyectoActivoId.value) return null
  return sistemas.value.find(s => s.id === proyectoActivoId.value) || null
})

const activeModuleKey = computed(() => {
  const pathParts = route.path.split('/').filter(Boolean)
  return pathParts[0] === 'admin'
    ? pathParts[1] || 'sistemas'
    : 'sistemas'
})

const currentModulePermission = computed<PermissionCode>(() => {
  if (!currentUser.value) return 1
  const key = activeModuleKey.value as keyof UserProfile['permissions']
  return currentUser.value.permissions[key] ?? 1
})

provide('currentPermission', currentModulePermission)

/* =========================================================================
 * LÓGICA DEL MENÚ NAVBAR LATERAL
 * Calcula si cada opción está Habilitada o Bloqueada según el proyecto activo
 * ========================================================================= */
const menuItems = computed<MenuItem[]>(() => {
  const perms = currentUser.value?.permissions || {
    sistemas: 1,
    usuarios: 1,
    roles: 1,
    historias: 1
  }

  const baseItems = [
    { key: 'sistemas', name: 'Sistemas', route: '/portal/sistemas', level: perms.sistemas, icon: Monitor, requiresProject: false },
    { key: 'usuarios', name: 'Usuarios', route: '/portal/usuarios', level: perms.usuarios, icon: Users, requiresProject: true },
    { key: 'roles', name: 'Roles', route: '/portal/roles', level: perms.roles, icon: ShieldCheck, requiresProject: true },
    { key: 'historias', name: 'Historias', route: '/portal/historias', level: perms.historias, icon: BookOpen, requiresProject: true }
  ]

  return baseItems.map(item => {
    // 1. El módulo Sistemas siempre está activo independientemente del proyecto
    if (!item.requiresProject) {
      return {
        ...item,
        isAllowedByProject: true,
        blockedReason: ''
      }
    }

    // 2. Si NO hay ningún proyecto activo seleccionado -> Se bloquean Usuarios, Roles e Historias
    if (!proyectoActivo.value) {
      return {
        ...item,
        isAllowedByProject: false,
        blockedReason: 'Selecciona un proyecto en la lista para activar este módulo'
      }
    }

    // 3. Si HAY proyecto activo -> Comprobar las opciones declaradas en 'opcionesNavbar'
    const opcionesPermitidas = proyectoActivo.value.opcionesNavbar ?? ['usuarios', 'roles', 'historias']
    const tienePermisoEspecifico = opcionesPermitidas.includes(item.key)

    return {
      ...item,
      isAllowedByProject: tienePermisoEspecifico,
      blockedReason: tienePermisoEspecifico ? '' : `El proyecto "${proyectoActivo.value.nombre}" no incluye esta opción`
    }
  })
})

function handleLogout() {
  localStorage.removeItem('auth_user')
  router.push('/')
}
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="brand">
        <h2>OPCIONES</h2>
        
        <!-- MUESTRA EL PROYECTO QUE ESTÁ SELECCIONADO ACTUALMENTE -->
        <div class="active-project-indicator" :class="{ 'none': !proyectoActivo }">
          <span class="indicator-label">PROYECTO ACTIVO:</span>
          <span class="indicator-name" :title="proyectoActivo ? proyectoActivo.nombre : 'Ninguno'">
            {{ proyectoActivo ? proyectoActivo.nombre : 'Ninguno' }}
          </span>
        </div>
      </div>

      <!-- MENÚ DE NAVEGACIÓN -->
      <nav class="menu">
        <template v-for="item in menuItems" :key="item.key">
          <!-- Dibujamos el elemento siempre y cuando su permiso de usuario no sea 1 (Desactivo) -->
          <template v-if="item.level !== 1">
            <!-- CASO A: RUTA PERMITIDA POR EL PROYECTO -->
            <router-link
              v-if="item.isAllowedByProject"
              :to="item.route"
              class="menu-item"
              :class="{ 'is-readonly': item.level === 2 }"
            >
              <component :is="item.icon" :size="20" class="menu-icon" />
              <span class="item-name">{{ item.name }}</span>
              <span v-if="item.level === 2" class="badge badge-read" title="Acceso sin manipulación de datos"></span>
              <span v-else-if="item.level === 3" class="badge badge-write" title="Acceso total"></span>
            </router-link>

            <!-- CASO B: RUTA BLOQUEADA HASTA SELECCIONAR UN PROYECTO ADECUADO -->
            <div
              v-else
              class="menu-item disabled"
              :title="item.blockedReason"
            >
              <component :is="item.icon" :size="20" class="menu-icon" />
              <span class="item-name">{{ item.name }}</span>
              <span class="badge badge-disabled">Bloqueado</span>
            </div>
          </template>
        </template>
      </nav>

      <button class="logout-btn" @click="handleLogout">
        <LogOut :size="18" class="logout-icon" />
        <span>Cerrar Sesión</span>
      </button>
    </aside>

    <div class="main-wrapper">
      <header class="top-header">
        <div></div>
        <div></div>
        <h2 class="header-title">Administrador de Proyectos</h2>
        <div v-if="currentUser" class="user-menu-wrapper">
          <button 
            type="button" 
            class="user-card-top" 
            @click="toggleUserMenu"
            :class="{ 'is-active': isUserMenuOpen }"
          >
            <div class="user-avatar">
              {{ currentUser.name.charAt(0) }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentUser.name }}</span>
              <span class="user-role">{{ currentUser.roleName }}</span>
            </div>
            <span class="dropdown-arrow">▾</span>
          </button>

          <!-- DETALLES Y PERFIL DE USUARIO -->
          <div v-if="isUserMenuOpen" class="user-dropdown-card">
            <div class="dropdown-header">
              <h4>Perfil de Usuario</h4>
              <button class="close-btn" @click="closeUserMenu">✕</button>
            </div>

            <div class="dropdown-body">
              <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">{{ currentUser.name }}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Correo:</span>
                <span class="info-value">{{ currentUser.email }}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Rol:</span>
                <span class="info-value">{{ currentUser.roleName }}</span>
              </div>

              <hr class="divider" />

              <div class="permissions-section">
                <h5>Niveles de Permisos:</h5>
                <ul class="permissions-list">
                  <li>
                    <span>Sistemas:</span>
                    <span class="perm-badge" :class="'perm-' + currentUser.permissions.sistemas">
                      {{ currentUser.permissions.sistemas === 1 ? 'Desactivo' : currentUser.permissions.sistemas === 2 ? 'Lectura' : 'Escritura' }}
                    </span>
                  </li>
                  <li>
                    <span>Usuarios:</span>
                    <span class="perm-badge" :class="'perm-' + currentUser.permissions.usuarios">
                      {{ currentUser.permissions.usuarios === 1 ? 'Desactivo' : currentUser.permissions.usuarios === 2 ? 'Lectura' : 'Escritura' }}
                    </span>
                  </li>
                  <li>
                    <span>Roles:</span>
                    <span class="perm-badge" :class="'perm-' + currentUser.permissions.roles">
                      {{ currentUser.permissions.roles === 1 ? 'Desactivo' : currentUser.permissions.roles === 2 ? 'Lectura' : 'Escritura' }}
                    </span>
                  </li>
                  <li>
                    <span>Historias:</span>
                    <span class="perm-badge" :class="'perm-' + currentUser.permissions.historias">
                      {{ currentUser.permissions.historias === 1 ? 'Desactivo' : currentUser.permissions.historias === 2 ? 'Lectura' : 'Escritura' }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="content">
        <router-view :permission="currentModulePermission" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background-color: #F2F2F2;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.user-menu-wrapper {
  position: relative;
}

.user-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #FBEAF9;
  padding: 6px 14px;
  border-radius: 30px;
  border: 1px solid #F0CBEC;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.user-card-top:hover,
.user-card-top.is-active {
  background: #F5D6F2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.dropdown-arrow {
  font-size: 12px;
  color: #5F0032;
  margin-left: 4px;
}

.user-dropdown-card {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  border: 1px solid #eef2f6;
  padding: 18px;
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.dropdown-header h4 {
  margin: 0;
  font-size: 14px;
  color: #5F0032;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 14px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
}

.info-label {
  color: #777;
  font-weight: 500;
}

.info-value {
  color: #1a1a1a;
  font-weight: 700;
}

.divider {
  border: none;
  border-top: 1px dashed #e2e8f0;
  margin: 12px 0;
}

.permissions-section h5 {
  margin: 0 0 10px;
  font-size: 12px;
  color: #5F0032;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.permissions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.permissions-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #444;
}

.perm-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
}

.perm-1 { background-color: #fee2e2; color: #991b1b; }
.perm-2 { background-color: #fef3c7; color: #92400e; }
.perm-3 { background-color: #d1fae5; color: #065f46; }

/* REGLAS STRICTAS PARA CONSERVAR EL ANCHO FIJO DE 260px EN LA BARRA LATERAL */
.sidebar {
  position: relative;
  z-index: 1;
  width: 260px;
  min-width: 260px;
  max-width: 260px;
  background-color: #5F0032;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 24px 18px;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.brand h2 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #E8F9A2;
  text-transform: uppercase;
  text-align: center;
}

.active-project-indicator {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(232, 249, 162, 0.3);
  padding: 8px 12px;
  border-radius: 10px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.active-project-indicator.none {
  border-color: rgba(254, 226, 226, 0.3);
}

.indicator-label {
  font-size: 9px;
  color: #E8F9A2;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.active-project-indicator.none .indicator-label {
  color: #fca5a5;
}

.indicator-name {
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  gap: 12px;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  min-height: 48px;
}

.menu-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.22);
  transform: translateX(3px);
}

.menu-item.router-link-active {
  background: #E8F9A2;
  color: #5F0032;
}

.menu-item.is-readonly.router-link-active {
  background: #EAA2E5;
}

.menu-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.15);
}

.item-name {
  flex-grow: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-icon {
  flex-shrink: 0;
  stroke-width: 2.2;
}

.badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  flex-shrink: 0;
}

.badge-read {
  background-color: #fca5a5;
  color: #7f1d1d;
}

.badge-write {
  background-color: #d9efbd;
  color: #2d5a1e;
}

.badge-disabled {
  background-color: rgba(255, 255, 255, 0.15);
  color: #fca5a5;
  font-size: 9px;
}

.logout-btn {
  margin-top: auto;
  padding: 13px;
  background: #99154E;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
}

.logout-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.logout-icon {
  flex-shrink: 0;
  stroke-width: 2.5;
}

.main-wrapper {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #000000;
}

.top-header {
  position: relative;
  height: 70px;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 36px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F1C0EC;
  color: #5F0032;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
}

.user-role {
  font-size: 11px;
  color: #99154E;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 32px;
}
</style>
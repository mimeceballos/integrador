<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 1 = Desactivo, 2 = Lectura, 3 = Escritura
type PermissionCode = 1 | 2 | 3
//datos del usuario autentificado (estructura)
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
//abrir o cerrar el menú desplegable 
const isUserMenuOpen = ref(false)

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function closeUserMenu() {
  isUserMenuOpen.value = false
}
//almacena la informacion del usuario con sesion activa
const currentUser = ref<UserProfile | null>(null)
//guard autentificacion al cargar el componente
onMounted(() => {
  const sessionData = localStorage.getItem('auth_user')
  if (sessionData) {
    currentUser.value = JSON.parse(sessionData)
  } else {
    router.push('/')
  }
})
const activeModuleKey = computed(() => {
  const pathParts = route.path.split('/')
  return pathParts[pathParts.length - 1] || 'sistemas'
})
//Obtiene el nivel de permiso del usuario para el módulo activo
const currentModulePermission = computed<PermissionCode>(() => {
  if (!currentUser.value) return 1
  const key = activeModuleKey.value as keyof UserProfile['permissions']
  return currentUser.value.permissions[key] ?? 1
})
//pasa el nivel de permiso a los hijos
provide('currentPermission', currentModulePermission)

//  Menú Lateral
//Construye las opciones del menú lateral dinámicamente según permisos
const menuItems = computed(() => {
  const perms = currentUser.value?.permissions || {
    sistemas: 1,
    usuarios: 1,
    roles: 1,
    historias: 1
  }

  return [
    { id: 1, name: 'Sistemas', route: '/admin/sistemas', level: perms.sistemas },
    { id: 2, name: 'Usuarios', route: '/admin/usuarios', level: perms.usuarios },
    { id: 3, name: 'Roles', route: '/admin/roles', level: perms.roles },
    { id: 4, name: 'Historias', route: '/admin/historias', level: perms.historias }
  ]
})

function handleLogout() {
  localStorage.removeItem('auth_user')
  router.push('/')
}
</script>

<template>
  <div class="admin-layout">
    <!-- PANEL IZQUIERDO -->
    <aside class="sidebar">
      <div class="brand">
        <h2>OPCIONES</h2>
      </div>
<!--menu-->
      <nav class="menu">
        <template v-for="item in menuItems" :key="item.id">
          <!-- SI EL PERMISO ES 1: Desactivo, opción se oculta de la navegación -->
          <!-- Se dibuja el botón si el nivel de permiso es diferente de 1-->
          <router-link
            v-if="item.level !== 1"
            :to="item.route"
            class="menu-item"
            :class="{ 'is-readonly': item.level === 2 }"
          >
            <span class="item-name">{{ item.name }}</span>
            <span v-if="item.level === 2" class="badge badge-read" title="Acceso sin manipulación de datos">
            </span>
            <span v-else-if="item.level === 3" class="badge badge-write" title="Acceso total">
            </span>
          </router-link>
        </template>
      </nav>

      <button class="logout-btn" @click="handleLogout">
        Cerrar Sesión
      </button>
    </aside>

    <div class="main-wrapper">
     <header class="top-header">
  <div class="header-title"></div>
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

    <!-- MENÚ / DETALLES DEL USUARIO -->
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
<!-- Sección con desglose detallado de permisos -->
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
<!-- VISTA DINÁMICA DEL MÓDULO (Pasando permisos vía props) -->
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
  background-color: #f6f3cf;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.user-menu-wrapper {
  position: relative;
}

.user-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fffde1;
  padding: 6px 14px;
  border-radius: 30px;
  border: 1px solid #f2eab4;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.user-card-top:hover,
.user-card-top.is-active {
  background: #f7f3be;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.dropdown-arrow {
  font-size: 12px;
  color: #4d6787;
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
  color: #4d6787;
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
  color: #4d6787;
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

.perm-1 { background-color: #fee2e2; color: #991b1b; } /* Desactivo */
.perm-2 { background-color: #fef3c7; color: #92400e; } /* Lectura */
.perm-3 { background-color: #d1fae5; color: #065f46; } /* Escritura */
.sidebar {
  width: 260px;
  background-color: #4d6787;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 24px 18px;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
}

.brand h2 {
  margin: 0 0 30px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #fffde1;
  text-align: center;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateX(3px);
}

.menu-item.router-link-active {
  background: #cfebff;
  color: #4d6787;
}

.menu-item.is-readonly.router-link-active {
  background: #e3e8f0;
}

/* BADGES PASTEL */
.badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
}

.badge-read {
  background-color: #fca5a5;
  color: #7f1d1d;
}

.badge-write {
  background-color: #d9efbd;
  color: #2d5a1e;
}

.logout-btn {
  margin-top: auto;
  padding: 12px;
  background: #fdc086;
  color: #4a2810;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #fdb068;
}

/* CONTENEDOR DERECHO */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-header {
  height: 70px;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 36px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.current-view-name {
  font-weight: 700;
  color: #4d6787;
  font-size: 15px;
  letter-spacing: 0.5px;
}

.user-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fffde1;
  padding: 6px 14px;
  border-radius: 30px;
  border: 1px solid #f2eab4;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #cfebff;
  color: #4d6787;
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
  color: #a5af79;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 32px;
}
</style>
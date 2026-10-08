<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 1 = Desactivo, 2 = Lectura, 3 = Escritura
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

// Interfaz para los elementos del menú lateral
interface MenuItem {
  id: number
  name: string
  route: string
  level: number
  image?: string
}

const isUserMenuOpen = ref(false)

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function closeUserMenu() {
  isUserMenuOpen.value = false
}

const currentUser = ref<UserProfile | null>(null)

onMounted(() => {
  const sessionData = localStorage.getItem('auth_user')
  if (sessionData) {
    currentUser.value = JSON.parse(sessionData)
  } else {
    router.push('/')
  }
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

// Función para obtener la URL dinámica de las imágenes en PNG
const getImageUrl = (name: string) => {
  return new URL(`../assets/img/${name}.png`, import.meta.url).href
}

// Menú Lateral (Único y correcto)
const menuItems = computed<MenuItem[]>(() => {
  const perms = currentUser.value?.permissions || {
    sistemas: 1,
    usuarios: 1,
    roles: 1,
    historias: 1
  }

  return [
    { id: 1, name: 'Sistemas', route: '/portal/sistemas', level: perms.sistemas, image: getImageUrl('icono_sistemas') },
    { id: 2, name: 'Usuarios', route: '/portal/usuarios', level: perms.usuarios, image: getImageUrl('icono_usuarios') },
    { id: 3, name: 'Roles', route: '/portal/roles', level: perms.roles, image: getImageUrl('icono_roles') },
    { id: 4, name: 'Historias', route: '/portal/historias', level: perms.historias, image: getImageUrl('icono_historias') }
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

      <nav class="menu">
        <template v-for="item in menuItems" :key="item.id">
          <!-- PERMISO 1: Desactivo -->
          <router-link
            v-if="item.level !== 1"
            :to="item.route"
            class="menu-item"
            :class="{ 'is-readonly': item.level === 2 }"
          >
            <!-- ÍCONO A LA IZQUIERDA -->
            <img v-if="item.image" :src="item.image" :alt="item.name" class="menu-icon" />
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
        <div> </div>
        <div> </div>
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

.perm-1 { background-color: #fee2e2; color: #991b1b; } /* Desactivo */
.perm-2 { background-color: #fef3c7; color: #92400e; } /* Lectura */
.perm-3 { background-color: #d1fae5; color: #065f46; } /* Escritura */

.sidebar {
  position: relative;
  z-index: 1;
  width: 260px;
  background-color: #5F0032;
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
  color: #E8F9A2;
  text-transform: uppercase;
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
  align-items: center; /* Alinea verticalmente al centro ícono, texto y badge */
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  gap: 12px; /* Espacio entre el ícono a la izquierda y el texto */
  transition: all 0.2s ease;
}

.menu-item:hover {
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

/* El nombre del menú toma el espacio intermedio para empujar el badge al final */
.item-name {
  flex-grow: 1;
  text-align: left;
}

/* Tamaño exacto para las imágenes/íconos pequeños a la izquierda */
.menu-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
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
}

.logout-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

/* CONTENEDOR DERECHO */
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

.current-view-name {
  font-weight: 700;
  color: #5F0032;
  font-size: 15px;
  letter-spacing: 0.5px;
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
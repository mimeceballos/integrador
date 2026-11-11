<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { RouterLink } from 'vue-router'
import type { Ref } from 'vue'
import { Users, Plus, Pencil, UserX } from 'lucide-vue-next'

import HeaderStatsCard from '../../components/Encabezado.vue'
import ListFooter from '../../components/Footer.vue'

import { usuarios } from '../../data/usuarios'
import type { Usuario } from '../../data/usuarios'
import { sistemas } from '../../data/sistemas'
/* PROYECTO ACTIVO */
const proyectoActivoId = ref<number | null>(
  localStorage.getItem('proyecto_activo_id')
    ? Number(localStorage.getItem('proyecto_activo_id'))
    : null
)

const proyectoActivo = computed(() => {
  return sistemas.value.find(s => s.id === proyectoActivoId.value)
})

const nombreProyectoActivo = computed<string>(() => {
  return proyectoActivo.value?.nombre || ''
})

/* PERMISOS Y SESIÓN */
type PermissionCode = 1 | 2 | 3
// Inyectamos la clave específica del módulo "historias" provista en el Layout/Padre
const permisoUsuarios = inject<Ref<PermissionCode>>('permisoUsuarios')

// Permiso de lectura: Permite ver el módulo si el valor es 2 o 3
//const canRead = computed(() => (permisoUsuarios?.value ?? 1) >= 2)

// Permiso de escritura: Habilita crear, editar, ocultar y restaurar si es 3
const canWrite = computed(() => permisoUsuarios?.value === 3)

interface UserProfile {
  email: string
  name: string
  roleName: string
}

const currentUser = ref<UserProfile | null>(null)
const sessionData = localStorage.getItem('auth_user')

if (sessionData) {
  currentUser.value = JSON.parse(sessionData)
}


/* ESTADO DE USUARIO */
const usuarioADesactivar = ref<Usuario | null>(null)

function confirmarDesactivacion(usuario: Usuario) {
  if (!canWrite.value) return
  usuarioADesactivar.value = usuario
}

function alternarEstadoUsuario() {
  if (!usuarioADesactivar.value || !canWrite.value) return
  
  usuarioADesactivar.value.activo = !usuarioADesactivar.value.activo
  usuarioADesactivar.value = null
}

function cancelarDesactivacion() {
  usuarioADesactivar.value = null
}
</script>

<template>
  <section class="lista-usuarios">
    <!-- ENCABEZADO COMPLETAMENTE ALINEADO CON LA TABLA -->
    <div class="list-header">
      <div class="header-main">
        <Users :size="38" class="header-icon" /> 
        <div class="header-text">
          <h2>Usuarios del proyecto</h2>
          <p>Gestiona los usuarios y roles asignados a la metodología del proyecto activo.</p>
        </div>
      </div>

      <div class="header-actions">
        <HeaderStatsCard 
          :nombreProyecto="nombreProyectoActivo"
          :metodologia="proyectoActivo?.metodologia"
          :totalCount="usuarios.length"
        />
        
        <RouterLink v-if="canWrite" to="/portal/usuarios/nuevo" class="new-user-btn">
          <Plus :size="18" class="btn-icon" />
          <span>Nuevo usuario</span>
        </RouterLink>
      </div>
    </div>

    <!-- TABLA DE USUARIOS -->
    <div class="table-container">
      <table class="usuarios-table">
        <thead>
          <tr>
            <th class="col-center">ID</th>
            <th class="col-center">Email</th>
            <th class="col-center">Nombre Completo</th>
            <th class="col-center">Rol (Metodología)</th>
            <th class="col-center">Estado</th>
            <th class="col-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="usuario in usuarios"
            :key="usuario.id"
            :class="{ 'row-inactive': !usuario.activo }"
          >
            <td class="col-id">
              <span class="id-badge">#{{ usuario.id }}</span>
            </td>

            <td>
              <div class="email-usuario">{{ usuario.email }}</div>
            </td>

            <td>
              <div class="nombre-usuario">{{ usuario.nombreCompleto }}</div>
            </td>

            <td>
              <span class="rol-badge">
                {{ usuario.rolMetodologia }}
              </span>
            </td>

            <td class="col-center">
              <span
                class="estado-badge"
                :class="usuario.activo ? 'activo' : 'inactivo'"
              >
                {{ usuario.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="col-center">
              <div class="acciones">
                <RouterLink
                  v-if="canWrite"
                  :to="`/portal/usuarios/${usuario.id}/editar`"
                  class="action-btn edit-btn"
                  title="Editar usuario"
                >
                  <Pencil :size="15" />
                </RouterLink>

                <button
                  v-if="canWrite"
                  type="button"
                  class="action-btn deactivate-btn"
                  :class="{ 'reactivate-btn': !usuario.activo }"
                  :title="usuario.activo ? 'Desactivar usuario' : 'Reactivar usuario'"
                  @click="confirmarDesactivacion(usuario)"
                >
                  <UserX :size="15" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="usuarios.length === 0">
            <td colspan="6" class="empty-state">
              <div class="empty-icon">
                <Users :size="34" />
              </div>
              <h3>No hay usuarios registrados</h3>
              <p>Actualmente no existen usuarios en este proyecto.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PIE DE PÁGINA -->
    <ListFooter 
      nota="Los roles mostrados corresponden a la metodología de desarrollo activa."
      :currentPermission="permisoUsuarios"
    />

    <!-- MODAL DE CONFIRMACIÓN -->
    <div
      v-if="usuarioADesactivar"
      class="modal-overlay"
      @click.self="cancelarDesactivacion"
    >
      <div class="confirmation-modal">
        <div class="modal-icon">
          <UserX :size="24" />
        </div>
        <h3>{{ usuarioADesactivar.activo ? 'Desactivar usuario' : 'Reactivar usuario' }}</h3>
        <p>
          ¿Estás seguro de que deseas {{ usuarioADesactivar.activo ? 'desactivar' : 'reactivar' }} a 
          <strong>{{ usuarioADesactivar.nombreCompleto }}</strong>?
        </p>
        <p class="modal-warning">
          {{ usuarioADesactivar.activo 
            ? 'El usuario perderá acceso al sistema temporalmente.' 
            : 'El usuario recuperará sus accesos configurados.' }}
        </p>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="cancelarDesactivacion">Cancelar</button>
          <button type="button" class="confirm-action-btn" @click="alternarEstadoUsuario">
            {{ usuarioADesactivar.activo ? 'Desactivar' : 'Reactivar' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lista-usuarios {
  width: 100%;
  color: #5F0032;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  color: #5F0032;
  flex-shrink: 0;
  stroke-width: 2;
}

.header-text h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: #5F0032;
}

.header-text p {
  margin: 4px 0 0 0;
  color: #6c7886;
  font-size: 15px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.new-user-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 22px;
  background: #99154E;
  color: #ffffff;
  border-radius: 15px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
  transition: opacity 0.2s, transform 0.15s;
}

.btn-icon {
  flex-shrink: 0;
  stroke-width: 2.8;
}

.new-user-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #eef6ee;
  border-radius: 12px;
}

.usuarios-table {
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
  background: #ffffff;
}

.usuarios-table thead {
  background: #d1d0d0;
}

.usuarios-table th {
  padding: 13px 12px;
  text-align: left;
  color: #5F0032;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.usuarios-table td {
  padding: 14px 12px;
  border-top: 1px solid #eef6ee;
  color: #4a5563;
  font-size: 12px;
  vertical-align: middle;
}

.col-id {
  width: 60px;
}

.col-center {
  text-align: center !important;
}

.usuarios-table tbody tr.row-inactive {
  background-color: #fcfcfc;
  opacity: 0.7;
}

.usuarios-table tbody tr:hover {
  background-color: #FDF5FC;
}

.id-badge {
  display: inline-block;
  padding: 4px 7px;
  border-radius: 6px;
  background: #F1C0EC;
  color: #5F0032;
  font-weight: 800;
}

.email-usuario {
  color: #334155;
  font-weight: 600;
}

.nombre-usuario {
  color: #1a1a1a;
  font-weight: 700;
}

.rol-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
  font-size: 11px;
  border: 1px solid #e2e8f0;
}

.estado-badge {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.estado-badge.activo {
  background: #d9efbd;
  color: #2d5a1e;
}

.estado-badge.inactivo {
  background: #fee2e2;
  color: #991b1b;
}

.acciones {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
  border: none;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.edit-btn {
  background: #fef3c7;
  color: #92400e;
}

.edit-btn:hover {
  background: #fde9a0;
  transform: translateY(-1px);
}

.deactivate-btn {
  background: #fee2e2;
  color: #991b1b;
}

.deactivate-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

.deactivate-btn.reactivate-btn {
  background: #d9efbd;
  color: #2d5a1e;
}

.deactivate-btn.reactivate-btn:hover {
  background: #c7e6a3;
}

.empty-state {
  padding: 55px 20px !important;
  text-align: center !important;
}

.empty-icon {
  margin-bottom: 10px;
  color: #5F0032;
}

.empty-state h3 {
  margin: 0 0 7px;
  color: #5F0032;
  font-size: 16px;
}

.empty-state p {
  margin: 0;
  color: #8a94a1;
  font-size: 12px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(30, 41, 59, 0.45);
  z-index: 1000;
}

.confirmation-modal {
  width: min(420px, 100%);
  padding: 28px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.18);
  text-align: center;
}

.modal-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fee2e2;
  color: #991b1b;
}

.confirmation-modal h3 {
  margin: 0 0 10px;
  color: #334155;
  font-size: 18px;
}

.confirmation-modal p {
  margin: 6px 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.modal-warning {
  color: #991b1b !important;
  font-size: 11px !important;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
}

.cancel-btn,
.confirm-action-btn {
  padding: 9px 16px;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-btn {
  background: #eef2f6;
  color: #5F0032;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.confirm-action-btn {
  background: #ef9a9a;
  color: #7f1d1d;
}

.confirm-action-btn:hover {
  background: #e88080;
}

@media (max-width: 700px) {
  .list-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    flex-wrap: wrap;
  }
}
</style>
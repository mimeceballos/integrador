<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import type { Ref } from 'vue'
import { Monitor, Plus, Eye, Pencil, Trash2 } from 'lucide-vue-next'

// Importamos la lista global y la función de eliminar
import {
  sistemas,
  eliminarSistema as eliminarSistemaDatos
} from '../../data/sistemas'

import type { Sistema } from '../../data/sistemas'

/* =========================================================================
 * PROYECTO ACTIVO (SELECCIÓN ÚNICA CON TOGGLE)
 * ========================================================================= */

// Guardamos el ID del sistema que está seleccionado actualmente. Si no hay ninguno, es null.
const sistemaSeleccionadoId = ref<number | null>(null)

onMounted(() => {
  //  vacío al cargar esta vista
  sistemaSeleccionadoId.value = null
  localStorage.removeItem('proyecto_activo_id')
})

// Función para seleccionar/desmarcar un proyecto cuando se hace clic en la casilla
function toggleProyecto(id: number) {
  // Si el proyecto presionado ya era el activo, LO DESACTIVAMOS (comportamiento toggle)
  if (sistemaSeleccionadoId.value === id) {
    sistemaSeleccionadoId.value = null
    localStorage.removeItem('proyecto_activo_id')
    //  el proyecto activo ahora es null (bloquea el navbar)
    window.dispatchEvent(new CustomEvent('proyecto-cambiado', { detail: null }))
  } else {
    // Si era otro diferente, LO ACTIVAMOS
    sistemaSeleccionadoId.value = id
    localStorage.setItem('proyecto_activo_id', String(id))
    //nuevo ID seleccionado
    window.dispatchEvent(new CustomEvent('proyecto-cambiado', { detail: id }))
  }
}

/* =========================================================================
 * CONTROL DE PERMISOS Y USUARIOS
 * ========================================================================= */
type PermissionCode = 1 | 2 | 3

const currentPermission = inject<Ref<PermissionCode>>('currentPermission')
const canWrite = computed(() => currentPermission?.value === 3)

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

const currentUser = ref<UserProfile | null>(null)
const sessionData = localStorage.getItem('auth_user')

if (sessionData) {
  currentUser.value = JSON.parse(sessionData)
}

const isAdmin = computed(() => currentUser.value?.roleName === 'Administrador')

/* =========================================================================
 * LÓGICA PARA ELIMINAR UN SISTEMA
 * ========================================================================= */
const sistemaAEliminar = ref<Sistema | null>(null)

function confirmarEliminacion(sistema: Sistema) {
  if (!isAdmin.value) return
  sistemaAEliminar.value = sistema
}

function eliminarSistema() {
  if (!sistemaAEliminar.value || !isAdmin.value) return
  const id = sistemaAEliminar.value.id
  eliminarSistemaDatos(id)
  
  // Si el sistema que acabamos de borrar era el que estaba seleccionado como activo, limpiamos la selección
  if (sistemaSeleccionadoId.value === id) {
    sistemaSeleccionadoId.value = null
    localStorage.removeItem('proyecto_activo_id')
    window.dispatchEvent(new CustomEvent('proyecto-cambiado', { detail: null }))
  }

  sistemaAEliminar.value = null
}

function cancelarEliminacion() {
  sistemaAEliminar.value = null
}
</script>

<template>
  <section class="lista-sistemas">
    <!-- ENCABEZADO -->
    <div class="list-header">
      <div class="header-main">
        <Monitor :size="38" class="header-icon" /> 
        <div class="header-text">
          <h2>Sistemas registrados</h2>
          <p>Consulta los sistemas registrados en el organizador.</p>
        </div>
      </div>

      <div class="header-actions">
        <RouterLink v-if="canWrite" to="/portal/sistemas/nuevo" class="new-system-btn">
          <Plus :size="18" class="btn-icon" />
          <span>Nuevo sistema</span>
        </RouterLink>

        <div class="total-sistemas">
          <span class="total-label">Total</span>
          <span class="total-number">{{ sistemas.length }}</span>
        </div>
      </div>
    </div>

    <!-- TABLA DE SISTEMAS -->
    <div class="table-container">
      <table class="sistemas-table">
        <thead>
          <tr>
            <!-- Columna para la selección única -->
            <th class="col-select">Activo</th>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Responsable</th>
            <th>Fecha actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="sistema in sistemas"
            :key="sistema.id"
            :class="{ 'row-active': sistemaSeleccionadoId === sistema.id }"
          >
            <!-- CASILLA / CHECKBOX CUSTOM CON BOTÓN -->
            <td class="col-select">
              <button
                type="button"
                class="checkbox-box"
                :class="{ 'is-checked': sistemaSeleccionadoId === sistema.id }"
                @click="toggleProyecto(sistema.id)"
                :title="sistemaSeleccionadoId === sistema.id ? 'Desactivar proyecto' : 'Activar proyecto'"
              >
                <!-- La palomita se dibuja sólo cuando la clase .is-checked está activa -->
                <span class="checkmark-icon">✓</span>
              </button>
            </td>

            <!-- DATOS DE LA TABLA -->
            <td>
              <span class="id-badge">#{{ sistema.id }}</span>
            </td>

            <td>
              <div class="nombre-sistema">{{ sistema.nombre }}</div>
            </td>

            <td>
              <div class="descripcion">{{ sistema.descripcion }}</div>
            </td>

            <td>
              <span
                class="estado-badge"
                :class="{
                  activo: sistema.estado === 'Activo',
                  desarrollo: sistema.estado === 'Desarrollo',
                  inactivo: sistema.estado === 'Inactivo'
                }"
              >
                {{ sistema.estado }}
              </span>
            </td>

            <td>{{ sistema.responsable }}</td>
            <td>{{ sistema.fechaActualizacion }}</td>

            <!-- ACCIONES -->
            <td>
              <div class="acciones">
                <RouterLink
                  :to="`/portal/sistemas/${sistema.id}`"
                  class="action-btn view-btn"
                  title="Ver detalles del sistema"
                >
                  <Eye :size="15" />
                </RouterLink>

                <RouterLink
                  v-if="isAdmin"
                  :to="`/portal/sistemas/${sistema.id}/editar`"
                  class="action-btn edit-btn"
                  title="Editar sistema"
                >
                  <Pencil :size="15" />
                </RouterLink>

                <button
                  v-if="isAdmin"
                  type="button"
                  class="action-btn delete-btn"
                  title="Eliminar sistema"
                  @click="confirmarEliminacion(sistema)"
                >
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>

          <!-- SIN REGISTROS -->
          <tr v-if="sistemas.length === 0">
            <td colspan="8" class="empty-state">
              <div class="empty-icon">
                <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
              </div>
              <h3>No hay sistemas registrados</h3>
              <p>Actualmente no existen sistemas para mostrar.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- INFORMACIÓN INFERIOR -->
    <div class="list-footer">
      <div>
        <strong>Nota:</strong> Los datos mostrados actualmente son temporales.
      </div>
      <div class="permission-info">
        <span v-if="currentPermission === 2" class="read-only-message">Modo lectura</span>
        <span v-else-if="currentPermission === 3" class="write-message">Acceso de escritura</span>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN -->
    <div
      v-if="sistemaAEliminar"
      class="modal-overlay"
      @click.self="cancelarEliminacion"
    >
      <div class="confirmation-modal">
        <div class="modal-icon">
          <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
        </div>
        <h3>Eliminar sistema</h3>
        <p>¿Estás seguro de que deseas eliminar <strong>{{ sistemaAEliminar.nombre }}</strong>?</p>
        <p class="modal-warning">Esta acción eliminará temporalmente el registro.</p>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="cancelarEliminacion">Cancelar</button>
          <button type="button" class="confirm-delete-btn" @click="eliminarSistema">Eliminar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lista-sistemas {
  width: 100%;
  color: #5F0032;
}

/* ENCABEZADO */
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

.total-sistemas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 9px 15px;
  background: #FBEAF9;
  border: 1px solid #F0CBEC;
  border-radius: 12px;
}

.total-label {
  color: #7d8794;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
}

.total-number {
  color: #5F0032;
  font-size: 22px;
  font-weight: 800;
}

.new-system-btn {
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

.new-system-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

/* TABLA Y COLUMNA SELECCIONADORA DE CASILLA */
.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #eef6ee;
  border-radius: 12px;
}

.sistemas-table {
  width: 100%;
  min-width: 950px;
  border-collapse: collapse;
  background: #ffffff;
}

.sistemas-table thead {
  background: #d1d0d0;
}

.sistemas-table th {
  padding: 13px 12px;
  text-align: left;
  color: #5F0032;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.sistemas-table td {
  padding: 14px 12px;
  border-top: 1px solid #eef6ee;
  color: #4a5563;
  font-size: 12px;
  vertical-align: middle;
}

.col-select {
  text-align: center !important;
  width: 60px;
}

/* ESTILOS DE LA CASILLA RECTANGULAR CON LA PALOMITA */
.checkbox-box {
  width: 22px;
  height: 22px;
  border: 2px solid #5F0032;
  border-radius: 6px;
  background-color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  outline: none;
}

.checkbox-box:hover {
  background-color: #FBEAF9;
}

.checkbox-box.is-checked {
  background-color: #5F0032;
  border-color: #5F0032;
}

.checkmark-icon {
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  line-height: 1;
  display: none;
}

/* Muestra la palomita únicamente cuando tiene la clase .is-checked */
.checkbox-box.is-checked .checkmark-icon {
  display: block;
}

.sistemas-table tbody tr.row-active {
  background-color: #FBEAF9;
}

.sistemas-table tbody tr:hover {
  background-color: #FDF5FC;
}

/* DATOS */
.id-badge {
  display: inline-block;
  padding: 4px 7px;
  border-radius: 6px;
  background: #F1C0EC;
  color: #5F0032;
  font-weight: 800;
}

.nombre-sistema {
  min-width: 150px;
  color: #334155;
  font-weight: 700;
}

.descripcion {
  min-width: 180px;
  max-width: 260px;
  color: #64748b;
  line-height: 1.4;
}

/* ESTADOS */
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

.estado-badge.desarrollo {
  background: #fef3c7;
  color: #92400e;
}

.estado-badge.inactivo {
  background: #fee2e2;
  color: #991b1b;
}

/* ACCIONES CON ÍCONOS */
.acciones {
  display: flex;
  gap: 6px;
  align-items: center;
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

.view-btn {
  background: #F1C0EC;
  color: #5F0032;
}

.view-btn:hover {
  background: #E9A8E3;
  transform: translateY(-1px);
}

.edit-btn {
  background: #fef3c7;
  color: #92400e;
}

.edit-btn:hover {
  background: #fde9a0;
  transform: translateY(-1px);
}

.delete-btn {
  background: #fee2e2;
  color: #991b1b;
}

.delete-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

/* ESTADO VACÍO */
.empty-state {
  padding: 55px 20px !important;
  text-align: center !important;
}

.empty-icon {
  margin-bottom: 10px;
  font-size: 34px;
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

/* PIE */
.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  padding: 11px 14px;
  border-radius: 99px;
  background: #fafafa;
  color: #8a94a1;
  font-size: 10px;
}

.permission-info {
  white-space: nowrap;
}

.read-only-message {
  padding: 4px 8px;
  border-radius: 5px;
  background: #fef3c7;
  color: #92400e;
  font-weight: 700;
}

.write-message {
  padding: 4px 8px;
  border-radius: 5px;
  background: #d9efbd;
  color: #2d5a1e;
  font-weight: 700;
}

/* MODAL */
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
  font-size: 23px;
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
.confirm-delete-btn {
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

.confirm-delete-btn {
  background: #ef9a9a;
  color: #7f1d1d;
}

.confirm-delete-btn:hover {
  background: #e88080;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .table-container {
    overflow-x: auto;
  }
}

@media (max-width: 700px) {
  .list-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .total-sistemas {
    align-self: flex-end;
  }

  .list-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .permission-info {
    white-space: normal;
  }
}
</style>
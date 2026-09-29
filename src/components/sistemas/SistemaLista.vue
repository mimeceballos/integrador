<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { RouterLink } from 'vue-router'
import type { Ref } from 'vue'

import {
  sistemas,
  eliminarSistema as eliminarSistemaDatos
} from '../../data/sistemas'

import type { Sistema } from '../../data/sistemas'

/* -----------------------------------------
 * PERMISOS
 * ----------------------------------------- */

type PermissionCode = 1 | 2 | 3

// Permiso actual del módulo Sistemas
const currentPermission = inject<Ref<PermissionCode>>(
  'currentPermission'
)

/* -----------------------------------------
 * USUARIO AUTENTICADO
 * ----------------------------------------- */

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

/* -----------------------------------------
 * PERMISOS DEL ADMINISTRADOR
 * ----------------------------------------- */

// Por ahora mantenemos la regla establecida:
// solamente Administrador puede editar y eliminar.
const isAdmin = computed(() => {
  return currentUser.value?.roleName === 'Administrador'
})

/* -----------------------------------------
 * SISTEMAS
 * ----------------------------------------- */

/*
 * IMPORTANTE:
 *
 * "sistemas" ya no es un arreglo local.
 *
 * Proviene de:
 *
 * src/data/sistemas.ts
 *
 * Por lo tanto:
 *
 * SistemaLista.vue
 * SistemaDetalle.vue
 * SistemaForm.vue
 *
 * podrán trabajar sobre la misma fuente temporal.
 */

/* -----------------------------------------
 * ELIMINACIÓN
 * ----------------------------------------- */

// Sistema seleccionado para eliminar
const sistemaAEliminar = ref<Sistema | null>(null)

// Abrir modal de confirmación
function confirmarEliminacion(sistema: Sistema) {
  if (!isAdmin.value) return

  sistemaAEliminar.value = sistema
}

// Eliminar definitivamente de la fuente temporal
function eliminarSistema() {
  if (!sistemaAEliminar.value || !isAdmin.value) return

  const id = sistemaAEliminar.value.id

  eliminarSistemaDatos(id)

  sistemaAEliminar.value = null
}

// Cancelar eliminación
function cancelarEliminacion() {
  sistemaAEliminar.value = null
}
</script>

<template>
  <section class="lista-sistemas">

    <!-- ENCABEZADO -->
    <div class="list-header">

      <div>
        <h2>Sistemas registrados</h2>

        <p>
          Consulta los sistemas registrados en el organizador.
        </p>
      </div>

      <div class="total-sistemas">

        <span class="total-label">
          Total
        </span>

        <span class="total-number">
          {{ sistemas.length }}
        </span>

      </div>

    </div>

    <!-- TABLA -->
    <div class="table-container">

      <table class="sistemas-table">

        <thead>
          <tr>

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
          >

            <!-- ID -->
            <td>

              <span class="id-badge">
                #{{ sistema.id }}
              </span>

            </td>

            <!-- NOMBRE -->
            <td>

              <div class="nombre-sistema">
                {{ sistema.nombre }}
              </div>

            </td>

            <!-- DESCRIPCIÓN -->
            <td>

              <div class="descripcion">
                {{ sistema.descripcion }}
              </div>

            </td>

            <!-- ESTADO -->
            <td>

              <span
                class="estado-badge"
                :class="{
                  activo: sistema.estado === 'Activo',
                  desarrollo: sistema.estado === 'En desarrollo',
                  inactivo: sistema.estado === 'Inactivo'
                }"
              >
                {{ sistema.estado }}
              </span>

            </td>

            <!-- RESPONSABLE -->
            <td>
              {{ sistema.responsable }}
            </td>

            <!-- FECHA -->
            <td>
              {{ sistema.fechaActualizacion }}
            </td>

            <!-- ACCIONES -->
            <td>

              <div class="acciones">

                <!--
                  VER DETALLES

                  Disponible para cualquier usuario
                  que tenga acceso al módulo Sistemas.
                -->

                <RouterLink
                  :to="`/admin/sistemas/${sistema.id}`"
                  class="action-btn view-btn"
                  title="Ver detalles del sistema"
                >
                  Ver detalles
                </RouterLink>

                <!--
                  EDITAR

                  Exclusivamente Administrador.
                -->

                <RouterLink
                  v-if="isAdmin"
                  :to="`/admin/sistemas/${sistema.id}/editar`"
                  class="action-btn edit-btn"
                  title="Editar sistema"
                >
                  Editar
                </RouterLink>

                <!--
                  ELIMINAR

                  Exclusivamente Administrador.
                -->

                <button
                  v-if="isAdmin"
                  type="button"
                  class="action-btn delete-btn"
                  title="Eliminar sistema"
                  @click="confirmarEliminacion(sistema)"
                >
                  Eliminar
                </button>

              </div>

            </td>

          </tr>

          <!-- SIN REGISTROS -->
          <tr v-if="sistemas.length === 0">

            <td
              colspan="7"
              class="empty-state"
            >

              <div class="empty-icon">
                📋
              </div>

              <h3>
                No hay sistemas registrados
              </h3>

              <p>
                Actualmente no existen sistemas para mostrar.
              </p>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <!-- INFORMACIÓN INFERIOR -->
    <div class="list-footer">

      <div>

        <strong>Nota:</strong>

        Los datos mostrados actualmente son temporales
        y se utilizan únicamente para el desarrollo de la interfaz.

      </div>

      <div class="permission-info">

        <span
          v-if="currentPermission === 2"
          class="read-only-message"
        >
          Modo lectura
        </span>

        <span
          v-else-if="currentPermission === 3"
          class="write-message"
        >
          Acceso de escritura
        </span>

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
          ⚠
        </div>

        <h3>
          Eliminar sistema
        </h3>

        <p>

          ¿Estás seguro de que deseas eliminar

          <strong>
            {{ sistemaAEliminar.nombre }}
          </strong>?

        </p>

        <p class="modal-warning">

          Esta acción eliminará temporalmente el registro
          de la fuente de datos.

        </p>

        <div class="modal-actions">

          <button
            type="button"
            class="cancel-btn"
            @click="cancelarEliminacion"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="confirm-delete-btn"
            @click="eliminarSistema"
          >
            Eliminar
          </button>

        </div>

      </div>

    </div>

  </section>
</template>

<style scoped>

.lista-sistemas {
  width: 100%;
  color: #4d6787;
}

/* ENCABEZADO */

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 22px;
}

.list-header h2 {
  margin: 0 0 5px;
  color: #4d6787;
  font-size: 21px;
  font-weight: 800;
}

.list-header p {
  margin: 0;
  color: #7d8794;
  font-size: 13px;
}

.total-sistemas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 9px 15px;
  background: #fffde1;
  border: 1px solid #f2eab4;
  border-radius: 12px;
}

.total-label {
  color: #7d8794;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
}

.total-number {
  color: #4d6787;
  font-size: 22px;
  font-weight: 800;
}

/* TABLA */

.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #eef2f6;
  border-radius: 12px;
}

.sistemas-table {
  width: 100%;
  min-width: 950px;
  border-collapse: collapse;
  background: #ffffff;
}

.sistemas-table thead {
  background: #f6f3cf;
}

.sistemas-table th {
  padding: 13px 12px;
  text-align: left;
  color: #4d6787;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.sistemas-table td {
  padding: 14px 12px;
  border-top: 1px solid #eef2f6;
  color: #4a5563;
  font-size: 12px;
  vertical-align: middle;
}

.sistemas-table tbody tr {
  transition: background-color 0.15s ease;
}

.sistemas-table tbody tr:hover {
  background-color: #fffef1;
}

/* DATOS */

.id-badge {
  display: inline-block;
  padding: 4px 7px;
  border-radius: 6px;
  background: #cfebff;
  color: #4d6787;
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

/* ACCIONES */

.acciones {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 9px;
  border-radius: 6px;
  border: none;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-btn {
  background: #cfebff;
  color: #4d6787;
}

.view-btn:hover {
  background: #b9e1fc;
}

.edit-btn {
  background: #fef3c7;
  color: #92400e;
}

.edit-btn:hover {
  background: #fde9a0;
}

.delete-btn {
  background: #fee2e2;
  color: #991b1b;
}

.delete-btn:hover {
  background: #fecaca;
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
  color: #4d6787;
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
  border-radius: 9px;
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
  color: #4d6787;
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

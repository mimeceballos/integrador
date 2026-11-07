<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { RouterLink } from 'vue-router'
import type { Ref } from 'vue'
import { BookOpen, Plus, Pencil, Trash2, Eye } from 'lucide-vue-next'

// Importamos los datos reactivos y las funciones centralizadas
import { historias, eliminarHistoria as eliminarHistoriaDatos } from '../../data/historias'
import type { HistoriaUsuario } from '../../data/historias'
import { sistemas } from '../../data/sistemas'

/* =========================================================================
 * PROYECTO ACTIVO EN SESIÓN
 * Obtenemos el ID almacenado en localStorage para saber qué historias mostrar.
 * ========================================================================= */
const proyectoActivoId = ref<number | null>(
  localStorage.getItem('proyecto_activo_id')
    ? Number(localStorage.getItem('proyecto_activo_id'))
    : null
)

// Buscamos los datos completos del proyecto seleccionado
const proyectoActivo = computed(() => {
  return sistemas.value.find(s => s.id === proyectoActivoId.value)
})

const nombreProyectoActivo = computed<string>(() => {
  return proyectoActivo.value ? proyectoActivo.value.nombre : ''
})

// Filtramos la lista de historias mostrando únicamente las del proyecto activo
const historiasFiltradas = computed(() => {
  if (!proyectoActivoId.value) return []
  return historias.value.filter(h => h.proyectoId === proyectoActivoId.value)
})

/* =========================================================================
 * CONTROL DE PERMISOS DE SESIÓN Y ROL
 * ========================================================================= */
type PermissionCode = 1 | 2 | 3

const currentPermission = inject<Ref<PermissionCode>>('currentPermission')
const canWrite = computed(() => currentPermission?.value === 3)

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

const isAdmin = computed(() => {
  return currentUser.value ? currentUser.value.roleName === 'Administrador' : false
})

/* =========================================================================
 * GESTIÓN DE MODALES (DETALLES Y ELIMINACIÓN)
 * Usamos referencias sencillas para controlar qué elemento está activo.
 * ========================================================================= */
const historiaAEliminar = ref<HistoriaUsuario | null>(null)
const historiaDetalle = ref<HistoriaUsuario | null>(null)

function confirmarEliminacion(historia: HistoriaUsuario) {
  if (!isAdmin.value) return
  historiaAEliminar.value = historia
}

function ejecutarEliminacion() {
  if (historiaAEliminar.value && isAdmin.value) {
    eliminarHistoriaDatos(historiaAEliminar.value.id)
    historiaAEliminar.value = null
  }
}

function cancelarEliminacion() {
  historiaAEliminar.value = null
}

function verDetalles(historia: HistoriaUsuario) {
  historiaDetalle.value = historia
}

function cerrarDetalles() {
  historiaDetalle.value = null
}
</script>

<template>
  <section class="lista-historias">
    <!-- ENCABEZADO DE LA VISTA -->
    <div class="list-header">
      <div class="header-main">
        <BookOpen :size="38" class="header-icon" /> 
        <div class="header-text">
          <h2>Historias de usuario</h2>
          <p>Gestiona y documenta las historias de usuario del proyecto activo.</p>
        </div>
      </div>

      <div class="header-actions">
        <!-- 1. BOTÓN PARA CREAR NUEVA HISTORIA -->
        <RouterLink v-if="canWrite" to="/portal/historias/nuevo" class="new-story-btn">
          <Plus :size="18" class="btn-icon" />
          <span>Nueva historia</span>
        </RouterLink>

        <!-- 2. RECUADRO DEL PROYECTO ACTIVO EN EL MEDIO -->
        <div class="proyecto-activo-card">
          <span class="proyecto-label">Proyecto activo</span>
          <span class="proyecto-nombre">{{ nombreProyectoActivo }}</span>
        </div>

        <!-- 3. TOTAL DE HISTORIAS DEL PROYECTO A LA DERECHA -->
        <div class="total-historias">
          <span class="total-label">Total</span>
          <span class="total-number">{{ historiasFiltradas.length }}</span>
        </div>
      </div>
    </div>

    <!-- TABLA DE HISTORIAS DE USUARIO -->
    <div class="table-container">
      <table class="historias-table">
        <thead>
          <tr>
            <th class="col-id">ID</th>
            <th>Nombre de la Historia de Usuario</th>
            <th>Fecha de Captura</th>
            <th>Capturado Por</th>
            <th class="col-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="historia in historiasFiltradas" :key="historia.id">
            <!-- 1. ID CONSECUTIVO DE LA HISTORIA -->
            <td class="col-id">
              <span class="id-badge">#{{ historia.id }}</span>
            </td>

            <!-- 2. NOMBRE DE LA HISTORIA -->
            <td>
              <div class="nombre-historia">{{ historia.nombreHistoria }}</div>
            </td>

            <!-- 3. FECHA DE CAPTURA -->
            <td>
              <div class="fecha-captura">{{ historia.fechaCaptura }}</div>
            </td>

            <!-- 4. PERSONA QUE CAPTURÓ LA HISTORIA -->
            <td>
              <div class="capturado-por">{{ historia.capturadoPor }}</div>
            </td>

            <!-- 5. BOTONES DE ACCIONES (VER, EDITAR, ELIMINAR) -->
            <td class="col-center">
              <div class="acciones">
                <button
                  type="button"
                  class="action-btn view-btn"
                  title="Ver detalle"
                  @click="verDetalles(historia)"
                >
                  <Eye :size="15" />
                </button>

                <RouterLink
                  v-if="isAdmin"
                  :to="`/portal/historias/${historia.id}/editar`"
                  class="action-btn edit-btn"
                  title="Editar historia"
                >
                  <Pencil :size="15" />
                </RouterLink>

                <button
                  v-if="isAdmin"
                  type="button"
                  class="action-btn delete-btn"
                  title="Eliminar historia"
                  @click="confirmarEliminacion(historia)"
                >
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>

          <!-- ESTADO VACÍO CUANDO NO HAY HISTORIAS REGISTRADAS -->
          <tr v-if="historiasFiltradas.length === 0">
            <td colspan="5" class="empty-state">
              <div class="empty-icon">
                <BookOpen :size="34" />
              </div>
              <h3>No hay historias registradas</h3>
              <p>Actualmente no existen historias de usuario para este proyecto.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PIE DE PÁGINA CON ESTADO DE PERMISOS DE USUARIO -->
    <div class="list-footer">
      <div>
        <strong>Nota:</strong> Las historias mostradas corresponden únicamente al proyecto seleccionado.
      </div>
      <div class="permission-info">
        <span v-if="currentPermission === 2" class="read-only-message">Modo lectura</span>
        <span v-else-if="currentPermission === 3" class="write-message">Acceso de escritura</span>
      </div>
    </div>

    <!-- MODAL DE DETALLE COMPLETO -->
    <div v-if="historiaDetalle" class="modal-overlay" @click.self="cerrarDetalles">
      <div class="detail-modal">
        <div class="detail-header">
          <h3>#{{ historiaDetalle.id }} - {{ historiaDetalle.nombreHistoria }}</h3>
        </div>
        <div class="detail-body">
          <!-- SECCIÓN QUIERO -->
          <div class="detail-section">
            <h4>Quiero</h4>
            <p class="section-text">{{ historiaDetalle.quiero }}</p>
          </div>

          <!-- SECCIÓN PARA -->
          <div class="detail-section">
            <h4>Para</h4>
            <p class="section-text">{{ historiaDetalle.para }}</p>
          </div>

          <!-- SECCIÓN REQUERIMIENTOS -->
          <div class="detail-section">
            <h4>Requerimientos ({{ historiaDetalle.requerimientos.length }})</h4>
            <ul v-if="historiaDetalle.requerimientos.length > 0" class="req-list">
              <li v-for="req in historiaDetalle.requerimientos" :key="req.id">
                <strong>{{ req.nombre }}:</strong> {{ req.descripcion }}
              </li>
            </ul>
            <p v-else class="empty-req">Sin requerimientos registrados.</p>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="cerrarDetalles">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN PARA ELIMINAR -->
    <div v-if="historiaAEliminar" class="modal-overlay" @click.self="cancelarEliminacion">
      <div class="confirmation-modal">
        <div class="modal-icon">
          <Trash2 :size="24" />
        </div>
        <h3>Eliminar historia de usuario</h3>
        <p>¿Estás seguro de que deseas eliminar la historia <strong>"{{ historiaAEliminar.nombreHistoria }}"</strong>?</p>
        <p class="modal-warning">Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="cancelarEliminacion">Cancelar</button>
          <button type="button" class="confirm-action-btn" @click="ejecutarEliminacion">Eliminar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lista-historias {
  width: 100%;
  color: #5F0032;
}

/* ENCABEZADO PRINCIPAL */
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

.total-historias {
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

.proyecto-activo-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 9px 18px;
  background: #FBEAF9;
  border: 1px solid #F0CBEC;
  border-radius: 12px;
  white-space: nowrap;
}

.proyecto-label {
  color: #7d8794;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.proyecto-nombre {
  color: #5F0032;
  font-size: 15px;
  font-weight: 800;
}

.new-story-btn {
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

.new-story-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

/* TABLA Y CONTENEDOR DE DATOS */
.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #eef6ee;
  border-radius: 12px;
}

.historias-table {
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
  background: #ffffff;
}

.historias-table thead {
  background: #d1d0d0;
}

.historias-table th {
  padding: 13px 12px;
  text-align: left;
  color: #5F0032;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.historias-table td {
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

.historias-table tbody tr:hover {
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

.nombre-historia {
  color: #1a1a1a;
  font-weight: 700;
}

.fecha-captura,
.capturado-por {
  color: #334155;
  font-weight: 600;
}

/* BOTONES DE ACCIÓN EN CADA FILA */
.acciones {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
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

/* ESTADO VACÍO EN LA TABLA */
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

/* PIE DE PÁGINA */
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

/* ESTILOS DE MODALES */
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

.confirmation-modal,
.detail-modal {
  width: min(520px, 100%);
  padding: 28px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.18);
  text-align: left;
}

.confirmation-modal {
  width: min(420px, 100%);
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

.detail-header {
  margin-bottom: 16px;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  color: #5F0032;
}

/* SECCIONES INDIVIDUALES DEL MODAL (QUIERO, PARA, REQUERIMIENTOS) */
.detail-section {
  margin-bottom: 16px;
}

.detail-body h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 800;
  color: #5F0032;
}

.section-text {
  margin: 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.4;
}

.req-list {
  padding-left: 18px;
  margin: 0;
  font-size: 13px;
  color: #475569;
}

.req-list li {
  margin-bottom: 6px;
}

.empty-req {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
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
</style>
<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import type { Ref } from 'vue'
import { BookOpen, Plus, Pencil, Eye, EyeOff, RotateCcw } from 'lucide-vue-next'

import HeaderStatsCard from '../../components/Encabezado.vue'
import ListFooter from '../../components/Footer.vue'

import { historias } from '../../data/historias'
import type { HistoriaUsuario } from '../../data/historias'
import { sistemas } from '../../data/sistemas'
import { usuarios } from '../../data/usuarios'

const router = useRouter()

/* 1 = Desactivo/Sin acceso, 2 = Solo Lectura, 3 = Escritura Total */
type PermissionCode = 1 | 2 | 3

// Inyectamos la clave específica del módulo "historias" provista en el Layout
const permisoHistorias = inject<Ref<PermissionCode>>('permisoHistorias')

// Permiso de lectura: Permite ver el módulo si el valor es 2 o 3
const canRead = computed(() => (permisoHistorias?.value ?? 1) >= 2)

// Permiso de escritura: Habilita crear, editar, ocultar y restaurar si es 3
const canWrite = computed(() => permisoHistorias?.value === 3)

/* PROYECTO ACTIVO EN SESIÓN*/
const proyectoActivoId = ref<number | null>(
  localStorage.getItem('proyecto_activo_id')
    ? Number(localStorage.getItem('proyecto_activo_id'))
    : null
)

const proyectoActivo = computed(() => {
  return sistemas.value.find(s => s.id === proyectoActivoId.value)
})

const nombreProyectoActivo = computed<string>(() => {
  return proyectoActivo.value ? proyectoActivo.value.nombre : ''
})

/* ACTIVAS VS OCULTAS*/
const mostrarOcultas = ref(false)

const historiasFiltradas = computed(() => {
  if (!proyectoActivoId.value) return []
  return historias.value.filter(h => {
    const coincideProyecto = h.proyectoId === proyectoActivoId.value
    if (mostrarOcultas.value) {
      return coincideProyecto && Boolean(h.oculto) // Muestra solo las ocultas
    }
    return coincideProyecto && !h.oculto // Muestra solo las activas
  })
})

/* ROL DEL PARTICIPANTE */
function obtenerRolCapturador(historia: HistoriaUsuario): string {
  if (historia.rolCapturador) return historia.rolCapturador

  const usuario = usuarios.value.find(
    u => u.email === historia.usuarioEmail || u.nombreCompleto === historia.capturadoPor
  )
  return usuario ? usuario.rolMetodologia : 'Sin rol asignado'
}

/* MODALES Y ACCIONES */
const historiaAAccionar = ref<HistoriaUsuario | null>(null)
const historiaDetalle = ref<HistoriaUsuario | null>(null)

function confirmarAccion(historia: HistoriaUsuario) {
  if (!canWrite.value) return
  historiaAAccionar.value = historia
}

/* ALTERNAR ENTRE OCULTAR Y RESTAURAR/DESOCULTAR */
function ejecutarAccion() {
  if (historiaAAccionar.value && canWrite.value) {
    historiaAAccionar.value.oculto = !historiaAAccionar.value.oculto
    historiaAAccionar.value = null
  }
}

function cancelarAccion() {
  historiaAAccionar.value = null
}

function verDetalles(historia: HistoriaUsuario) {
  historiaDetalle.value = historia
}

function cerrarDetalles() {
  historiaDetalle.value = null
}

function irAEditar(id: number) {
  cerrarDetalles()
  router.push(`/portal/historias/${id}/editar`)
}
</script>

<template>
 <!-- 1. MUESTRA ESTO SI NO TIENE PERMISO DE LECTURA (PERMISO 1) -->
  <div v-if="!canRead" class="notice-card">
    <h2>Sin Acceso</h2>
    <p>No tienes permisos para visualizar el módulo de Historias de usuario.</p>
  </div>

  <!-- 2. MUESTRA EL CONTENIDO SOLO SI TIENE ACCESO (PERMISO 2 O 3) -->
  <section v-else class="lista-historias">
    <div class="list-header">
      <div class="header-main">
        <BookOpen :size="38" class="header-icon" /> 
        <div class="header-text">
          <h2>Historias de usuario</h2>
          <p>Gestiona y documenta las historias de usuario del proyecto activo.</p>
        </div>
      </div>

      <div class="header-actions">
        <HeaderStatsCard 
          :nombreProyecto="nombreProyectoActivo"
          :metodologia="proyectoActivo?.metodologia"
          :totalCount="historiasFiltradas.length"
        />

        <RouterLink v-if="canWrite" to="/portal/historias/nuevo" class="new-story-btn">
          <Plus :size="18" class="btn-icon" />
          <span>Nueva historia</span>
        </RouterLink>
      </div>
    </div>

    <!-- BARRA DE HERRAMIENTAS Y VISIBILIDAD -->
    <div class="toolbar-container">
      <div class="filter-toggle">
        <button
          type="button"
          class="toggle-tab"
          :class="{ active: !mostrarOcultas }"
          @click="mostrarOcultas = false"
        >
          <Eye :size="14" />
          <span>Activas</span>
        </button>
        <button
          type="button"
          class="toggle-tab"
          :class="{ active: mostrarOcultas }"
          @click="mostrarOcultas = true"
        >
          <EyeOff :size="14" />
          <span>Ocultas / Archivadas</span>
        </button>
      </div>
    </div>

    <!-- TABLA DE HISTORIAS DE USUARIO -->
    <div class="table-container">
      <table class="historias-table">
        <thead>
          <tr>
            <th class="col-center">ID</th>
            <th class="col-center">Nombre de la Historia</th>
            <th class="col-center">Fecha de Captura</th>
            <th class="col-center">Capturado Por</th>
            <th class="col-center">Rol</th>
            <th class="col-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr 
            v-for="historia in historiasFiltradas" 
            :key="historia.id"
            :class="{ 'row-hidden': historia.oculto }"
          >
            <td class="col-id">
              <span class="id-badge">#{{ historia.id }}</span>
            </td>

            <td>
              <div class="nombre-historia">
                {{ historia.nombreHistoria }}
                <span v-if="historia.oculto" class="hidden-badge">(Oculta)</span>
              </div>
            </td>

            <td>
              <div class="fecha-captura">{{ historia.fechaCaptura }}</div>
            </td>

            <td>
              <div class="capturado-por">{{ historia.capturadoPor }}</div>
            </td>

            <td>
  <span class="rol-badge">
    {{ obtenerRolCapturador(historia) }}
  </span>
</td>

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
                  v-if="canWrite"
                  :to="`/portal/historias/${historia.id}/editar`"
                  class="action-btn edit-btn"
                  title="Editar historia"
                >
                  <Pencil :size="15" />
                </RouterLink>

                <!-- BOTÓN PARA OCULTAR O DESOCULTAR / RESTAURAR -->
                <button
                  v-if="canWrite"
                  type="button"
                  class="action-btn"
                  :class="historia.oculto ? 'restore-btn' : 'hide-btn'"
                  :title="historia.oculto ? 'Restaurar historia' : 'Ocultar historia'"
                  @click="confirmarAccion(historia)"
                >
                  <RotateCcw v-if="historia.oculto" :size="15" />
                  <EyeOff v-else :size="15" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="historiasFiltradas.length === 0">
            <td colspan="6" class="empty-state">
              <div class="empty-icon">
                <BookOpen :size="34" />
              </div>
              <h3>{{ mostrarOcultas ? 'No hay historias ocultas' : 'No hay historias registradas' }}</h3>
              <p>
                {{
                  mostrarOcultas
                    ? 'No se ha ocultado ninguna historia de usuario en este proyecto.'
                    : 'Actualmente no existen historias de usuario activas para este proyecto.'
                }}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- componente fooder -->
    <ListFooter 
  nota="Las historias mostradas corresponden únicamente al proyecto seleccionado."
  :currentPermission="permisoHistorias"
/>

    <!-- MODAL DE DETALLE COMPLETO -->
<div v-if="historiaDetalle" class="modal-overlay" @click.self="cerrarDetalles">
  <div class="detail-modal">
    <div class="detail-header">
      <h3>#{{ historiaDetalle.id }} - {{ historiaDetalle.nombreHistoria }}</h3>
      <span class="detail-author">
        Levantada por: <strong>{{ historiaDetalle.capturadoPor }}</strong> 
        (<span class="role-text">{{ obtenerRolCapturador(historiaDetalle) }}</span>)
      </span>
    </div>

        <div class="detail-body">
          <div class="detail-section">
            <h4>Quiero</h4>
            <p class="section-text">{{ historiaDetalle.quiero }}</p>
          </div>

          <div class="detail-section">
            <h4>Para</h4>
            <p class="section-text">{{ historiaDetalle.para }}</p>
          </div>

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
          
          <button 
            v-if="canWrite" 
            type="button" 
            class="edit-detail-btn" 
            @click="irAEditar(historiaDetalle.id)"
          >
            <Pencil :size="14" />
            <span>Editar historia</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN (OCULTAR O DESOCULTAR) -->
    <div v-if="historiaAAccionar" class="modal-overlay" @click.self="cancelarAccion">
      <div class="confirmation-modal">
        <div class="modal-icon" :class="{ 'restore-icon': historiaAAccionar.oculto }">
          <RotateCcw v-if="historiaAAccionar.oculto" :size="24" />
          <EyeOff v-else :size="24" />
        </div>
        <h3>{{ historiaAAccionar.oculto ? 'Restaurar historia' : 'Ocultar historia' }}</h3>
        <p>
          ¿Estás seguro de que deseas {{ historiaAAccionar.oculto ? 'restaurar' : 'ocultar' }} la historia 
          <strong>"{{ historiaAAccionar.nombreHistoria }}"</strong>?
        </p>
        <p class="modal-warning">
          {{
            historiaAAccionar.oculto
              ? 'La historia volverá a aparecer en la lista principal de historias activas.'
              : 'La historia pasará a la pestaña de historias ocultas.'
          }}
        </p>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="cancelarAccion">Cancelar</button>
          <button 
            type="button" 
            class="confirm-action-btn" 
            :class="{ 'restore-action-btn': historiaAAccionar.oculto }" 
            @click="ejecutarAccion"
          >
            {{ historiaAAccionar.oculto ? 'Restaurar' : 'Ocultar' }}
          </button>
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

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
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

/* BARRA DE PESTAÑAS / FILTRO DE ACTIVAS U OCULTAS */
.toolbar-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.filter-toggle {
  display: inline-flex;
  background: #eef2f6;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
}

.toggle-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-tab.active {
  background: #ffffff;
  color: #5F0032;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* TABLA DE HISTORIAS */
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

.row-hidden {
  background-color: #fafafa;
  opacity: 0.8;
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

.rol-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
  font-size: 11px;
  border: 1px solid #e2e8f0;
}

.nombre-historia {
  color: #1a1a1a;
  font-weight: 700;
}

.hidden-badge {
  font-size: 11px;
  color: #94a3b8;
  margin-left: 6px;
  font-style: italic;
}

.fecha-captura,
.capturado-por {
  color: #334155;
  font-weight: 600;
}

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

.hide-btn {
  background: #fee2e2;
  color: #991b1b;
}

.hide-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

.restore-btn {
  background: #d1fae5;
  color: #065f46;
}

.restore-btn:hover {
  background: #a7f3d0;
  transform: translateY(-1px);
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

/* MODALES */
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

.modal-icon.restore-icon {
  background: #d1fae5;
  color: #065f46;
}

.detail-header {
  margin-bottom: 16px;
}

.detail-header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #5F0032;
}

.detail-author {
  font-size: 12px;
  color: #64748b;
}

.role-text {
  color: #99154E;
  font-weight: 700;
}

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
.confirm-action-btn,
.edit-detail-btn {
  padding: 9px 16px;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cancel-btn {
  background: #eef2f6;
  color: #5F0032;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.edit-detail-btn {
  background: #fef3c7;
  color: #92400e;
}

.edit-detail-btn:hover {
  background: #fde9a0;
}

.confirm-action-btn {
  background: #ef9a9a;
  color: #7f1d1d;
}

.confirm-action-btn:hover {
  background: #e88080;
}

.confirm-action-btn.restore-action-btn {
  background: #6ee7b7;
  color: #064e3b;
}

.confirm-action-btn.restore-action-btn:hover {
  background: #34d399;
}
</style>
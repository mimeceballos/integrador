<script setup lang="ts">
import { reactive, ref, computed, inject, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import type { Ref } from 'vue'
import { ArrowLeft, X, Check, BookOpen, Plus, Trash2 } from 'lucide-vue-next'

// Componentes reutilizables estandarizados
import HeaderStatsCard from '../../components/Encabezado.vue'

// Importamos datos de Sistemas, Usuarios e Historias
import { sistemas } from '../../data/sistemas'
import { usuarios } from '../../data/usuarios'
import {
  agregarHistoria,
  actualizarHistoria,
  obtenerHistoria,
  fechaHoy,
  fechaHoyIso
} from '../../data/historias'
import { ESTATUS_REQUERIMIENTO, estatusDe } from '../../data/historias'
import type { Requerimiento, HistoriaUsuario, EstatusRequerimiento } from '../../data/historias'

const route = useRoute()
const router = useRouter()

/* PERMISOS */
type PermissionCode = 1 | 2 | 3
const currentPermission = inject<Ref<PermissionCode>>('currentPermission')
const canWrite = computed(() => currentPermission?.value === 3)

/* RECUPERAR EL PROYECTO ACTIVO */
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

const metodologiaProyecto = computed(() => {
  return proyectoActivo.value ? proyectoActivo.value.metodologia : 'No especificada'
})

// Lista de participantes activos para el combobox
const participantesDisponibles = computed(() => {
  return usuarios.value.filter(u => u.activo)
})

/* MODO DE FORMULARIO: CREAR O EDITAR */
const historiaId = computed(() =>
  route.params.id ? Number(route.params.id) : null
)
const esEdicion = computed(() => historiaId.value !== null)
const noEncontrado = ref(false)

/* ESTRUCTURA DEL FORMULARIO */
interface FormData {
  nombreHistoria: string
  usuarioEmail: string
  quiero: string
  para: string
}

const form = reactive<FormData>({
  nombreHistoria: '',
  usuarioEmail: '',
  quiero: '',
  para: ''
})

// Arreglo reactivo para guardar la lista de requerimientos de la historia
const requerimientosLista = ref<Requerimiento[]>([])
const errors = reactive<Partial<Record<keyof FormData, string>>>({})
const isSaving = ref(false)

/* MODAL DE REQUERIMIENTOS */
const isReqModalOpen = ref(false)
const reqNombre = ref('')
const reqDescripcion = ref('')
const reqError = ref('')

function abrirModalReq() {
  reqNombre.value = ''
  reqDescripcion.value = ''
  reqError.value = ''
  isReqModalOpen.value = true
}

function cerrarModalReq() {
  isReqModalOpen.value = false
}

// Agrega un nuevo requerimiento a la lista sin cerrar el modal
function guardarRequerimiento() {
  if (
    reqNombre.value.trim().length < 5 ||
    reqDescripcion.value.trim().length < 5
  ) {
    reqError.value = 'El nombre y la descripción deben contener al menos 5 caracteres.'
    return
  }


  const nuevoReq: Requerimiento = {
    id: Date.now(),
    nombre: reqNombre.value.trim(),
    descripcion: reqDescripcion.value.trim(),
    estatus: 'No iniciado'
  }

  // Se añade a la tabla inmediatamente
  requerimientosLista.value.push(nuevoReq)

    // Se limpian los campos y errores para poder agregar el siguiente
  reqNombre.value = ''
  reqDescripcion.value = ''
  reqError.value = ''
}

// Cantidad de requerimientos con estatus "Completado" (checks)
const totalCompletados = computed<number>(() =>
  requerimientosLista.value.filter(r => estatusDe(r) === 'Completado').length
)

// Cantidad de requerimientos "En curso"
const totalEnCurso = computed<number>(() =>
  requerimientosLista.value.filter(r => estatusDe(r) === 'En curso').length
)

// Cambia el estatus de un requerimiento
function cambiarEstatus(req: Requerimiento, estatus: EstatusRequerimiento) {
  req.estatus = estatus
}

// Clase de color para cada botón de estatus
function claseEstatus(estatus: EstatusRequerimiento): string {
  if (estatus === 'En curso') return 'st-curso'
  if (estatus === 'Completado') return 'st-completado'
  return 'st-pendiente'
}

// Porcentaje de avance de la historia (0 a 100)
const porcentajeAvance = computed<number>(() => {
  const total = requerimientosLista.value.length
  return total === 0 ? 0 : Math.round((totalCompletados.value / total) * 100)
})

// Marca o desmarca todos los requerimientos a la vez
function marcarTodos(valor: boolean) {
  requerimientosLista.value.forEach(r => {
    r.estatus = valor ? 'Completado' : 'No iniciado'
  })
}

// Elimina un requerimiento de la lista
function eliminarRequerimiento(id: number) {
  const indice = requerimientosLista.value.findIndex(r => r.id === id)
  if (indice !== -1) {
    requerimientosLista.value.splice(indice, 1)
  }
}

/* CARGAR FORMULARIO SEGÚN LA RUTA */
function cargarFormulario() {
  noEncontrado.value = false
  Object.keys(errors).forEach(k => delete errors[k as keyof FormData])

    if (!esEdicion.value) {
    form.nombreHistoria = ''
    form.usuarioEmail = ''
    form.quiero = ''
    form.para = ''
    requerimientosLista.value = []
    return
  }

  const existente = obtenerHistoria(historiaId.value as number)
  if (!existente) {
    noEncontrado.value = true
    return
  }

  form.nombreHistoria = existente.nombreHistoria
  form.usuarioEmail = existente.usuarioEmail
  form.quiero = existente.quiero
  form.para = existente.para

  // Copiamos los requerimientos existentes a la lista local
  requerimientosLista.value = []
    for (let i = 0; i < existente.requerimientos.length; i++) {
    requerimientosLista.value.push({
      ...existente.requerimientos[i],
      estatus: estatusDe(existente.requerimientos[i])
    })
  }
}

watch(() => route.fullPath, cargarFormulario, { immediate: true })

/* VALIDACIÓN DEL FORMULARIO */
function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k as keyof FormData])
  let valid = true

  if (!form.nombreHistoria.trim()) {
    errors.nombreHistoria = 'El nombre de la historia es obligatorio'
    valid = false
  }
  if (!form.usuarioEmail) {
    errors.usuarioEmail = 'Selecciona la persona que levanta la historia'
    valid = false
  }
  if (form.quiero.trim().length < 5) {
    errors.quiero = 'El campo "Quiero" debe contener al menos 5 caracteres'
    valid = false
  }
   if (form.para.trim().length < 5) {
    errors.para = 'El campo "Para" debe contener al menos 5 caracteres'
    valid = false
  }

  return valid
}

/* GUARDAR DATOS (CREAR O EDITAR) */
function handleSubmit() {
  if (!canWrite.value || !validate() || !proyectoActivoId.value) return
  isSaving.value = true

  let nombreCapturador = 'Usuario Desconocido'
  for (let i = 0; i < usuarios.value.length; i++) {
    if (usuarios.value[i].email === form.usuarioEmail) {
      nombreCapturador = usuarios.value[i].nombreCompleto
      break
    }
  }

  const datosGuardar: HistoriaUsuario = {
    id: esEdicion.value ? (historiaId.value as number) : 0,
    proyectoId: proyectoActivoId.value,
    nombreHistoria: form.nombreHistoria.trim(),
    fechaCaptura: fechaHoy(),
    fechaCapturaIso: fechaHoyIso(),
    capturadoPor: nombreCapturador,
    usuarioEmail: form.usuarioEmail,
    quiero: form.quiero.trim(),
    para: form.para.trim(),
    requerimientos: requerimientosLista.value
  }

  if (esEdicion.value) {
    actualizarHistoria(historiaId.value as number, datosGuardar)
  } else {
    agregarHistoria(datosGuardar)
  }

  isSaving.value = false
  router.push('/portal/historias')
}

function handleCancel() {
  router.push('/portal/historias')
}
</script>

<template>
  <section class="historias-form">

    <!-- ENCABEZADO SUPERIOR CON COMPONENTE REUTILIZABLE -->
    <div class="top-header">
      <div class="header-main-row">
        <div class="header-info">
          <BookOpen :size="38" class="header-icon" />
          <div class="header-text">
            <h2>Historias de usuario</h2>
            <p>Captura y edita los requerimientos e historias del proyecto seleccionado.</p>
          </div>
        </div>

        <!-- COMPONENTE ENCABEZADO ESTANDARIZADO CON PROYECTO ACTIVO Y METODOLOGÍA -->
        <HeaderStatsCard 
          :nombreProyecto="nombreProyectoActivo"
          :metodologia="metodologiaProyecto"
          :totalCount="requerimientosLista.length"
          totalLabel="Requerimientos"
        />
      </div>

      <!-- BOTÓN REGRESAR COLOCADO ABAJO DEL ENCABEZADO -->
      <div class="back-container">
        <RouterLink to="/portal/historias" class="back-button">
          <ArrowLeft :size="16" class="back-icon" />
          Volver a historias
        </RouterLink>
      </div>
    </div>

    <!-- SIN PERMISO -->
    <div v-if="!canWrite" class="notice-card">
      <h2>Sin permiso de escritura</h2>
      <p>No tienes permiso para registrar o editar historias de usuario.</p>
    </div>

    <!-- NO ENCONTRADO -->
    <div v-else-if="noEncontrado" class="notice-card">
      <h2>Historia no encontrada</h2>
      <p>La historia que intentas editar no existe.</p>
    </div>

    <!-- FORMULARIO DE CAPTURA -->
    <form v-else class="form-card" novalidate @submit.prevent="handleSubmit">

      <div class="form-header">
        <h1>{{ esEdicion ? 'Editar historia de usuario' : 'Nueva historia de usuario' }}</h1>
        <p>
          {{
            esEdicion
              ? 'Modifica los requerimientos y la estructura de la historia de usuario.'
              : 'Completa los datos para registrar una historia de usuario nueva en el proyecto activo.'
          }}
        </p>
      </div>

      <div class="form-grid">

        <!-- 1. NOMBRE DE LA HISTORIA -->
        <div class="field field-span-2">
          <label for="nombreHistoria">Nombre de la historia de usuario</label>
          <input
            id="nombreHistoria"
            v-model="form.nombreHistoria"
            type="text"
            placeholder="Ej. Autenticación de Usuarios en el Portal"
            :class="{ invalid: errors.nombreHistoria }"
          />
          <span v-if="errors.nombreHistoria" class="error-text">{{ errors.nombreHistoria }}</span>
        </div>

        <!-- 2. COMBOBOX DE PERSONA QUE LEVANTA LA HISTORIA -->
        <div class="field">
          <label for="usuarioEmail">Persona que levanta la historia</label>
          <select
            id="usuarioEmail"
            v-model="form.usuarioEmail"
            :class="{ invalid: errors.usuarioEmail }"
          >
            <option value="" disabled>Selecciona un participante</option>
            <option
              v-for="u in participantesDisponibles"
              :key="u.id"
              :value="u.email"
            >
              {{ u.nombreCompleto }} ({{ u.rolMetodologia }})
            </option>
          </select>
          <span v-if="errors.usuarioEmail" class="error-text">{{ errors.usuarioEmail }}</span>
        </div>

        <!-- SECCIÓN: ESTRUCTURA DE LA HISTORIA ("QUIERO" Y "PARA") -->
        <div class="section-divider field-full">
          <h3>Estructura de la Historia de Usuario</h3>
        </div>

        <!-- 3. CAMPO "QUIERO" -->
        <div class="field field-full">
          <label for="quiero">Quiero...</label>
          <textarea
            id="quiero"
            v-model="form.quiero"
            rows="2"
            placeholder="Describe qué funcionalidad requiere el usuario..."
            :class="{ invalid: errors.quiero }"
          ></textarea>
          <span v-if="errors.quiero" class="error-text">{{ errors.quiero }}</span>
        </div>

        <!-- 4. CAMPO "PARA" -->
        <div class="field field-full">
          <label for="para">Para...</label>
          <textarea
            id="para"
            v-model="form.para"
            rows="2"
            placeholder="Describe el beneficio o propósito que obtendrá el usuario..."
            :class="{ invalid: errors.para }"
          ></textarea>
          <span v-if="errors.para" class="error-text">{{ errors.para }}</span>
        </div>

        <!-- SECCIÓN: TABLA DE REQUERIMIENTOS -->
        <div class="section-divider field-full req-header-row">
          <h3>Requerimientos</h3>
          <button type="button" class="add-req-btn" @click="abrirModalReq">
            <Plus :size="15" />
            <span>Agregar Requerimiento</span>
          </button>
        </div>

        <!-- TABLA INTERNA DE REQUERIMIENTOS -->
        <div class="field-full req-table-wrapper">
          <div v-if="requerimientosLista.length > 0" class="checks-summary">
            <div class="checks-text">
              <strong>Checks:</strong>
              {{ totalCompletados }} de {{ requerimientosLista.length }} completados
              ({{ porcentajeAvance }}%) · {{ totalEnCurso }} en curso
            </div>
            <div class="checks-bar" role="progressbar" :aria-valuenow="porcentajeAvance" aria-valuemin="0" aria-valuemax="100">
              <div class="checks-bar-fill" :style="{ width: porcentajeAvance + '%' }"></div>
            </div>
            <div class="checks-actions">
              <button type="button" class="link-btn" @click="marcarTodos(true)">Marcar todos</button>
              <button type="button" class="link-btn" @click="marcarTodos(false)">Desmarcar todos</button>
            </div>
          </div>

          <table class="req-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="col-center">Estatus</th>
                <th class="col-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in requerimientosLista" :key="req.id" :class="{ 'req-done': estatusDe(req) === 'Completado' }">
                
                <td class="req-name">{{ req.nombre }}</td>
                <td class="req-desc">{{ req.descripcion }}</td>
                <td class="col-center">
                  <div class="estatus-group" role="group" :aria-label="'Estatus de ' + req.nombre">
                    <button
                      v-for="est in ESTATUS_REQUERIMIENTO"
                      :key="est"
                      type="button"
                      class="estatus-btn"
                      :class="[claseEstatus(est), { active: estatusDe(req) === est }]"
                      :aria-pressed="estatusDe(req) === est"
                      @click="cambiarEstatus(req, est)"
                    >
                      {{ est }}
                    </button>
                  </div>
                </td>
                <td class="col-center">
                  <button
                    type="button"
                    class="action-btn delete-btn"
                    title="Eliminar requerimiento"
                    @click="eliminarRequerimiento(req.id)"
                  >
                    <Trash2 :size="14" />
                  </button>
                </td>
              </tr>
              <tr v-if="requerimientosLista.length === 0">
                <td colspan="5" class="empty-req-table">
                  No se han agregado requerimientos a esta historia. Haz clic en "Agregar Requerimiento".
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- BOTONES DE ACCIÓN PRINCIPALES -->
      <div class="form-actions">
        <button type="button" class="cancel-btn" @click="handleCancel">
          <X :size="18" class="btn-icon" />
          <span>Cancelar</span>
        </button>
  
        <button type="submit" class="submit-btn" :disabled="isSaving">
          <Check :size="18" class="btn-icon" />
          <span>{{ esEdicion ? 'Guardar cambios' : 'Registrar historia' }}</span>
        </button>
      </div>
    </form>

    <!-- MODAL PARA AGREGAR REQUERIMIENTOS (PERMITE AGREGAR MÚLTIPLES Y LUEGO CERRAR) -->
    <div v-if="isReqModalOpen" class="modal-overlay" @click.self="cerrarModalReq">
      <div class="req-modal">
        <h3>Nuevo Requerimiento</h3>
        <p>Ingresa los detalles del requerimiento para esta historia.</p>

        <div class="modal-field">
          <label>Nombre del Requerimiento</label>
          <input
            v-model="reqNombre"
            type="text"
            placeholder="Ej. Validación de formato de correo"
            @keyup.enter="guardarRequerimiento"
          />
        </div>

        <div class="modal-field">
          <label>Descripción</label>
          <textarea
            v-model="reqDescripcion"
            rows="3"
            placeholder="Describe en qué consiste el requerimiento..."
          ></textarea>
        </div>

        <span v-if="reqError" class="modal-error">{{ reqError }}</span>

        <div class="modal-actions">
          <button type="button" class="modal-cancel-btn" @click="cerrarModalReq">
            Cerrar
          </button>
          <button type="button" class="confirm-req-btn" @click="guardarRequerimiento">
            Agregar Requerimiento
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.historias-form {
  width: 100%;
  color: #1e3a5f;
  text-align: left;
}

/* ENCABEZADO */
.top-header {
  margin-bottom: 22px;
}

.header-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  color: #1e3a5f;
  flex-shrink: 0;
  stroke-width: 2;
}

.header-text h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: #1e3a5f;
}

.header-text p {
  margin: 4px 0 0 0;
  color: #6c7886;
  font-size: 15px;
}

.back-container {
  display: flex;
  justify-content: flex-start;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 15px;
  border-radius: 999px;
  background: #f1f5fa;
  border: 1px solid #d3deec;
  color: #1e3a5f;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #dde6f1;
  transform: translateX(-2px);
}

.back-icon {
  flex-shrink: 0;
  stroke-width: 2.5;
}

/* FORMULARIO PRINCIPAL */
.form-card,
.notice-card {
  width: 100%;
  padding: 32px 36px;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 20px;
}

.notice-card {
  text-align: center;
}

.form-header h1 {
  margin: 0 0 6px;
  color: #f79d65;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.form-header p {
  margin: 0 0 24px;
  color: #6c7886;
  font-size: 13px;
}

.section-divider {
  margin-top: 16px;
  margin-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 6px;
}

.section-divider h3 {
  margin: 0;
  color: #1e3a5f;
  font-size: 15px;
  font-weight: 800;
  text-transform: uppercase;
}

.req-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-req-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f1f5fa;
  border: 1px solid #d3deec;
  color: #1e3a5f;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-req-btn:hover {
  background: #dde6f1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 32px;
  row-gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.field-full {
  grid-column: 1 / -1;
}

.field-span-2 {
  grid-column: span 2;
}

.field label {
  margin-bottom: 6px;
  color: #555151;
  font-size: 13px;
  font-weight: 500;
}

.field input,
.field textarea {
  font: inherit;
  font-size: 15px;
  padding: 6px 2px 8px;
  border: none;
  border-bottom: 1.5px solid #5b7089;
  background: transparent;
  color: #1a1a1a;
  outline: none;
  box-sizing: border-box;
}

.field select {
  font: inherit;
  font-size: 14px;
  padding: 8px 10px;
  border: 1.5px solid #5b7089;
  border-radius: 8px;
  background-color: #ffffff;
  color: #1a1a1a;
  outline: none;
  cursor: pointer;
}

.field input:focus,
.field textarea:focus {
  border-bottom-color: #0f766e;
}

.field .invalid {
  border-color: #0f766e !important;
}

.error-text {
  margin-top: 6px;
  color: #dc2626;
  font-size: 13px;
}

/* TABLA INTERNA DE REQUERIMIENTOS */
.req-table-wrapper {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 6px;
}

.req-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}

.req-table th {
  padding: 10px;
  background: #f1f5f9;
  color: #1e3a5f;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  text-align: left;
}

.req-table td {
  padding: 10px;
  border-top: 1px solid #f1f5f9;
  font-size: 13px;
  color: #334155;
}

.req-name {
  font-weight: 700;
  width: 30%;
}

/* CHECKS DE REQUERIMIENTOS */
.checks-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
  color: #334155;
}

.checks-bar {
  flex: 1;
  min-width: 120px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.checks-bar-fill {
  height: 100%;
  background: #0f766e;
  border-radius: 999px;
  transition: width 0.25s ease;
}

.checks-actions {
  display: flex;
  gap: 12px;
}

.link-btn {
  padding: 0;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #0f766e;
  background: none;
  border: none;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.col-check {
  width: 64px;
  text-align: center !important;
}

.req-check {
  width: 18px;
  height: 18px;
  accent-color: #0f766e;
  cursor: pointer;
}

/* BOTONES DE ESTATUS (NO INICIADO / EN CURSO / COMPLETADO) */
.estatus-group {
  display: inline-flex;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
}

.estatus-btn {
  padding: 5px 10px;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  color: #64748b;
  background: #ffffff;
  border: none;
  border-right: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.estatus-btn:last-child {
  border-right: none;
}

.estatus-btn:hover {
  background: #f1f5f9;
}

.estatus-btn.st-pendiente.active {
  background: #e2e8f0;
  color: #334155;
}

.estatus-btn.st-curso.active {
  background: #dbe7f5;
  color: #1e3a5f;
}

.estatus-btn.st-completado.active {
  background: #d1fae5;
  color: #065f46;
}

.req-done .req-name,
.req-done .req-desc {
  color: #94a3b8;
  text-decoration: line-through;
}


.empty-req-table {
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  padding: 20px !important;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.delete-btn {
  background: #fee2e2;
  color: #991b1b;
}

.delete-btn:hover {
  background: #fecaca;
}

.col-center {
  text-align: center !important;
}

/* BOTONES PRINCIPALES */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.submit-btn,
.cancel-btn {
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border: none;
  border-radius: 999px;
  padding: 13px 26px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.submit-btn {
  color: #ffffff;
  background: #2c5282;
}

.cancel-btn {
  color: #1e3a5f;
  background: #dbe7f5;
}

/* MODAL DE REQUERIMIENTOS */
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

.req-modal {
  width: min(450px, 100%);
  padding: 26px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.18);
}

.req-modal h3 {
  margin: 0 0 4px;
  color: #1e3a5f;
  font-size: 18px;
  font-weight: 800;
}

.req-modal p {
  margin: 0 0 16px;
  font-size: 13px;
  color: #64748b;
}

.modal-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

.modal-field label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.modal-field input,
.modal-field textarea {
  font: inherit;
  font-size: 14px;
  padding: 10px 12px;
  background-color: #ffffff;
  color: #1a1a1a;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.modal-field input:focus,
.modal-field textarea:focus {
  border-color: #2c5282;
}

.modal-error {
  display: block;
  font-size: 12px;
  color: #dc2626;
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-cancel-btn,
.confirm-req-btn {
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.modal-cancel-btn {
  background: #dbe7f5;
  color: #1e3a5f;
}

.confirm-req-btn {
  background: #2c5282;
  color: #ffffff;
}

.modal-cancel-btn:hover,
.confirm-req-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}
</style>
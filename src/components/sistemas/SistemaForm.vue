<script setup lang="ts">
import { reactive, ref, computed, inject, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import type { Ref } from 'vue'
import { ArrowLeft, X, Check } from 'lucide-vue-next' //Iconos de la libreria

import {
  agregarSistema,
  actualizarSistema,
  obtenerSistema,
  fechaHoy,
  fechaAIso,
  isoAFecha
} from '../../data/sistemas'

const route = useRoute()
const router = useRouter()


/* PERMISOS */
type PermissionCode = 1 | 2 | 3

const currentPermission = inject<Ref<PermissionCode>>('currentPermission')

// Solo el permiso 3 (Escritura) puede crear o editar
const canWrite = computed(() => currentPermission?.value === 3)

/* -----------------------------------------
 * MODO: NUEVO O EDICIÓN
 * -----------------------------------------
 * /portal/sistemas/nuevo        -> crear
 * /portal/sistemas/:id/editar   -> editar
 */
const sistemaId = computed(() =>
  route.params.id ? Number(route.params.id) : null
)
const esEdicion = computed(() => sistemaId.value !== null)
const noEncontrado = ref(false)


/* OPCIONES PARA EL SELECT */
const metodologias = [
  'Scrum',
  'Kanban',
  'Cascada',
  'XP (Extreme Programming)',
  'Lean',
  'Híbrida'
]
const estados = ['Activo', 'Desarrollo', 'Inactivo']


/* -FORMULARIO */
interface FormData {
  metodologia: string
  nombre: string
  descripcion: string
  estado: string
  responsableEmail: string
  responsableNombre: string
  responsableApellidoPaterno: string
  responsableApellidoMaterno: string
  fechaInicio: string 
  fechaFin: string
}

const form = reactive<FormData>({
  metodologia: '',
  nombre: '',
  descripcion: '',
  estado: 'Desarrollo',
  responsableEmail: '',
  responsableNombre: '',
  responsableApellidoPaterno: '',
  responsableApellidoMaterno: '',
  fechaInicio: '',
  fechaFin: ''
})

// Solo lectura: se actualiza automáticamente al guardar
const fechaActualizacion = ref(fechaHoy())

const errors = reactive<Partial<Record<keyof FormData, string>>>({})
const isSaving = ref(false)

// Carga los datos (si es edición) o asigna valores por defecto (si es nuevo)
function cargarFormulario() {
  noEncontrado.value = false

  Object.keys(errors).forEach(k => delete errors[k as keyof FormData])

  if (!esEdicion.value) {
    form.metodologia = ''
    form.nombre = ''
    form.descripcion = ''
    form.estado = 'Desarrollo'
    form.responsableEmail = ''
    form.responsableNombre = ''
    form.responsableApellidoPaterno = ''
    form.responsableApellidoMaterno = ''

    //Para calcular las fechas
    // 1. Asignar la fecha de hoy local en formato "YYYY-MM-DD"
    const hoy: Date = new Date()
    form.fechaInicio = hoy.toLocaleDateString('sv-SE')

    // 2. Crear fecha de fin sumándole 3 meses a la fecha actual
    const fechaFinCalculada: Date = new Date()
    fechaFinCalculada.setMonth(fechaFinCalculada.getMonth() + 3)
    form.fechaFin = fechaFinCalculada.toLocaleDateString('sv-SE')

    fechaActualizacion.value = fechaHoy()
    return
  }

  const existente = obtenerSistema(sistemaId.value as number)
  if (!existente) {
    noEncontrado.value = true
    return
  }

  form.metodologia = existente.metodologia
  form.nombre = existente.nombre
  form.descripcion = existente.descripcion
  form.estado = existente.estado

  // Separar el nombre del responsable para los 4 nuevos campos en edición
  const partesNombre = (existente.responsable || '').split(' ')
  form.responsableNombre = partesNombre[0] || ''
  form.responsableApellidoPaterno = partesNombre[1] || ''
  form.responsableApellidoMaterno = partesNombre.slice(2).join(' ') || ''
  form.responsableEmail = (existente as any).responsableEmail || ''

  form.fechaInicio = fechaAIso(existente.fechaInicio)
  form.fechaFin = fechaAIso(existente.fechaFin)
  fechaActualizacion.value = existente.fechaActualizacion
}

// Se vuelve a cargar si cambia entre /nuevo y /:id/editar
watch(() => route.fullPath, cargarFormulario, { immediate: true })


/* VALIDACION */
function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k as keyof FormData])
  let valid = true

  if (!form.metodologia) {
    errors.metodologia = 'Selecciona una metodología'
    valid = false
  }
  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre del proyecto es obligatorio'
    valid = false
  }
  if (!form.descripcion.trim()) {
    errors.descripcion = 'La descripción es obligatoria'
    valid = false
  }
  if (!form.estado) {
    errors.estado = 'Selecciona un estado'
    valid = false
  }

  /* Validaciones para los datos del responsable */
  if (!form.responsableEmail.trim()) {
    errors.responsableEmail = 'El correo electrónico es obligatorio'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.responsableEmail)) {
    errors.responsableEmail = 'Ingresa un correo electrónico válido'
    valid = false
  }
  if (!form.responsableNombre.trim()) {
    errors.responsableNombre = 'El nombre es obligatorio'
    valid = false
  }
  if (!form.responsableApellidoPaterno.trim()) {
    errors.responsableApellidoPaterno = 'El apellido paterno es obligatorio'
    valid = false
  }

  if (!form.fechaInicio) {
    errors.fechaInicio = 'La fecha de inicio es obligatoria'
    valid = false
  }
  if (!form.fechaFin) {
    errors.fechaFin = 'La fecha de fin es obligatoria'
    valid = false
  } else if (form.fechaInicio && form.fechaFin < form.fechaInicio) {
    errors.fechaFin = 'La fecha de fin no puede ser anterior a la de inicio'
    valid = false
  }
  return valid
}


/* GUARDAR */
function handleSubmit() {
  if (!canWrite.value || !validate()) return
  isSaving.value = true

  // Concatenación del nombre completo
  const nombreCompletoResponsable = `${form.responsableNombre.trim()} ${form.responsableApellidoPaterno.trim()} ${form.responsableApellidoMaterno.trim()}`.trim()

  const datos = {
    metodologia: form.metodologia,
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    estado: form.estado,
    responsable: nombreCompletoResponsable,
    responsableEmail: form.responsableEmail.trim(),
    fechaInicio: isoAFecha(form.fechaInicio),
    fechaFin: isoAFecha(form.fechaFin)
  }

  if (esEdicion.value) {
    // fechaActualizacion se asigna sola dentro de actualizarSistema
    actualizarSistema(sistemaId.value as number, datos)
  } else {
    agregarSistema({
      ...datos,
      // Campos que el formulario aún no pide
      departamento: 'No especificado',
      objetivo: 'Sin objetivo registrado.',
      presupuesto: 0,
      inventario: [],
      empleados: []
    })
  }
  isSaving.value = false
  router.push('/portal/sistemas')
}

function handleCancel() {
  router.push('/portal/sistemas')
}
</script>

<template>
  <section class="sistema-form">

    <!-- REGRESAR CON ÍCONO DE LUCIDE -->
    <div class="back-container">
      <RouterLink to="/portal/sistemas" class="back-button">
        <ArrowLeft :size="16" class="back-icon" />
        Volver a sistemas
      </RouterLink>
    </div>

    <!-- SIN PERMISO -->
    <div v-if="!canWrite" class="notice-card">
      <h2>Sin permiso de escritura</h2>
      <p>No tienes permiso para registrar o editar sistemas.</p>
    </div>

    <!-- NO ENCONTRADO -->
    <div v-else-if="noEncontrado" class="notice-card">
      <h2>Sistema no encontrado</h2>
      <p>El sistema que intentas editar no existe.</p>
    </div>

    <!-- FORMULARIO -->
    <form v-else class="form-card" novalidate @submit.prevent="handleSubmit">

      <div class="form-header">
        <h1>{{ esEdicion ? 'Editar sistema' : 'Nuevo sistema' }}</h1>
        <p>
          {{
            esEdicion
              ? 'Modifica los datos del proyecto. La fecha de actualización se registra sola al guardar.'
              : 'Completa los datos para registrar un sistema nuevo.'
          }}
        </p>
      </div>

      <div class="form-grid">

        <!-- METODOLOGÍA -->
        <div class="field">
          <label for="metodologia">Tipo de metodología</label>
          <select
            id="metodologia"
            v-model="form.metodologia"
            :class="{ invalid: errors.metodologia }"
          >
            <option value="" disabled>Selecciona una opción</option>
            <option v-for="m in metodologias" :key="m" :value="m">{{ m }}</option>
          </select>
          <span v-if="errors.metodologia" class="error-text">{{ errors.metodologia }}</span>
        </div>

        <!-- NOMBRE -->
        <div class="field field-span-2">
          <label for="nombre">Nombre del proyecto</label>
          <input
            id="nombre"
            v-model="form.nombre"
            type="text"
            placeholder="Ej. Sistema de Compras"
            :class="{ invalid: errors.nombre }"
          />
          <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
        </div>

        <!-- DESCRIPCIÓN -->
        <div class="field field-full">
          <label for="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            v-model="form.descripcion"
            rows="2"
            placeholder="Describe brevemente el proyecto"
            :class="{ invalid: errors.descripcion }"
          ></textarea>
          <span v-if="errors.descripcion" class="error-text">{{ errors.descripcion }}</span>
        </div>

        <!-- ESTADO -->
        <div class="field field-full">
          <label for="estado">Estado</label>
          <select
            id="estado"
            v-model="form.estado"
            :class="{ invalid: errors.estado }"
          >
            <option v-for="e in estados" :key="e" :value="e">{{ e }}</option>
          </select>
          <span v-if="errors.estado" class="error-text">{{ errors.estado }}</span>
        </div>

        <!-- SECCIÓN: DATOS DEL RESPONSABLE -->
        <div class="section-divider field-full">
          <h3>Datos del responsable</h3>
        </div>

        <!-- 1. CORREO ELECTRÓNICO -->
        <div class="field field-span-2">
          <label for="responsableEmail">Correo Electrónico</label>
          <input
            id="responsableEmail"
            v-model="form.responsableEmail"
            type="email"
            placeholder="ejemplo@dominio.com"
            :class="{ invalid: errors.responsableEmail }"
          />
          <span v-if="errors.responsableEmail" class="error-text">{{ errors.responsableEmail }}</span>
        </div>

        <!-- 2. NOMBRE -->
        <div class="field">
          <label for="responsableNombre">Nombre</label>
          <input
            id="responsableNombre"
            v-model="form.responsableNombre"
            type="text"
            placeholder="Nombre(s)"
            :class="{ invalid: errors.responsableNombre }"
          />
          <span v-if="errors.responsableNombre" class="error-text">{{ errors.responsableNombre }}</span>
        </div>

        <!-- 3. APELLIDO PATERNO -->
        <div class="field">
          <label for="responsableApellidoPaterno">Apellido Paterno</label>
          <input
            id="responsableApellidoPaterno"
            v-model="form.responsableApellidoPaterno"
            type="text"
            placeholder="Primer apellido"
            :class="{ invalid: errors.responsableApellidoPaterno }"
          />
          <span v-if="errors.responsableApellidoPaterno" class="error-text">{{ errors.responsableApellidoPaterno }}</span>
        </div>

        <!-- 4. APELLIDO MATERNO -->
        <div class="field">
          <label for="responsableApellidoMaterno">Apellido Materno</label>
          <input
            id="responsableApellidoMaterno"
            v-model="form.responsableApellidoMaterno"
            type="text"
            placeholder="Segundo apellido (opcional)"
          />
        </div>

        <!-- SECCIÓN: FECHAS DEL PROYECTO -->
        <div class="section-divider field-full">
          <h3>Fechas del proyecto</h3>
        </div>

        <!-- FECHA DE INICIO -->
        <div class="field">
          <label for="fechaInicio">Fecha de inicio</label>
          <input
            id="fechaInicio"
            v-model="form.fechaInicio"
            type="date"
            class="date-input"
            :class="{ invalid: errors.fechaInicio }"
          />
          <span v-if="errors.fechaInicio" class="error-text">{{ errors.fechaInicio }}</span>
        </div>

        <!-- FECHA DE FIN -->
        <div class="field">
          <label for="fechaFin">Fecha de fin</label>
          <input
            id="fechaFin"
            v-model="form.fechaFin"
            type="date"
            class="date-input"
            :min="form.fechaInicio || undefined"
            :class="{ invalid: errors.fechaFin }"
          />
          <span v-if="errors.fechaFin" class="error-text">{{ errors.fechaFin }}</span>
        </div>

        <!-- FECHA DE ACTUALIZACIÓN -->
        <div class="field">
          <label for="fechaActualizacion">Fecha de actualización</label>
          <input
            id="fechaActualizacion"
            :value="fechaActualizacion"
            type="text"
            readonly
            class="readonly"
          />
          <span class="hint">
            Se actualiza automáticamente cada vez que guardas cambios.
          </span>
        </div>

      </div>

      <div class="form-actions">
        <button type="button" class="cancel-btn" @click="handleCancel">
          <X :size="18" class="btn-icon" />
          <span>Cancelar</span>
        </button>
  
        <button type="submit" class="submit-btn" :disabled="isSaving">
          <Check :size="18" class="btn-icon" />
          <span>{{ esEdicion ? 'Guardar cambios' : 'Registrar sistema' }}</span>
        </button>
      </div>
    </form>
  </section>
</template>


<style scoped>
.sistema-form {
  width: 100%;
  color: #5F0032;
  text-align: left;
}

/* REGRESAR */
.back-container {
  margin-bottom: 18px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 15px;
  border-radius: 999px;
  background: #FBEAF9;
  border: 1px solid #F0CBEC;
  color: #5F0032;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #F5D6F2;
  transform: translateX(-2px);
}

.back-icon {
  flex-shrink: 0;
  stroke-width: 2.5;
}


/* TARJETAS */
.form-card,
.notice-card {
  width: 100%;
  max-width: 100%;
  padding: 32px 36px;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 20px;
}

.notice-card {
  text-align: center;
}

.notice-card h2 {
  margin: 0 0 8px;
  color: #5F0032;
  font-size: 20px;
  font-weight: 800;
}

.notice-card p {
  margin: 0;
  color: #6c7886;
  font-size: 14px;
}


/* ENCABEZADO */
.form-header {
  margin-bottom: 26px;
}

.form-header h1 {
  margin: 0 0 6px;
  color: #5F0032;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.form-header p {
  margin: 0;
  color: #6c7886;
  font-size: 13px;
}


/* SECCIONES EN EL FORMULARIO */
.section-divider {
  margin-top: 12px;
  margin-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 6px;
}

.section-divider h3 {
  margin: 0;
  color: #5F0032;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}


/* CAMPOS EN GRID COMPACTO */
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
.field select,
.field textarea {
  font: inherit;
  font-size: 15px;
  padding: 6px 2px 8px;
  border: none;
  border-bottom: 1.5px solid #4D6787;
  background: transparent;
  color: #1a1a1a;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

/* REGLAS CSS PARA FORZAR LA VISIBILIDAD DEL ÍCONO DE CALENDARIO */
.field input[type="date"].date-input {
  position: relative;
  cursor: pointer;
}

/* Estilo explícito para el ícono nativo del selector de fecha */
.field input[type="date"]::-webkit-calendar-picker-indicator {
  display: block;
  background-position: center;
  background-size: contain;
  cursor: pointer;
  opacity: 0.7;
  filter: invert(12%) sepia(85%) saturate(4522%) hue-rotate(308deg) brightness(50%) contrast(110%);
  transition: opacity 0.2s;
}

.field input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.field textarea {
  resize: vertical;
  min-height: 55px;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-bottom-color: #D46D25;
}

.field .invalid {
  border-bottom-color: #D46D25;
}

.field .readonly {
  color: #6c7886;
  cursor: not-allowed;
  border-bottom-style: dashed;
}

.error-text {
  margin-top: 6px;
  color: #D46D25;
  font-size: 13px;
}

.hint {
  margin-top: 6px;
  color: #8a94a1;
  font-size: 12px;
}


/* BOTONES */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
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
  transition: opacity 0.2s, transform 0.15s;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  flex-shrink: 0;
  stroke-width: 2.5;
}

.submit-btn {
  color: #ffffff;
  background: #99154E;
}

.cancel-btn {
  color: #5F0032;
  background: #E8F9A2;
}

.submit-btn:hover:not(:disabled),
.cancel-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


/* RESPONSIVE */
@media (max-width: 992px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .field-span-2 {
    grid-column: span 1;
  }
}

@media (max-width: 700px) {
  .form-card,
  .notice-card {
    padding: 24px 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-span-2 {
    grid-column: span 1;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>
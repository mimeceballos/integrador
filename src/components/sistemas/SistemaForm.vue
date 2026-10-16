<script setup lang="ts">
import { reactive, ref, computed, inject, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import type { Ref } from 'vue'

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
const estados = ['Activo', 'En desarrollo', 'Inactivo']


/* -FORMULARIO */
interface FormData {
  metodologia: string
  nombre: string
  descripcion: string
  estado: string
  responsable: string
  fechaInicio: string 
  fechaFin: string
}

const form = reactive<FormData>({
  metodologia: '',
  nombre: '',
  descripcion: '',
  estado: 'En desarrollo',
  responsable: '',
  fechaInicio: '',
  fechaFin: ''
})

// Solo lectura: se actualiza automáticamente al guardar
const fechaActualizacion = ref(fechaHoy())

const errors = reactive<Partial<Record<keyof FormData, string>>>({})
const isSaving = ref(false)

// Carga los datos (si es edición) o limpia el formulario (si es nuevo)
function cargarFormulario() {
  noEncontrado.value = false

  Object.keys(errors).forEach(k => delete errors[k as keyof FormData])

  if (!esEdicion.value) {
    form.metodologia = ''
    form.nombre = ''
    form.descripcion = ''
    form.estado = 'En desarrollo'
    form.responsable = ''
    form.fechaInicio = ''
    form.fechaFin = ''
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
  form.responsable = existente.responsable
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
  if (!form.responsable.trim()) {
    errors.responsable = 'El responsable es obligatorio'
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
  const datos = {
    metodologia: form.metodologia,
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    estado: form.estado,
    responsable: form.responsable.trim(),
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

    <!-- REGRESAR -->
    <div class="back-container">
      <RouterLink to="/portal/sistemas" class="back-button">
        <span class="back-icon">←</span>
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
        <div class="field">
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
            rows="3"
            placeholder="Describe brevemente el proyecto"
            :class="{ invalid: errors.descripcion }"
          ></textarea>
          <span v-if="errors.descripcion" class="error-text">{{ errors.descripcion }}</span>
        </div>

        <!-- ESTADO -->
        <div class="field">
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

        <!-- RESPONSABLE -->
        <div class="field">
          <label for="responsable">Responsable</label>
          <input
            id="responsable"
            v-model="form.responsable"
            type="text"
            placeholder="Nombre del responsable"
            :class="{ invalid: errors.responsable }"
          />
          <span v-if="errors.responsable" class="error-text">{{ errors.responsable }}</span>
        </div>

        <!-- FECHA DE INICIO -->
        <div class="field">
          <label for="fechaInicio">Fecha de inicio</label>
          <input
            id="fechaInicio"
            v-model="form.fechaInicio"
            type="date"
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
            :min="form.fechaInicio || undefined"
            :class="{ invalid: errors.fechaFin }"
          />
          <span v-if="errors.fechaFin" class="error-text">{{ errors.fechaFin }}</span>
        </div>

        <!-- FECHA DE ACTUALIZACIÓN -->
        <div class="field field-full">
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
          Cancelar
        </button>
        <button type="submit" class="submit-btn" :disabled="isSaving">
          {{ esEdicion ? 'Guardar cambios' : 'Registrar sistema' }}
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
  padding: 8px 13px;
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
  font-size: 16px;
}


/* TARJETAS */
.form-card,
.notice-card {
  max-width: 860px;
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


/* CAMPOS*/
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 32px;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 22px;
}

.field-full {
  grid-column: 1 / -1;
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

.field textarea {
  resize: vertical;
  min-height: 70px;
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
  margin-top: 8px;
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
  padding: 13px 28px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
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
@media (max-width: 700px) {
  .form-card,
  .notice-card {
    padding: 24px 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>

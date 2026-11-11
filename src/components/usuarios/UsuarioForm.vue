<script setup lang="ts">
import { reactive, ref, computed, inject, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import type { Ref } from 'vue'
import { ArrowLeft, X, Check, Users } from 'lucide-vue-next'

// Componente 
import HeaderStatsCard from '../../components/Encabezado.vue'

//lista de sistemas para datos estáticos
import { sistemas } from '../../data/sistemas'

/* (usuarios.ts) */
import {
  usuarios,
  agregarUsuario,
  actualizarUsuario,
  obtenerUsuario
} from '../../data/usuarios'

const route = useRoute()
const router = useRouter()

/*PERMISOS DE SESIÓN */
type PermissionCode = 1 | 2 | 3

const currentPermission = inject<Ref<PermissionCode>>('currentPermission')

// Solo el permiso 3 (Escritura) permite crear o editar usuarios
const canWrite = computed(() => currentPermission?.value === 3)

/* RECUPERAR EL PROYECTO ACTIVO Y SUS DATOS
 * se lee el ID guardado en localStorage para saber en qué sistema estamos */
const proyectoActivoId = ref<number | null>(
  localStorage.getItem('proyecto_activo_id')
    ? Number(localStorage.getItem('proyecto_activo_id'))
    : null
)

// Obtenemos el objeto completo del sistema activo
const proyectoActivo = computed(() => {
  return sistemas.value.find(s => s.id === proyectoActivoId.value)
})

// Metodología del proyecto activo
const metodologiaProyecto = computed<string>(() => {
  return proyectoActivo.value ? proyectoActivo.value.metodologia : 'No especificada'
})

// Nombre del proyecto activo para el encabezado
const nombreProyectoActivo = computed<string>(() => {
  return proyectoActivo.value ? proyectoActivo.value.nombre : ''
})

/* CATÁLOGO DE ROLES POR METODOLOGÍA */
const rolesPorMetodologia: Record<string, string[]> = {
  'XP (Extreme Programming)': [
    'Cliente (Customer)',
    'Programador (Developer)',
    'Probador (Tester)',
    'Encargado de Seguimiento (Tracker)',
    'Entrenador (Coach)'
  ],
  Scrum: [
    'Product Owner',
    'Scrum Master',
    'Developer'
  ],
  Kanban: [
    'Service Delivery Manager',
    'Service Request Manager',
    'Team Member'
  ],
  Cascada: [
    'Jefe de Proyecto',
    'Analista de Requerimientos',
    'Diseñador de Software',
    'Desarrollador',
    'Tester'
  ],
  Lean: [
    'Líder de Flujo',
    'Facilitador de Mejora',
    'Miembro de Equipo'
  ],
  Híbrida: [
    'Líder de Proyecto',
    'Desarrollador',
    'Analista',
    'Tester'
  ]
}

// Genera los roles filtrados para la metodología del proyecto activo
const rolesDisponibles = computed<string[]>(() => {
  return rolesPorMetodologia[metodologiaProyecto.value] || []
})

/* MODO: NUEVO O EDICIÓN*/
const usuarioId = computed(() =>
  route.params.id ? Number(route.params.id) : null
)
const esEdicion = computed(() => usuarioId.value !== null)
const noEncontrado = ref(false)

/* ESTRUCTURA DEL FORMULARIO*/
interface FormData {
  email: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  rolMetodologia: string
  activo: boolean
}

const form = reactive<FormData>({
  email: '',
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  rolMetodologia: '',
  activo: true 
})

const errors = reactive<Partial<Record<keyof FormData, string>>>({})
const isSaving = ref(false)

/* CARGA DE DATOS DEL FORMULARIO */
function cargarFormulario() {
  noEncontrado.value = false
  Object.keys(errors).forEach(k => delete errors[k as keyof FormData])

  if (!esEdicion.value) {
    form.email = ''
    form.nombre = ''
    form.apellidoPaterno = ''
    form.apellidoMaterno = ''
    form.rolMetodologia = ''
    form.activo = true
    return
  }

  const existente = obtenerUsuario(usuarioId.value as number)
  if (!existente) {
    noEncontrado.value = true
    return
  }

  form.email = existente.email
  
  const partesNombre = existente.nombreCompleto.split(' ')
  form.nombre = partesNombre[0] || ''
  form.apellidoPaterno = partesNombre[1] || ''
  form.apellidoMaterno = partesNombre.slice(2).join(' ') || ''

  form.rolMetodologia = existente.rolMetodologia
  form.activo = existente.activo
}

watch(() => route.fullPath, cargarFormulario, { immediate: true })

/* VALIDACIÓN */
function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k as keyof FormData])
  let valid = true

  if (!form.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresa un correo electrónico válido'
    valid = false
  }

  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio'
    valid = false
  }

  if (!form.apellidoPaterno.trim()) {
    errors.apellidoPaterno = 'El apellido paterno es obligatorio'
    valid = false
  }

  if (!form.rolMetodologia) {
    errors.rolMetodologia = 'Selecciona un rol de la metodología'
    valid = false
  }

  return valid
}

/* GUARDAR USUARIO (CONECTADO A USUARIOS.TS)*/
function handleSubmit() {
  if (!canWrite.value || !validate()) return
  isSaving.value = true

  const nombreCompleto = `${form.nombre.trim()} ${form.apellidoPaterno.trim()} ${form.apellidoMaterno.trim()}`.trim()

  const datosUsuario = {
    email: form.email.trim(),
    nombreCompleto,
    metodologia: metodologiaProyecto.value,
    rolMetodologia: form.rolMetodologia,
    activo: form.activo
  }

  if (esEdicion.value) {
    actualizarUsuario(usuarioId.value as number, datosUsuario)
  } else {
    agregarUsuario(datosUsuario)
  }

  isSaving.value = false
  router.push('/portal/usuarios')
}

function handleCancel() {
  router.push('/portal/usuarios')
}
</script>

<template>
  <section class="usuario-form">

    <!-- ENCABEZADO SUPERIOR -->
    <div class="top-header">
      <!-- FILA SUPERIOR: ÍCONO, TÍTULO, DESCRIPCIÓN Y TARJETAS ESTADÍSTICAS -->
      <div class="header-main-row">
        <div class="header-info">
          <Users :size="38" class="header-icon" />
          <div class="header-text">
            <h2>Usuarios del proyecto</h2>
            <p>Gestiona los usuarios y roles asignados a la metodología del proyecto activo.</p>
          </div>
        </div>

        <!-- COMPONENTE DE ENCABEZADO -->
        <HeaderStatsCard 
          :nombreProyecto="nombreProyectoActivo"
          :metodologia="metodologiaProyecto"
          :totalCount="usuarios.length"
        />
      </div>

      <!-- FILA INFERIOR: BOTÓN DE REGRESAR -->
      <div class="back-container">
        <RouterLink to="/portal/usuarios" class="back-button">
          <ArrowLeft :size="16" class="back-icon" />
          Volver a usuarios
        </RouterLink>
      </div>

    </div>

    <!-- SIN PERMISO -->
    <div v-if="!canWrite" class="notice-card">
      <h2>Sin permiso de escritura</h2>
      <p>No tienes permiso para registrar o editar usuarios.</p>
    </div>

    <!-- NO ENCONTRADO -->
    <div v-else-if="noEncontrado" class="notice-card">
      <h2>Usuario no encontrado</h2>
      <p>El usuario que intentas editar no existe.</p>
    </div>

    <!-- FORMULARIO -->
    <form v-else class="form-card" novalidate @submit.prevent="handleSubmit">

      <div class="form-header">
        <h1>{{ esEdicion ? 'Editar usuario' : 'Nuevo usuario' }}</h1>
        <p>
          {{
            esEdicion
              ? 'Modifica la información y accesos del usuario dentro del proyecto.'
              : 'Completa los datos para registrar un usuario nuevo en el proyecto activo.'
          }}
        </p>
      </div>

      <div class="form-grid">

        <!-- 1. CORREO ELECTRÓNICO -->
        <div class="field field-span-2">
          <label for="email">Correo electrónico</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="ejemplo@dominio.com"
            :class="{ invalid: errors.email }"
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="field-empty"></div>

        <!-- 2. NOMBRE -->
        <div class="field">
          <label for="nombre">Nombre</label>
          <input
            id="nombre"
            v-model="form.nombre"
            type="text"
            placeholder="Nombre(s)"
            :class="{ invalid: errors.nombre }"
          />
          <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
        </div>

        <!-- 3. APELLIDO PATERNO -->
        <div class="field">
          <label for="apellidoPaterno">Apellido paterno</label>
          <input
            id="apellidoPaterno"
            v-model="form.apellidoPaterno"
            type="text"
            placeholder="Primer apellido"
            :class="{ invalid: errors.apellidoPaterno }"
          />
          <span v-if="errors.apellidoPaterno" class="error-text">{{ errors.apellidoPaterno }}</span>
        </div>

        <!-- 4. APELLIDO MATERNO -->
        <div class="field">
          <label for="apellidoMaterno">Apellido materno</label>
          <input
            id="apellidoMaterno"
            v-model="form.apellidoMaterno"
            type="text"
            placeholder="Segundo apellido (opcional)"
          />
        </div>

        <!-- SECCIÓN: ROL DE LA METODOLOGÍA DEL PROYECTO ACTIVO -->
        <div class="section-divider field-full">
          <h3>Asignación de rol (Metodología: {{ metodologiaProyecto }})</h3>
        </div>

        <!-- 5. ROL SEGÚN LA METODOLOGÍA DEL PROYECTO -->
        <div class="field field-span-2">
          <label for="rolMetodologia">Rol del usuario</label>
          <select
            id="rolMetodologia"
            v-model="form.rolMetodologia"
            :class="{ invalid: errors.rolMetodologia }"
          >
            <option value="" disabled>Selecciona un rol para {{ metodologiaProyecto }}</option>
            <option v-for="rol in rolesDisponibles" :key="rol" :value="rol">{{ rol }}</option>
          </select>
          <span v-if="errors.rolMetodologia" class="error-text">{{ errors.rolMetodologia }}</span>
          <span class="hint">
            Los roles mostrados son los definidos para la metodología <strong>{{ metodologiaProyecto }}</strong> del proyecto activo.
          </span>
        </div>

        <!-- SECCIÓN: CONFIGURACIÓN DE ESTADO Y ACCESO -->
        <div class="section-divider field-full">
          <h3>Estado del registro</h3>
        </div>

        <!-- 6. CHECKBOX PARA ACTIVAR EN AUTOMÁTICO -->
        <div class="field field-full checkbox-field">
          <label class="checkbox-container">
            <input
              type="checkbox"
              v-model="form.activo"
            />
            <span class="checkmark"></span>
            <span class="checkbox-label">
              Activar usuario automáticamente al guardar
            </span>
          </label>
          <span class="hint">
            Si está marcado, el usuario quedará en estado <strong>Activo</strong> de inmediato. Desmárcalo si deseas dejarlo <strong>Inactivo</strong>.
          </span>
        </div>

      </div>

      <!-- BOTONES DE ACCIÓN -->
      <div class="form-actions">
        <button type="button" class="cancel-btn" @click="handleCancel">
          <X :size="18" class="btn-icon" />
          <span>Cancelar</span>
        </button>
  
        <button type="submit" class="submit-btn" :disabled="isSaving">
          <Check :size="18" class="btn-icon" />
          <span>{{ esEdicion ? 'Guardar cambios' : 'Registrar usuario' }}</span>
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.usuario-form {
  width: 100%;
  color: #5F0032;
  text-align: left;
}

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
  background: #FBEAF9;
  border: 1px solid #F0CBEC;
  color: #5F0032;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s ease;
  white-space: nowrap;
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

/* ENCABEZADO DEL FORMULARIO */
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

.field-empty {
  grid-column: span 1;
}

.field label {
  margin-bottom: 6px;
  color: #555151;
  font-size: 13px;
  font-weight: 500;
}

.field input[type="text"],
.field input[type="email"],
.field select {
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

.field input:focus,
.field select:focus {
  border-bottom-color: #D46D25;
}

.field .invalid {
  border-bottom-color: #D46D25;
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

/* ESTILOS DEL CHECKBOX CUSTOM */
.checkbox-field {
  margin-top: 6px;
}

.checkbox-container {
  display: inline-flex;
  align-items: center;
  position: relative;
  padding-left: 32px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #ffffff;
  border: 2px solid #5F0032;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #FBEAF9;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #5F0032;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
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

  .field-empty {
    display: none;
  }
}

@media (max-width: 700px) {
  .header-main-row {
    flex-direction: column;
    align-items: flex-start;
  }

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
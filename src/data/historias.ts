import { ref } from 'vue'

/* =========================================================================
 * INTERFACES SIMPLES
 * Definimos la forma clara de los datos sin tipos avanzados de TS.
 * ========================================================================= */
export interface Requerimiento {
  id: number
  nombre: string
  descripcion: string
}

export interface HistoriaUsuario {
  id: number
  proyectoId: number
  nombreHistoria: string
  fechaCaptura: string
  fechaCapturaIso: string
  capturadoPor: string
  usuarioEmail: string
  quiero: string
  para: string
  requerimientos: Requerimiento[]
}

/* =========================================================================
 * DATOS GLOBALES EN MEMORIA
 * Arreglo reactivo con historias iniciales de prueba para probar la app.
 * ========================================================================= */
export const historias = ref<HistoriaUsuario[]>([
  {
    id: 1,
    proyectoId: 1,
    nombreHistoria: 'Inicio de Sesión y Autenticación',
    fechaCaptura: '01/11/2026',
    fechaCapturaIso: '2026-11-01',
    capturadoPor: 'Juan Pérez',
    usuarioEmail: 'juan.perez@ejemplo.com',
    quiero: 'iniciar sesión en la plataforma usando mi correo y contraseña',
    para: 'acceder de forma segura a mis proyectos asignados.',
    requerimientos: [
      { id: 101, nombre: 'Validación de Credenciales', descripcion: 'El sistema debe verificar correo y contraseña contra la base de datos.' },
      { id: 102, nombre: 'Manejo de Intentos Fallidos', descripcion: 'Bloquear cuenta temporalmente tras 5 intentos fallidos.' }
    ]
  },
  {
    id: 2,
    proyectoId: 1,
    nombreHistoria: 'Registro de Horarios y Cubículos',
    fechaCaptura: '03/11/2026',
    fechaCapturaIso: '2026-11-03',
    capturadoPor: 'María López',
    usuarioEmail: 'maria.lopez@ejemplo.com',
    quiero: 'seleccionar un cubículo disponible y un rango de horario',
    para: 'reservar un espacio de estudio en la biblioteca.',
    requerimientos: [
      { id: 103, nombre: 'Disponibilidad en tiempo real', descripcion: 'Mostrar en color verde los cubículos libres.' }
    ]
  }
])

/* =========================================================================
 * FUNCIONES AUXILIARES PARA FECHAS
 * ========================================================================= */

// Devuelve la fecha actual en formato legible "DD/MM/YYYY"
export function fechaHoy(): string {
  const hoy = new Date()
  const dia = String(hoy.getDate()).padStart(2, '0')
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const anio = hoy.getFullYear()
  return dia + '/' + mes + '/' + anio
}

// Devuelve la fecha actual en formato "YYYY-MM-DD" para guardar
export function fechaHoyIso(): string {
  const hoy = new Date()
  const dia = String(hoy.getDate()).padStart(2, '0')
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const anio = hoy.getFullYear()
  return anio + '-' + mes + '-' + dia
}

/* =========================================================================
 * OPERACIONES DEL CRUD SIMPLIFICADO
 * ========================================================================= */

// Buscar y retornar una historia mediante su ID
export function obtenerHistoria(id: number): HistoriaUsuario | null {
  for (let i = 0; i < historias.value.length; i++) {
    if (historias.value[i].id === id) {
      return historias.value[i]
    }
  }
  return null
}

// Agregar una historia nueva generando un ID numérico automático
export function agregarHistoria(nuevaHistoria: HistoriaUsuario) {
  let mayorId = 0
  for (let i = 0; i < historias.value.length; i++) {
    if (historias.value[i].id > mayorId) {
      mayorId = historias.value[i].id
    }
  }
  nuevaHistoria.id = mayorId + 1
  historias.value.push(nuevaHistoria)
}

// Actualizar los datos de una historia existente
export function actualizarHistoria(id: number, datosActualizados: HistoriaUsuario) {
  for (let i = 0; i < historias.value.length; i++) {
    if (historias.value[i].id === id) {
      historias.value[i].nombreHistoria = datosActualizados.nombreHistoria
      historias.value[i].capturadoPor = datosActualizados.capturadoPor
      historias.value[i].usuarioEmail = datosActualizados.usuarioEmail
      historias.value[i].quiero = datosActualizados.quiero
      historias.value[i].para = datosActualizados.para
      historias.value[i].requerimientos = datosActualizados.requerimientos
      break
    }
  }
}

// Eliminar una historia buscando su posición en el arreglo
export function eliminarHistoria(id: number) {
  const indice = historias.value.findIndex(h => h.id === id)
  if (indice !== -1) {
    historias.value.splice(indice, 1)
  }
}
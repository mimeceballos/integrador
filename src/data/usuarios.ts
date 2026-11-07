import { ref } from 'vue'

// Definición de la estructura de un Usuario
export interface Usuario {
  id: number
  email: string
  nombreCompleto: string
  metodologia: string
  rolMetodologia: string
  activo: boolean
}

/* =========================================================================
 * LISTA GLOBAL REACTIVA DE USUARIOS
 * ========================================================================= */
export const usuarios = ref<Usuario[]>([
  {
    id: 1,
    email: 'cliente.finanzas@ejemplo.com',
    nombreCompleto: 'Carlos Mendoza',
    metodologia: 'XP (Extreme Programming)',
    rolMetodologia: 'Cliente (Customer)',
    activo: true
  },
  {
    id: 2,
    email: 'dev.lead@ejemplo.com',
    nombreCompleto: 'Ana Martínez',
    metodologia: 'XP (Extreme Programming)',
    rolMetodologia: 'Programador (Developer)',
    activo: true
  },
  {
    id: 3,
    email: 'tester.qa@ejemplo.com',
    nombreCompleto: 'Luis Gómez',
    metodologia: 'XP (Extreme Programming)',
    rolMetodologia: 'Probador (Tester)',
    activo: true
  },
  {
    id: 4,
    email: 'tracker.xp@ejemplo.com',
    nombreCompleto: 'Sofía López',
    metodologia: 'XP (Extreme Programming)',
    rolMetodologia: 'Encargado de Seguimiento (Tracker)',
    activo: false
  }
])

/* =========================================================================
 * FUNCIONES AUXILIARES (CRUD EN MEMORIA - CÓDIGO SIMPLE)
 * ========================================================================= */

// 1. Obtener usuario usando un bucle 'for' tradicional
export function obtenerUsuario(id: number): Usuario | undefined {
  for (let i = 0; i < usuarios.value.length; i++) {
    if (usuarios.value[i].id === id) {
      return usuarios.value[i]
    }
  }
  return undefined
}

// 2. Agregar usuario asignando cada propiedad una por una y calculando el ID con un for
export function agregarUsuario(nuevo: Omit<Usuario, 'id'>) {
  // Calculamos el ID más alto recorriendo la lista manualmente
  let idMayor = 0
  for (let i = 0; i < usuarios.value.length; i++) {
    if (usuarios.value[i].id > idMayor) {
      idMayor = usuarios.value[i].id
    }
  }

  const nuevoId = idMayor + 1

  // Creamos el objetoUsuario asignando campo por campo
  const usuarioParaGuardar: Usuario = {
    id: nuevoId,
    email: nuevo.email,
    nombreCompleto: nuevo.nombreCompleto,
    metodologia: nuevo.metodologia,
    rolMetodologia: nuevo.rolMetodologia,
    activo: nuevo.activo
  }

  // Lo agregamos al arreglo
  usuarios.value.push(usuarioParaGuardar)
}

// 3. Actualizar usuario modificando sus propiedades directamente
export function actualizarUsuario(id: number, datosActualizados: Partial<Omit<Usuario, 'id'>>) {
  const usuarioEncontrado = obtenerUsuario(id)

  if (usuarioEncontrado) {
    // Si viene el dato en el parámetro, actualizamos la propiedad individualmente
    if (datosActualizados.email !== undefined) {
      usuarioEncontrado.email = datosActualizados.email
    }
    if (datosActualizados.nombreCompleto !== undefined) {
      usuarioEncontrado.nombreCompleto = datosActualizados.nombreCompleto
    }
    if (datosActualizados.metodologia !== undefined) {
      usuarioEncontrado.metodologia = datosActualizados.metodologia
    }
    if (datosActualizados.rolMetodologia !== undefined) {
      usuarioEncontrado.rolMetodologia = datosActualizados.rolMetodologia
    }
    if (datosActualizados.activo !== undefined) {
      usuarioEncontrado.activo = datosActualizados.activo
    }
  }
}
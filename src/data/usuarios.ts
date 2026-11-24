import { ref } from 'vue'

export type PermissionCode = 1 | 2 | 3

export interface UserPermissions {
  sistemas: PermissionCode
  usuarios: PermissionCode
  roles: PermissionCode
  historias: PermissionCode
}

export interface Usuario {
  id: number
  email: string
  password: string
  nombreCompleto: string
  roleName: string
  metodologia: string
  rolMetodologia: string
  activo: boolean
  requiereCambioPassword: boolean
  permissions: UserPermissions
  // Proyecto (sistema) al que pertenece el usuario.
  // null = no está atado a un proyecto (caso del Administrador, que aparece en todos).
  proyectoId: number | null
}

export const usuarios = ref<Usuario[]>([
  {
    id: 1,
    email: 'administrador1@gmail.com',
    password: 'Admin123',
    nombreCompleto: 'Alejandro Góngora',
    roleName: 'Administrador',
    metodologia: 'XP (Extreme Programming)',
    rolMetodologia: 'Cliente (Customer)',
    activo: true,
    requiereCambioPassword: false,
    permissions: { sistemas: 3, usuarios: 3, roles: 3, historias: 3 },
    proyectoId: null // Administrador: aparece en TODOS los proyectos
  },
  {
    id: 2,
    email: 'usr_sistema@gmail.com',
    password: 'sistema123',
    nombreCompleto: 'Juan Perez',
    roleName: 'Usuario del Sistema',
    metodologia: 'XP (Extreme Programming)',
    rolMetodologia: 'Programador (Developer)',
    activo: true,
    requiereCambioPassword: false,
    permissions: { sistemas: 3, usuarios: 2, roles: 1, historias: 2 },
    proyectoId: 1 // Solo aparece en el proyecto #1
  },
  {
    id: 3,
    email: 'externo@gmail.com',
    password: 'externo123',
    nombreCompleto: 'María Perez',
    roleName: 'Externo',
    metodologia: 'XP (Extreme Programming)',
    rolMetodologia: 'Probador (Tester)',
    activo: true,
    requiereCambioPassword: false,
    permissions: { sistemas: 2, usuarios: 2, roles: 1, historias: 1 },
    proyectoId: 2 // Solo aparece en el proyecto #2
  }
])

// Devuelve los usuarios que pertenecen a un proyecto:
// el Administrador (siempre) + los usuarios dados de alta en ese proyecto.
export function usuariosDelProyecto(proyectoId: number | null): Usuario[] {
  return usuarios.value.filter(
    u => u.roleName === 'Administrador' || (proyectoId !== null && u.proyectoId === proyectoId)
  )
}

function obtenerPermisosPorRol(roleName: string): UserPermissions {
  if (roleName === 'Administrador') {
    return { sistemas: 3, usuarios: 3, roles: 3, historias: 3 }
  }
  if (roleName === 'Externo') {
    return { sistemas: 2, usuarios: 2, roles: 1, historias: 1 }
  }
  return { sistemas: 3, usuarios: 2, roles: 1, historias: 2 }
}

export function obtenerUsuario(id: number): Usuario | undefined {
  for (let i = 0; i < usuarios.value.length; i++) {
    if (usuarios.value[i].id === id) {
      return usuarios.value[i]
    }
  }
  return undefined
}

export function obtenerUsuarioPorEmail(email: string): Usuario | undefined {
  const emailLimpio = email.trim().toLowerCase()
  for (let i = 0; i < usuarios.value.length; i++) {
    if (usuarios.value[i].email.toLowerCase() === emailLimpio) {
      return usuarios.value[i]
    }
  }
  return undefined
}

// usuario nuevo nace con contraseña 'usr123' y bandera en true
export function agregarUsuario(nuevo: {
  email: string
  nombreCompleto: string
  metodologia: string
  rolMetodologia: string
  activo: boolean
  password?: string
  roleName?: string
  permissions?: UserPermissions
  proyectoId?: number | null
}) {
  let idMayor = 0
  for (let i = 0; i < usuarios.value.length; i++) {
    if (usuarios.value[i].id > idMayor) {
      idMayor = usuarios.value[i].id
    }
  }

  const rolAsignado = nuevo.roleName || 'Usuario del Sistema'

  const usuarioParaGuardar: Usuario = {
    id: idMayor + 1,
    email: nuevo.email.trim(),
    password: nuevo.password || 'usr123', // Contraseña temporal por defecto
    nombreCompleto: nuevo.nombreCompleto.trim(),
    roleName: rolAsignado,
    metodologia: nuevo.metodologia,
    rolMetodologia: nuevo.rolMetodologia,
    activo: nuevo.activo,
    requiereCambioPassword: true, // <-- Obliga a cambiarla en el primer login
    permissions: nuevo.permissions || obtenerPermisosPorRol(rolAsignado),
    proyectoId: nuevo.proyectoId ?? null // proyecto donde se dio de alta
  }

  usuarios.value.push(usuarioParaGuardar)
}

// actualizar la contraseña en el primer inicio de sesión
export function cambiarPasswordUsuario(email: string, nuevaPassword: string): boolean {
  const usuario = obtenerUsuarioPorEmail(email)
  if (!usuario) return false

  usuario.password = nuevaPassword
  usuario.requiereCambioPassword = false
  return true
}

export function actualizarUsuario(id: number, datosActualizados: Partial<Omit<Usuario, 'id'>>) {
  const usuarioEncontrado = obtenerUsuario(id)

  if (usuarioEncontrado) {
    if (datosActualizados.email !== undefined) usuarioEncontrado.email = datosActualizados.email
    if (datosActualizados.password !== undefined) usuarioEncontrado.password = datosActualizados.password
    if (datosActualizados.nombreCompleto !== undefined) usuarioEncontrado.nombreCompleto = datosActualizados.nombreCompleto
    if (datosActualizados.roleName !== undefined) {
      usuarioEncontrado.roleName = datosActualizados.roleName
      if (!datosActualizados.permissions) {
        usuarioEncontrado.permissions = obtenerPermisosPorRol(datosActualizados.roleName)
      }
    }
    if (datosActualizados.metodologia !== undefined) usuarioEncontrado.metodologia = datosActualizados.metodologia
    if (datosActualizados.rolMetodologia !== undefined) usuarioEncontrado.rolMetodologia = datosActualizados.rolMetodologia
    if (datosActualizados.activo !== undefined) usuarioEncontrado.activo = datosActualizados.activo
    if (datosActualizados.requiereCambioPassword !== undefined) {
      usuarioEncontrado.requiereCambioPassword = datosActualizados.requiereCambioPassword
    }
    if (datosActualizados.permissions !== undefined) usuarioEncontrado.permissions = datosActualizados.permissions
  }
}
import { ref } from 'vue'

/* =========================================================================
 * ESTRUCTURAS DE DATOS (INTERFACES)
 * Aquí definimos los tipos de datos para que TypeScript no nos marque error.
 * ========================================================================= */

export interface InventarioItem {
  nombre: string
  cantidad: number
  categoria: string
  estado: string
}

export interface Empleado {
  nombre: string
  puesto: string
  departamento: string
  participacion: string
}

// Representa la estructura de cada Sistema o Proyecto registrado
export interface Sistema {
  id: number
  nombre: string
  descripcion: string
  estado: string
  responsable: string
  metodologia: string
  fechaInicio: string
  fechaFin: string
  departamento: string
  objetivo: string
  presupuesto: number
  fechaCreacion: string
  fechaActualizacion: string
  inventario: InventarioItem[]
  empleados: Empleado[]

  // Agregamos esta propiedad opcional para saber qué opciones del Navbar habilita este proyecto.
  // Ejemplo: ['usuarios', 'historias']
  opcionesNavbar?: string[]
}

/* =========================================================================
 * FUENTE DE DATOS REACTIVA (MOCK TEMPORAL)
 * Usamos ref([]) para que los cambios se reflejen automáticamente en las vistas.
 * ========================================================================= */

export const sistemas = ref<Sistema[]>([
  {
    id: 1,
    nombre: 'Sistema de Recursos Humanos',
    descripcion: 'Gestión y administración de información de empleados.',
    estado: 'Activo',
    responsable: 'Laura Méndez',
    metodologia: 'Scrum',
    fechaInicio: '15/08/2026',
    fechaFin: '15/12/2026',
    departamento: 'Recursos Humanos',
    objetivo: 'Centralizar la información de los empleados.',
    presupuesto: 150000,
    fechaCreacion: '15/08/2026',
    fechaActualizacion: '20/09/2026',
    // Este proyecto solo permite ver "Usuarios" e "Historias" en el Navbar
    opcionesNavbar: ['usuarios', 'roles', 'historias'],
    inventario: [
      { nombre: 'Computadoras de escritorio', cantidad: 12, categoria: 'Equipo de cómputo', estado: 'Disponible' }
    ],
    empleados: [
      { nombre: 'Laura Méndez', puesto: 'Jefa de RRHH', departamento: 'Recursos Humanos', participacion: 'Responsable' }
    ]
  },
  {
    id: 2,
    nombre: 'Sistema de Inventarios',
    descripcion: 'Control de productos, existencias y movimientos.',
    estado: 'Desarrollo',
    responsable: 'Carlos Ramírez',
    metodologia: 'Kanban',
    fechaInicio: '01/09/2026',
    fechaFin: '30/11/2026',
    departamento: 'Almacén',
    objetivo: 'Mejorar el control de productos.',
    presupuesto: 95000,
    fechaCreacion: '01/09/2026',
    fechaActualizacion: '22/09/2026',
    // Este proyecto permite ver "Usuarios", "Roles" e "Historias" (Todo activo)
    opcionesNavbar: ['usuarios', 'roles', 'historias'],
    inventario: [
      { nombre: 'Lectores de código de barras', cantidad: 8, categoria: 'Equipo', estado: 'Disponible' }
    ],
    empleados: [
      { nombre: 'Carlos Ramírez', puesto: 'Jefe de Almacén', departamento: 'Almacén', participacion: 'Responsable' }
    ]
  },
  {
    id: 3,
    nombre: 'Sistema de Ventas',
    descripcion: 'Administración de ventas y seguimiento de clientes.',
    estado: 'Activo',
    responsable: 'Sofía Hernández',
    metodologia: 'Cascada',
    fechaInicio: '10/07/2026',
    fechaFin: '10/10/2026',
    departamento: 'Ventas',
    objetivo: 'Registrar las operaciones comerciales.',
    presupuesto: 210000,
    fechaCreacion: '10/07/2026',
    fechaActualizacion: '18/09/2026',
    // Este proyecto solo habilita "Roles" e "Historias"
    opcionesNavbar: ['usuarios', 'roles', 'historias'],
    inventario: [],
    empleados: []
  },
  {
    id: 4,
    nombre: 'Sistema de Atención al Cliente',
    descripcion: 'Registro y seguimiento de solicitudes de clientes.',
    estado: 'Desarrollo',
    responsable: 'Miguel Torres',
    metodologia: 'Scrum',
    fechaInicio: '05/08/2026',
    fechaFin: '05/01/2027',
    departamento: 'Atención al Cliente',
    objetivo: 'Centralizar las solicitudes de los clientes.',
    presupuesto: 120000,
    fechaCreacion: '05/08/2026',
    fechaActualizacion: '21/09/2026',
    opcionesNavbar: ['usuarios', 'roles', 'historias'],
    inventario: [],
    empleados: []
  }
])

/* =========================================================================
 * FUNCIONES AUXILIARES DE FECHAS
 * ========================================================================= */

export function fechaHoy(): string {
  const hoy = new Date()
  const dd = String(hoy.getDate()).padStart(2, '0')
  const mm = String(hoy.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${hoy.getFullYear()}`
}

export function isoAFecha(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function fechaAIso(fecha: string): string {
  if (!fecha) return ''
  const [d, m, y] = fecha.split('/')
  return `${y}-${m}-${d}`
}

/* =========================================================================
 * FUNCIONES CRUD DENTRO DEL REPOSITORIO
 * ========================================================================= */

function generarNuevoId(): number {
  if (sistemas.value.length === 0) return 1
  return Math.max(...sistemas.value.map(s => s.id)) + 1
}

export function agregarSistema(
  datos: Omit<Sistema, 'id' | 'fechaCreacion' | 'fechaActualizacion'>
): Sistema {
  const nuevoSistema: Sistema = {
    id: generarNuevoId(),
    ...datos,
    fechaCreacion: fechaHoy(),
    fechaActualizacion: fechaHoy()
  }
  sistemas.value.push(nuevoSistema)
  return nuevoSistema
}

export function actualizarSistema(
  id: number,
  datos: Partial<Omit<Sistema, 'id'>>
): Sistema | undefined {
  const indice = sistemas.value.findIndex(s => s.id === id)
  if (indice === -1) return undefined

  sistemas.value[indice] = {
    ...sistemas.value[indice],
    ...datos,
    fechaActualizacion: fechaHoy()
  }
  return sistemas.value[indice]
}

export function eliminarSistema(id: number): boolean {
  const indice = sistemas.value.findIndex(s => s.id === id)
  if (indice === -1) return false
  sistemas.value.splice(indice, 1)
  return true
}

export function obtenerSistema(id: number): Sistema | undefined {
  return sistemas.value.find(s => s.id === id)
}
import { ref } from 'vue'

/* =========================================
 * TIPOS
 * ========================================= */

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

export interface Sistema {
  id: number
  nombre: string
  descripcion: string
  estado: string
  responsable: string

  departamento: string
  objetivo: string
  presupuesto: number

  fechaCreacion: string
  fechaActualizacion: string

  inventario: InventarioItem[]
  empleados: Empleado[]
}

/* =========================================
 * DATOS TEMPORALES COMPARTIDOS
 * ========================================= */

/*
 * Esta es la fuente temporal de datos del módulo Sistemas.
 *
 * Los componentes:
 *
 * - SistemaLista.vue
 * - SistemaDetalle.vue
 * - SistemaForm.vue
 *
 * trabajan sobre este mismo arreglo.
 *
 * Más adelante esta fuente podrá sustituirse
 * por una API/backend sin tener que cambiar
 * la estructura visual de los componentes.
 */

export const sistemas = ref<Sistema[]>([
  {
    id: 1,

    nombre: 'Sistema de Recursos Humanos',

    descripcion:
      'Gestión y administración de información de empleados.',

    estado: 'Activo',

    responsable: 'Laura Méndez',

    departamento: 'Recursos Humanos',

    objetivo:
      'Centralizar la información de los empleados y facilitar la administración de procesos relacionados con el personal.',

    presupuesto: 150000,

    fechaCreacion: '15/08/2026',

    fechaActualizacion: '20/09/2026',

    inventario: [
      {
        nombre: 'Computadoras de escritorio',
        cantidad: 12,
        categoria: 'Equipo de cómputo',
        estado: 'Disponible'
      },
      {
        nombre: 'Laptops',
        cantidad: 5,
        categoria: 'Equipo de cómputo',
        estado: 'Disponible'
      },
      {
        nombre: 'Impresoras',
        cantidad: 3,
        categoria: 'Periféricos',
        estado: 'En uso'
      }
    ],

    empleados: [
      {
        nombre: 'Laura Méndez',
        puesto: 'Jefa de Recursos Humanos',
        departamento: 'Recursos Humanos',
        participacion: 'Responsable del proyecto'
      },
      {
        nombre: 'Daniel Ortega',
        puesto: 'Analista de Recursos Humanos',
        departamento: 'Recursos Humanos',
        participacion: 'Análisis y pruebas'
      },
      {
        nombre: 'Andrea Castillo',
        puesto: 'Desarrolladora',
        departamento: 'Tecnologías de la Información',
        participacion: 'Desarrollo del sistema'
      }
    ]
  },

  {
    id: 2,

    nombre: 'Sistema de Inventarios',

    descripcion:
      'Control de productos, existencias y movimientos.',

    estado: 'En desarrollo',

    responsable: 'Carlos Ramírez',

    departamento: 'Almacén',

    objetivo:
      'Mejorar el control de productos y mantener actualizada la información de existencias de la empresa.',

    presupuesto: 95000,

    fechaCreacion: '01/09/2026',

    fechaActualizacion: '22/09/2026',

    inventario: [
      {
        nombre: 'Lectores de código de barras',
        cantidad: 8,
        categoria: 'Equipo',
        estado: 'Disponible'
      },
      {
        nombre: 'Terminales de almacén',
        cantidad: 6,
        categoria: 'Equipo de cómputo',
        estado: 'En uso'
      },
      {
        nombre: 'Impresoras térmicas',
        cantidad: 4,
        categoria: 'Periféricos',
        estado: 'Disponible'
      },
      {
        nombre: 'Servidores',
        cantidad: 2,
        categoria: 'Infraestructura',
        estado: 'En uso'
      }
    ],

    empleados: [
      {
        nombre: 'Carlos Ramírez',
        puesto: 'Jefe de Almacén',
        departamento: 'Almacén',
        participacion: 'Responsable del proyecto'
      },
      {
        nombre: 'Fernando López',
        puesto: 'Encargado de Inventario',
        departamento: 'Almacén',
        participacion: 'Operación y pruebas'
      },
      {
        nombre: 'Mariana Torres',
        puesto: 'Ingeniera de Software',
        departamento: 'Tecnologías de la Información',
        participacion: 'Desarrollo del sistema'
      }
    ]
  },

  {
    id: 3,

    nombre: 'Sistema de Ventas',

    descripcion:
      'Administración de ventas y seguimiento de clientes.',

    estado: 'Activo',

    responsable: 'Sofía Hernández',

    departamento: 'Ventas',

    objetivo:
      'Registrar las operaciones comerciales y facilitar el seguimiento de clientes y ventas realizadas.',

    presupuesto: 210000,

    fechaCreacion: '10/07/2026',

    fechaActualizacion: '18/09/2026',

    inventario: [
      {
        nombre: 'Terminales de venta',
        cantidad: 10,
        categoria: 'Equipo',
        estado: 'En uso'
      },
      {
        nombre: 'Tabletas',
        cantidad: 8,
        categoria: 'Equipo móvil',
        estado: 'Disponible'
      },
      {
        nombre: 'Impresoras de tickets',
        cantidad: 10,
        categoria: 'Periféricos',
        estado: 'En uso'
      }
    ],

    empleados: [
      {
        nombre: 'Sofía Hernández',
        puesto: 'Gerente de Ventas',
        departamento: 'Ventas',
        participacion: 'Responsable del proyecto'
      },
      {
        nombre: 'Ricardo Gómez',
        puesto: 'Supervisor de Ventas',
        departamento: 'Ventas',
        participacion: 'Pruebas y validación'
      },
      {
        nombre: 'Paola Vargas',
        puesto: 'Analista de Sistemas',
        departamento: 'Tecnologías de la Información',
        participacion: 'Desarrollo y soporte'
      }
    ]
  },

  {
    id: 4,

    nombre: 'Sistema de Atención al Cliente',

    descripcion:
      'Registro y seguimiento de solicitudes de clientes.',

    estado: 'En desarrollo',

    responsable: 'Miguel Torres',

    departamento: 'Atención al Cliente',

    objetivo:
      'Centralizar las solicitudes de los clientes y mejorar el seguimiento de los casos reportados.',

    presupuesto: 120000,

    fechaCreacion: '05/08/2026',

    fechaActualizacion: '21/09/2026',

    inventario: [
      {
        nombre: 'Computadoras',
        cantidad: 15,
        categoria: 'Equipo de cómputo',
        estado: 'En uso'
      },
      {
        nombre: 'Auriculares',
        cantidad: 18,
        categoria: 'Periféricos',
        estado: 'Disponible'
      },
      {
        nombre: 'Teléfonos IP',
        cantidad: 12,
        categoria: 'Comunicación',
        estado: 'En uso'
      }
    ],

    empleados: [
      {
        nombre: 'Miguel Torres',
        puesto: 'Coordinador de Atención',
        departamento: 'Atención al Cliente',
        participacion: 'Responsable del proyecto'
      },
      {
        nombre: 'Gabriela Ruiz',
        puesto: 'Supervisora',
        departamento: 'Atención al Cliente',
        participacion: 'Análisis y pruebas'
      },
      {
        nombre: 'Jorge Navarro',
        puesto: 'Desarrollador',
        departamento: 'Tecnologías de la Información',
        participacion: 'Desarrollo del sistema'
      }
    ]
  }
])

/* =========================================
 * GENERAR NUEVO ID
 * ========================================= */

function generarNuevoId(): number {
  if (sistemas.value.length === 0) {
    return 1
  }

  return Math.max(
    ...sistemas.value.map(sistema => sistema.id)
  ) + 1
}

/* =========================================
 * AGREGAR SISTEMA
 * ========================================= */

export function agregarSistema(
  datos: Omit<Sistema, 'id'>
): Sistema {

  const nuevoSistema: Sistema = {
    id: generarNuevoId(),
    ...datos
  }

  sistemas.value.push(nuevoSistema)

  return nuevoSistema
}

/* =========================================
 * ACTUALIZAR SISTEMA
 * ========================================= */

export function actualizarSistema(
  id: number,
  datos: Partial<Omit<Sistema, 'id'>>
): Sistema | undefined {

  const indice = sistemas.value.findIndex(
    sistema => sistema.id === id
  )

  if (indice === -1) {
    return undefined
  }

  sistemas.value[indice] = {
    ...sistemas.value[indice],
    ...datos
  }

  return sistemas.value[indice]
}

/* =========================================
 * ELIMINAR SISTEMA
 * ========================================= */

export function eliminarSistema(
  id: number
): boolean {

  const indice = sistemas.value.findIndex(
    sistema => sistema.id === id
  )

  if (indice === -1) {
    return false
  }

  sistemas.value.splice(indice, 1)

  return true
}

/* =========================================
 * BUSCAR SISTEMA
 * ========================================= */

export function obtenerSistema(
  id: number
): Sistema | undefined {

  return sistemas.value.find(
    sistema => sistema.id === id
  )
}

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

import {
  sistemas
} from '../../data/sistemas'

const route = useRoute()

/* -----------------------------------------
 * ID DEL SISTEMA
 * ----------------------------------------- */

const sistemaId = computed(() => {
  return Number(route.params.id)
})

/* -----------------------------------------
 * SISTEMA SELECCIONADO
 * ----------------------------------------- */

/*
 * El sistema se obtiene directamente de la
 * fuente temporal compartida:
 *
 * src/data/sistemas.ts
 *
 * De esta manera:
 *
 * SistemaForm.vue
 *       ↓
 * sistemas.ts
 *       ↓
 * ┌───────────────┬────────────────────┐
 * │ SistemaLista  │ SistemaDetalle     │
 * └───────────────┴────────────────────┘
 *
 * Todos trabajan sobre los mismos datos.
 */

const sistema = computed(() => {
  return sistemas.value.find(
    item => item.id === sistemaId.value
  )
})

/* -----------------------------------------
 * FORMATO DE PRESUPUESTO
 * ----------------------------------------- */

function formatearPresupuesto(valor: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(valor)
}
</script>

<template>
  <section class="detalle-sistema">

    <!-- =====================================
         BOTÓN REGRESAR
         ===================================== -->

    <div class="back-container">

      <RouterLink
        to="/admin/sistemas"
        class="back-button"
      >
        <span class="back-icon">←</span>
        Volver a Sistemas
      </RouterLink>

    </div>

    <!-- =====================================
         SISTEMA NO ENCONTRADO
         ===================================== -->

    <div
      v-if="!sistema"
      class="not-found"
    >

      <div class="not-found-icon">
        ⚠
      </div>

      <h2>Sistema no encontrado</h2>

      <p>
        No existe un sistema registrado con el ID
        <strong>{{ sistemaId }}</strong>.
      </p>

      <RouterLink
        to="/admin/sistemas"
        class="return-button"
      >
        Regresar a Sistemas
      </RouterLink>

    </div>

    <!-- =====================================
         DETALLE DEL SISTEMA
         ===================================== -->

    <template v-else>

      <!-- ===================================
           ENCABEZADO
           =================================== -->

      <header class="detail-header">

        <div class="header-main">

          <div class="system-icon">
            ⚙
          </div>

          <div>

            <div class="system-id">
              Sistema #{{ sistema.id }}
            </div>

            <h1>
              {{ sistema.nombre }}
            </h1>

            <p>
              {{ sistema.descripcion }}
            </p>

          </div>

        </div>

        <span
          class="estado-badge"
          :class="{
            activo: sistema.estado === 'Activo',
            desarrollo: sistema.estado === 'En desarrollo',
            inactivo: sistema.estado === 'Inactivo'
          }"
        >
          {{ sistema.estado }}
        </span>

      </header>

      <!-- ===================================
           INFORMACIÓN GENERAL
           =================================== -->

      <section class="detail-section">

        <div class="section-title">

          <div class="section-icon">
            ℹ
          </div>

          <div>
            <h2>Información general</h2>

            <p>
              Datos principales del sistema.
            </p>
          </div>

        </div>

        <div class="general-grid">

          <!-- RESPONSABLE -->

          <div class="info-card">

            <span class="info-label">
              Responsable
            </span>

            <span class="info-value">
              {{ sistema.responsable }}
            </span>

          </div>

          <!-- DEPARTAMENTO -->

          <div class="info-card">

            <span class="info-label">
              Departamento
            </span>

            <span class="info-value">
              {{ sistema.departamento }}
            </span>

          </div>

          <!-- PRESUPUESTO -->

          <div class="info-card">

            <span class="info-label">
              Presupuesto
            </span>

            <span class="info-value budget">
              {{ formatearPresupuesto(sistema.presupuesto) }}
            </span>

          </div>

          <!-- FECHA CREACIÓN -->

          <div class="info-card">

            <span class="info-label">
              Fecha de creación
            </span>

            <span class="info-value">
              {{ sistema.fechaCreacion }}
            </span>

          </div>

          <!-- FECHA ACTUALIZACIÓN -->

          <div class="info-card">

            <span class="info-label">
              Última actualización
            </span>

            <span class="info-value">
              {{ sistema.fechaActualizacion }}
            </span>

          </div>

          <!-- ID -->

          <div class="info-card">

            <span class="info-label">
              Identificador
            </span>

            <span class="info-value">
              #{{ sistema.id }}
            </span>

          </div>

        </div>

      </section>

      <!-- ===================================
           OBJETIVO
           =================================== -->

      <section class="detail-section">

        <div class="section-title">

          <div class="section-icon">
            🎯
          </div>

          <div>

            <h2>
              Objetivo del sistema
            </h2>

            <p>
              Propósito principal del proyecto.
            </p>

          </div>

        </div>

        <div class="objective-card">
          {{ sistema.objetivo }}
        </div>

      </section>

      <!-- ===================================
           INVENTARIO
           =================================== -->

      <section class="detail-section">

        <div class="section-title">

          <div class="section-icon">
            📦
          </div>

          <div>

            <h2>
              Inventario
            </h2>

            <p>
              Recursos y equipo relacionados con el sistema.
            </p>

          </div>

        </div>

        <div class="table-container">

          <table class="detail-table">

            <thead>

              <tr>
                <th>Recurso</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Estado</th>
              </tr>

            </thead>

            <tbody>

              <tr
                v-for="(item, index) in sistema.inventario"
                :key="index"
              >

                <td class="resource-name">
                  {{ item.nombre }}
                </td>

                <td>
                  {{ item.categoria }}
                </td>

                <td>

                  <span class="quantity-badge">
                    {{ item.cantidad }}
                  </span>

                </td>

                <td>

                  <span
                    class="inventory-status"
                    :class="{
                      disponible: item.estado === 'Disponible',
                      uso: item.estado === 'En uso'
                    }"
                  >
                    {{ item.estado }}
                  </span>

                </td>

              </tr>

              <!-- SIN INVENTARIO -->

              <tr
                v-if="sistema.inventario.length === 0"
              >

                <td
                  colspan="4"
                  class="empty-table"
                >
                  No hay elementos de inventario registrados.
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </section>

      <!-- ===================================
           PERSONAL INVOLUCRADO
           =================================== -->

      <section class="detail-section">

        <div class="section-title">

          <div class="section-icon">
            👥
          </div>

          <div>

            <h2>
              Personal involucrado
            </h2>

            <p>
              Empleados relacionados con el desarrollo y operación.
            </p>

          </div>

        </div>

        <div class="employees-grid">

          <article
            v-for="(empleado, index) in sistema.empleados"
            :key="index"
            class="employee-card"
          >

            <div class="employee-avatar">
              {{ empleado.nombre.charAt(0) }}
            </div>

            <div class="employee-info">

              <h3>
                {{ empleado.nombre }}
              </h3>

              <span class="employee-position">
                {{ empleado.puesto }}
              </span>

              <span class="employee-department">
                {{ empleado.departamento }}
              </span>

              <span class="participation-badge">
                {{ empleado.participacion }}
              </span>

            </div>

          </article>

          <!-- SIN PERSONAL -->

          <div
            v-if="sistema.empleados.length === 0"
            class="empty-employees"
          >
            No hay personal registrado para este sistema.
          </div>

        </div>

      </section>

      <!-- ===================================
           PIE
           =================================== -->

      <div class="detail-footer">

        <span>
          Información temporal para desarrollo.
        </span>

        <RouterLink
          to="/admin/sistemas"
          class="footer-return"
        >
          ← Volver a la lista
        </RouterLink>

      </div>

    </template>

  </section>
</template>

<style scoped>

.detalle-sistema {
  width: 100%;
  color: #4d6787;
}

/* ==========================================
   BOTÓN REGRESAR
   ========================================== */

.back-container {
  margin-bottom: 18px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 13px;
  border-radius: 8px;
  background: #f6f3cf;
  border: 1px solid #f2eab4;
  color: #4d6787;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #fffde1;
  transform: translateX(-2px);
}

.back-icon {
  font-size: 16px;
}

/* ==========================================
   ENCABEZADO
   ========================================== */

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  margin-bottom: 18px;
  background: #fffde1;
  border: 1px solid #f2eab4;
  border-radius: 16px;
}

.header-main {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.system-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background: #cfebff;
  color: #4d6787;
  font-size: 22px;
}

.system-id {
  margin-bottom: 4px;
  color: #8a94a1;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.detail-header h1 {
  margin: 0 0 6px;
  color: #4d6787;
  font-size: 25px;
  font-weight: 800;
}

.detail-header p {
  max-width: 650px;
  margin: 0;
  color: #7d8794;
  font-size: 13px;
  line-height: 1.5;
}

/* ==========================================
   ESTADO
   ========================================== */

.estado-badge {
  display: inline-block;
  padding: 6px 11px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.estado-badge.activo {
  background: #d9efbd;
  color: #2d5a1e;
}

.estado-badge.desarrollo {
  background: #fef3c7;
  color: #92400e;
}

.estado-badge.inactivo {
  background: #fee2e2;
  color: #991b1b;
}

/* ==========================================
   SECCIONES
   ========================================== */

.detail-section {
  margin-bottom: 18px;
  padding: 22px;
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 18px;
}

.section-icon {
  width: 34px;
  height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 9px;
  background: #cfebff;
  font-size: 15px;
}

.section-title h2 {
  margin: 0 0 2px;
  color: #4d6787;
  font-size: 16px;
  font-weight: 800;
}

.section-title p {
  margin: 0;
  color: #8a94a1;
  font-size: 11px;
}

/* ==========================================
   INFORMACIÓN GENERAL
   ========================================== */

.general-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 13px;
  border-radius: 9px;
  background: #f8fafc;
  border: 1px solid #eef2f6;
}

.info-label {
  color: #8a94a1;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.info-value {
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.info-value.budget {
  color: #365d42;
}

/* ==========================================
   OBJETIVO
   ========================================== */

.objective-card {
  padding: 16px;
  border-left: 4px solid #cfebff;
  border-radius: 8px;
  background: #f8fafc;
  color: #526274;
  font-size: 13px;
  line-height: 1.7;
}

/* ==========================================
   TABLAS
   ========================================== */

.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #eef2f6;
  border-radius: 10px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table thead {
  background: #f6f3cf;
}

.detail-table th {
  padding: 11px 12px;
  color: #4d6787;
  text-align: left;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.detail-table td {
  padding: 12px;
  border-top: 1px solid #eef2f6;
  color: #596575;
  font-size: 12px;
}

.resource-name {
  color: #334155 !important;
  font-weight: 700;
}

.quantity-badge {
  display: inline-flex;
  min-width: 28px;
  justify-content: center;
  padding: 4px 7px;
  border-radius: 5px;
  background: #cfebff;
  color: #4d6787;
  font-weight: 800;
}

.inventory-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
}

.inventory-status.disponible {
  background: #d9efbd;
  color: #2d5a1e;
}

.inventory-status.uso {
  background: #fef3c7;
  color: #92400e;
}

.empty-table {
  padding: 25px !important;
  text-align: center;
  color: #8a94a1 !important;
}

/* ==========================================
   EMPLEADOS
   ========================================== */

.employees-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.employee-card {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 14px;
  border: 1px solid #eef2f6;
  border-radius: 10px;
  background: #fafafa;
}

.employee-avatar {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: #cfebff;
  color: #4d6787;
  font-size: 15px;
  font-weight: 800;
}

.employee-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.employee-info h3 {
  margin: 0 0 3px;
  color: #334155;
  font-size: 12px;
  font-weight: 800;
}

.employee-position {
  color: #526274;
  font-size: 11px;
  font-weight: 600;
}

.employee-department {
  margin-top: 2px;
  color: #8a94a1;
  font-size: 10px;
}

.participation-badge {
  align-self: flex-start;
  margin-top: 7px;
  padding: 3px 7px;
  border-radius: 5px;
  background: #fffde1;
  color: #7a7134;
  font-size: 9px;
  font-weight: 700;
}

.empty-employees {
  grid-column: 1 / -1;
  padding: 25px;
  border-radius: 10px;
  background: #f8fafc;
  color: #8a94a1;
  font-size: 12px;
  text-align: center;
}

/* ==========================================
   NO ENCONTRADO
   ========================================== */

.not-found {
  padding: 50px 20px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
}

.not-found-icon {
  margin-bottom: 10px;
  font-size: 32px;
}

.not-found h2 {
  margin: 0 0 7px;
  color: #4d6787;
  font-size: 19px;
}

.not-found p {
  margin: 0 0 18px;
  color: #7d8794;
  font-size: 13px;
}

.return-button {
  display: inline-block;
  padding: 9px 14px;
  border-radius: 8px;
  background: #cfebff;
  color: #4d6787;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
}

/* ==========================================
   PIE
   ========================================== */

.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 12px 4px 2px;
  color: #9aa3ad;
  font-size: 10px;
}

.footer-return {
  color: #4d6787;
  font-weight: 700;
  text-decoration: none;
}

.footer-return:hover {
  text-decoration: underline;
}

/* ==========================================
   RESPONSIVE
   ========================================== */

@media (max-width: 900px) {

  .general-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .employees-grid {
    grid-template-columns: 1fr;
  }

}

@media (max-width: 700px) {

  .detail-header {
    flex-direction: column;
  }

  .general-grid {
    grid-template-columns: 1fr;
  }

  .header-main {
    flex-direction: column;
  }

  .detail-header h1 {
    font-size: 21px;
  }

  .detail-footer {
    align-items: flex-start;
    flex-direction: column;
  }

}

</style>

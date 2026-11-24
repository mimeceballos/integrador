<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

import {
  sistemas
} from '../../data/sistemas'

const route = useRoute()


/* ID DEL SISTEMA */
const sistemaId = computed(() => {
  return Number(route.params.id)
})


/* SISTEMA SELECCIONADO */
/*
 * El sistema se obtiene directamente de la fuente temporal compartida:
 * src/data/sistemas.ts
 * De esta manera:
 * SistemaForm.vue
 *       ↓
 * sistemas.ts
 *       ↓
 * ┌───────────────┬────────────────────┐
 * │ SistemaLista  │ SistemaDetalle     │
 * └───────────────┴────────────────────┘
 * Todos trabajan sobre los mismos datos.
 */

const sistema = computed(() => {
  return sistemas.value.find(
    item => item.id === sistemaId.value
  )
})

</script>

<template>
  <section class="detalle-sistema">

    <!-- BOTON DE REGRESAR -->
    <div class="back-container">
      <RouterLink
        to="/portal/sistemas"
        class="back-button"
      >
        <span class="back-icon">←</span>
        Volver a Sistemas
      </RouterLink>
    </div>

    <!-- SISTEMA NO ENCONTRADO -->
    <div
      v-if="!sistema"
      class="not-found"
    >
      <div class="not-found-icon">
        <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
      </div>
      <h2>Sistema no encontrado</h2>

      <p>
        No existe un sistema registrado con el ID
        <strong>{{ sistemaId }}</strong>.
      </p>

      <RouterLink
        to="/portal/sistemas"
        class="return-button"
      >
        Regresar a Sistemas
      </RouterLink>

    </div>


    <!-- DETALLE DEL SISTEMA -->
    <template v-else>

      <!-- ENCABEZADO -->

      <header class="detail-header">
        <div class="header-main">
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

          <span
              class="estado-badge"
              :class="{
                activo: sistema.estado === 'Activo',
                desarrollo: sistema.estado === 'Desarrollo',
                inactivo: sistema.estado === 'Inactivo'
              }"
            >
              {{ sistema.estado }}
            </span>
          

        </div>

      </header>


      <!-- INFORMACION GENERAL -->
      <section class="detail-section">
        <div class="section-title">
          <div class="section-icon">
            <i class="fa fa-desktop menu-icon"></i>
          </div>
          <div>
            <h2>Información general</h2>
            <p>
              Datos principales del sistema.
            </p>
          </div>
        </div>

        <!-- RESPONSABLE -->
        <div class="general-grid">
          <div class="info-card">
            <span class="info-label">
              Responsable
            </span>
            <span class="info-value">
              {{ sistema.responsable }}
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

          <div class="info-card">
            <span class="info-label">Metodología</span>
            <span class="info-value">{{ sistema.metodologia }}</span>
          </div>
          <div class="info-card">
            <span class="info-label">Fecha de inicio</span>
            <span class="info-value">{{ sistema.fechaInicio }}</span>
          </div>
          <div class="info-card">
            <span class="info-label">Fecha de fin</span>
            <span class="info-value">{{ sistema.fechaFin }}</span>
          </div>



        </div>
      </section>


      <
    </template>
  </section>
</template>

<style scoped>

.detalle-sistema {
  width: 100%;
  color: #1e3a5f;
}


/* BOTON DE REGRESAR */
.back-container {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 18px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 13px;
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
  background: #f1f5fa;
  transform: translateX(-2px);
}

.back-icon {
  font-size: 16px;
}


/* ENCABEZADO  PRINCIPAL*/
.detail-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  margin-bottom: 18px;
  background: #dbe7f5;
  border: 1px solid #b9cfe8;
  border-radius: 16px;
}

.header-main {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.system-id {
  margin-bottom: 4px;
  color: #57595B;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.detail-header h1 {
  margin: 0 0 6px;
  color: #1e3a5f;
  font-size: 25px;
  font-weight: 800;
}

.detail-header p {
  max-width: 650px;
  margin: 0;
  color: #57595B;
  font-size: 13px;
  line-height: 1.5;
}


/* ESTADO DEL SISTEMA*/
.estado-badge {
  text-align: right;
  display: inline-block;
  padding: 6px 11px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 800;
}

.estado-badge.activo {
  background: #d1fae5;
  color: #065f46;
}

.estado-badge.desarrollo {
  background: #fef3c7;
  color: #92400e;
}

.estado-badge.inactivo {
  background: #fee2e2;
  color: #991b1b;
}


/* SECCIONES */
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
  background: #d1d0d0;
  font-size: 15px;
}

.section-title h2 {
  margin: 0 0 2px;
  color: #1e3a5f;
  font-size: 16px;
  font-weight: 800;
}

.section-title p {
  margin: 0;
  color: #8a94a1;
  font-size: 11px;
}


/* INFO GENERAL */
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





/* NO ENCONTRADO */
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
  color: #1e3a5f;
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
  background: #c9d8ea;
  color: #1e3a5f;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
}


/* PIE */
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
  color: #1e3a5f;
  font-weight: 700;
  text-decoration: none;
}

.footer-return:hover {
  text-decoration: underline;
}


/* RESPONSIVIDAD */
@media (max-width: 900px) {

  .general-grid {
    grid-template-columns: repeat(2, 1fr);
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

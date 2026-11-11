<script setup lang="ts">
defineProps<{
  nombreProyecto?: string
  metodologia?: string
  totalCount: number
  totalLabel?: string
}>()
</script>

<template>
  <div class="stats-group">
    <!-- 1. TARJETA PROYECTO ACTIVO -->
    <div class="stat-card" :class="{ 'sin-seleccion': !nombreProyecto || nombreProyecto === 'Ninguno' }">
      <span class="stat-label">Proyecto activo</span>
      <span class="stat-value proyecto-nombre">
        {{ nombreProyecto && nombreProyecto !== '' ? nombreProyecto : 'Ninguno' }}
      </span>
    </div>

    <!-- 2. TARJETA METODOLOGÍA (CUADRO INDEPENDIENTE) -->
    <div class="stat-card" :class="{ 'sin-seleccion': !nombreProyecto || nombreProyecto === 'Ninguno' }">
      <span class="stat-label">Metodología</span>
      <span class="stat-value metodologia-valor">
        {{ (nombreProyecto && nombreProyecto !== 'Ninguno') ? (metodologia || 'Sin especificar') : 'Ninguna' }}
      </span>
    </div>

    <!-- 3. TARJETA TOTAL -->
    <div class="stat-card total-card">
      <span class="stat-label">{{ totalLabel || 'Total' }}</span>
      <span class="stat-value total-number">{{ totalCount }}</span>
    </div>
  </div>
</template>

<style scoped>
.stats-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}

/* Tarjeta base con padding más compacto */
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6px 14px;
  min-height: 52px;
  background: #FBEAF9;
  border: 1px solid #F0CBEC;
  border-radius: 12px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.stat-card.sin-seleccion {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.stat-label {
  color: #7d8794;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.stat-value {
  color: #5F0032;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

.stat-card.sin-seleccion .stat-value {
  color: #94a3b8;
  font-style: italic;
  font-weight: 600;
}

/* Ajustes específicos */
.total-card {
  min-width: 58px;
}

.total-number {
  font-size: 18px;
  line-height: 1.1;
}

.metodologia-valor {
  font-weight: 700;
}
</style>
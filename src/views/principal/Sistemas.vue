<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function handleLogout(): void {
  router.push('/')
}
</script>

<template>
  <div class="admin-page">
    <h1>Sistemas</h1>
    <p class="status-text">En construcción</p>
    <button type="button" class="logout-btn" @click="handleLogout">
      Cerrar Sesión
    </button>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  color: #4D6787;
  font-family: inherit;
}

h1 {
  font-size: 32px;
  margin-bottom: 8px;
}

.status-text {
  font-size: 18px;
  font-weight: 600;
  color: #A5AF79;
  margin-bottom: 24px;
}

.logout-btn {
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #4D6787;
  background: #CFEBFF;
  border: none;
  border-radius: 999px;
  padding: 12px 24px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.logout-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>
<script setup lang="ts">

import { computed, inject } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import type { Ref } from 'vue'

type PermissionCode = 1 | 2 | 3

const currentPermission = inject<Ref<PermissionCode>>(
  'currentPermission'
)

const canWrite = computed(() => {
  return currentPermission?.value === 3
})
</script>

<template>
  <section class="sistemas-module">

    <header class="module-header">
      <div>
        <h1>Sistemas</h1>
        <p>Administración de sistemas y proyectos</p>
      </div>

      <RouterLink
        v-if="canWrite"
        to="/portal/sistemas/nuevo"
        class="new-system-btn"
      >
        + Nuevo sistema
      </RouterLink>
    </header>

    <nav class="module-nav">
      <RouterLink
        to="/portal/sistemas"
        class="module-nav-link"
      >
        Sistemas registrados
      </RouterLink>
    </nav>

    <main class="module-content">
      <RouterView />
    </main>

  </section>
</template>

<style scoped>
.sistemas-module {
  width: 100%;
  min-height: calc(100vh - 134px);
  color: #5F0032;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* ENCABEZADO DEL MÓDULO */
.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
}

.module-header h1 {
  margin: 0 0 6px;
  color: #5F0032;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.module-header p {
  margin: 0;
  color: #7d8794;
  font-size: 14px;
  font-weight: 500;
}

/* BOTÓN NUEVO SISTEMA */
.new-system-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 22px;
  background-color: #99154E;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.new-system-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.new-system-btn:active {
  transform: translateY(0);
}

/* NAVEGACIÓN INTERNA */
.module-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  padding: 5px;
  background-color: #FBEAF9;
  border: 1px solid #F0CBEC;
  border-radius: 12px;
  width: fit-content;
}

.module-nav-link {
  display: inline-flex;
  align-items: center;
  padding: 9px 15px;
  border-radius: 8px;
  color: #5F0032;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.module-nav-link:hover {
  background-color: #F5D6F2;
}

.module-nav-link.router-link-active {
  background-color: #E8F9A2;
  color: #5F0032;
}

/* CONTENEDOR DE LA VISTA INTERNA */
.module-content {
  width: 100%;
  min-height: 400px;
  padding: 24px;
  box-sizing: border-box;
  background-color: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
}

/* ADAPTACIÓN PARA PANTALLAS PEQUEÑAS */
@media (max-width: 700px) {
  .module-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .module-header h1 {
    font-size: 24px;
  }

  .new-system-btn {
    width: 100%;
  }

  .module-nav {
    width: 100%;
    box-sizing: border-box;
  }

  .module-nav-link {
    flex: 1;
    justify-content: center;
  }

  .module-content {
    padding: 18px;
  }
}
</style>


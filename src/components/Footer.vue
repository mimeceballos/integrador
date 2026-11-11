<script setup lang="ts">
import type { Ref } from 'vue'

// Importamos o definimos el tipo de permiso (1 = Desactivado, 2 = Lectura, 3 = Escritura)
export type PermissionCode = 1 | 2 | 3

// Definición de las props que recibe el footer
defineProps<{
  nota: string
  // Acepta tanto un número (1 | 2 | 3) como una Ref de Vue si se pasa directamente
  currentPermission?: PermissionCode | Ref<PermissionCode | undefined> | number
}>()
</script>

<template>
  <div class="list-footer">
    <div>
      <strong>Nota:</strong> {{ nota }}
    </div>
    <div class="permission-info">
      <!-- Se evalúa unwrap por si llega como un valor directo o dentro de una Ref -->
      <span v-if="currentPermission === 2 || (typeof currentPermission === 'object' && currentPermission?.value === 2)" class="read-only-message">
        Modo lectura
      </span>
      <span v-else-if="currentPermission === 3 || (typeof currentPermission === 'object' && currentPermission?.value === 3)" class="write-message">
        Acceso de escritura
      </span>
    </div>
  </div>
</template>

<style scoped>
.list-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  font-size: 12px;
  color: #64748b;
  flex-wrap: wrap;
  gap: 10px;
}

.permission-info span {
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 11px;
}

.read-only-message {
  background: #fef3c7;
  color: #92400e;
}

.write-message {
  background: #d1fae5;
  color: #065f46;
}
</style>
<script setup lang="ts">
import LoginView from './components/LogIn.vue'

interface LoginPayload {
  email: string
  password: string
}

function handleLoginSuccess(payload: LoginPayload) {
  console.log('Login exitoso:', payload)
}
</script>

<template>
  <LoginView @login-success="handleLoginSuccess" />
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface LoginForm {
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

const emit = defineEmits<{
  (e: 'login-success', payload: LoginPayload): void
}>()

const form = reactive<LoginForm>({
  email: '',
  password: '',
})

const errors = reactive<Partial<Record<keyof LoginForm, string>>>({})
const showPassword = ref(false)
const isLoading = ref(false)
const serverError = ref('')

function validate(): boolean {
  errors.email = ''
  errors.password = ''
  let valid = true

  if (!form.email.trim()) {
    errors.email = 'El correo es obligatorio'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresa un correo válido'
    valid = false
  }

  if (!form.password) {
    errors.password = 'La contraseña es obligatoria'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Debe tener al menos 6 caracteres'
    valid = false
  }

  return valid
}

async function handleSubmit(): Promise<void> {
  serverError.value = ''

  if (!validate()) return

  isLoading.value = true
  try {
    // TODO: reemplazar por la llamada real a tu API/backend
    // const res = await fetch('/api/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(form),
    // })
    // if (!res.ok) throw new Error('Credenciales incorrectas')

    await new Promise((resolve) => setTimeout(resolve, 800)) // simulación

    emit('login-success', { email: form.email, password: form.password })
  } catch (err) {
    serverError.value =
      err instanceof Error ? err.message : 'Ocurrió un error al iniciar sesión'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="login-page">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
    <div class="pattern-dots"></div>
    <div class="pattern-lines"></div>

    <form class="login-card" novalidate @submit.prevent="handleSubmit">
      <div class="login-form-side">
        <h1 class="login-title">Log In de Usuarios</h1>
        <p class="login-subtitle">Ingrese sus datos</p>

        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="correo@ejemplo.com"
            :class="{ invalid: errors.email }"
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="field">
          <label for="password">Contraseña</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              :class="{ invalid: errors.password }"
            />
            <button
              type="button"
              class="toggle-password"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <p v-if="serverError" class="server-error">{{ serverError }}</p>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Ingresando...' : 'Login' }}
        </button>
      </div>

      <div class="login-image-side">
        <div class="side-blob side-blob-1"></div>
        <div class="side-blob side-blob-2"></div>
        <div class="side-blob side-blob-3"></div>
        <div class="side-dots"></div>

      </div>
    </form>
  </section>
</template>

<style scoped>
.login-page {
  position: relative;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  box-sizing: border-box;
  overflow: hidden;
  background: #F6F3CF;
  isolation: isolate;
}


/* --- Tarjeta --- */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 860px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  min-height: 520px;
}

.login-form-side {
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  padding: 40px 44px;
  box-sizing: border-box;
}

/* --- Lado de la imagen con blobs --- */
.login-image-side {
  position: relative;
  flex: 1 1 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fffde1;
  overflow: hidden;
}

.side-blob {
  position: absolute;
  z-index: 0;
}

.side-blob-1 {
  top: -12%;
  left: -15%;
  width: 70%;
  height: 60%;
  background: #D9EFBD;
  opacity: 0.9;
  border-radius: 42% 58% 65% 35% / 45% 40% 60% 55%;
}

.side-blob-2 {
  bottom: -18%;
  right: -12%;
  width: 65%;
  height: 55%;
  background: #CFEBFF;
  opacity: 0.85;
  border-radius: 60% 40% 30% 70% / 55% 65% 35% 45%;
}

.side-blob-3 {
  bottom: 10%;
  left: 5%;
  width: 40%;
  height: 30%;
  background: #FDC086;
  opacity: 0.5;
  border-radius: 55% 45% 60% 40% / 40% 55% 45% 60%;
}

.side-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  padding: 0 24px;
}

.side-icon {
  font-size: 46px;
}

.side-text {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.login-title {
  margin: 0 0 4px;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
  color: #1a1a1a;
}

.login-subtitle {
  margin: 0 0 28px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
  color: #A5AF79;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.field label {
  font-size: 13px;
  font-weight: 500;
  color: #555151;
  margin-bottom: 6px;
}

.field input[type='email'],
.field input[type='password'],
.field input[type='text'] {
  font: inherit;
  font-size: 15px;
  padding: 6px 2px 8px;
  border: none;
  border-bottom: 1.5px solid #4D6787;
  background: transparent;
  color: #1a1a1a;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.field input:focus {
  border-bottom-color: #D46D25;
}

.field input.invalid {
  border-bottom-color: #D46D25;
}

.error-text {
  margin-top: 6px;
  font-size: 13px;
  color: #689D4B;
}

.password-wrapper {
  position: relative;
  display: flex;
}

.password-wrapper input {
  flex: 1;
  padding-right: 60px;
}

.toggle-password {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #4D6787;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 6px;
}

.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 22px;
  font-size: 12.5px;
  color: #4a4a4a;
}

.server-error {
  background: rgba(229, 72, 77, 0.1);
  border: 1px solid rgba(229, 72, 77, 0.4);
  color: #4D6787;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  margin: 0 0 18px;
}

.submit-btn {
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #4D6787;
  background: #CFEBFF;
  border: none;
  border-radius: 999px;
  padding: 13px;
  cursor: pointer;
  box-shadow: 0 0px 20px -6px rgb(51, 104, 160);
  transition: opacity 0.2s, transform 0.15s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


.signup-text a {
  color: #4D6787;
  font-weight: 600;
  text-decoration: none;
}

.signup-text a:hover {
  text-decoration: underline;
}

@media (max-width: 720px) {
  .login-card {
    flex-direction: column;
    min-height: auto;
  }

  .login-image-side {
    min-height: 200px;
    order: -1;
  }
}
</style>
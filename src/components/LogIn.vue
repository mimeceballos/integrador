<script setup lang="ts">
// Importación de funciones reactivas de Vue y utilidades de Vue Router
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

// Estructura para los datos recopilados en el formulario de inicio de sesión
interface LoginForm {
  email: string
  password: string
}
// Estructura de los datos que se enviarán al emitir un evento de éxito
interface LoginPayload {
  email: string
}

// 1 = Desactivo/Oculto, 2 = Lectura, 3 = Escritura
export type PermissionCode = 1 | 2 | 3

export interface UserProfile {
  email: string
  name: string
  roleName: string
  permissions: {
    sistemas: PermissionCode
    usuarios: PermissionCode
    roles: PermissionCode
    historias: PermissionCode
  }
}
// Definición de eventos que este componente puede notificar a su padre
const emit = defineEmits<{
  (e: 'login-success', payload: LoginPayload): void
}>()

const router = useRouter()

// --- MINI BASE ---
const MOCK_USERS: Record<string, { pass: string; profile: UserProfile }> = {
  // Usuario 1: Todos los permisos (3)
  'administrador1@gmail.com': {
    pass: 'Admin123',
    profile: {
      email: 'administrador1@gmail.com',
      name: 'Alejandro Góngora',
      roleName: 'Administrador',
      permissions: { sistemas: 3, usuarios: 3, roles: 3, historias: 3 }
    }
  },
  // Usuario 2: Permisos de Escritura, Lectura y Desactivado
  'usr2@gmail.com': {
    pass: 'usr123',
    profile: {
      email: 'usr2@gmail.com',
      name: 'Juan Perez',
      roleName: 'Usuario del Sistema',
      permissions: { sistemas: 3, usuarios: 2, roles: 1, historias: 2 }
    }
  },
  // Usuario 3: Solo Lectura general (2) o Desactivados (1)
  'usr3@gmail.com': {
    pass: 'usr123',
    profile: {
      email: 'usr3@gmail.com',
      name: 'María Perez',
      roleName: 'Externo',
      permissions: { sistemas: 2, usuarios: 2, roles: 1, historias: 1 }
    }
  }
}

const form = reactive<LoginForm>({
  email: '',
  password: '',
})

const errors = reactive<Partial<Record<keyof LoginForm, string>>>({})
// Variables de estado auxiliares
const showPassword = ref(false) // Controla si se oculta o muestra la contraseña
const isLoading = ref(false)    // Indica si el envío está en proceso
const serverError = ref('')     // Almacena errores generales de autenticación
const successMessage = ref('')  // Almacena mensajes de éxito

//valida entrada de datos
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
  }

  return valid
}
//proceso inicio de sesión
async function handleSubmit(): Promise<void> {
  serverError.value = ''
  successMessage.value = ''

  if (!validate()) return

  isLoading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 600))
//busca el usuario en la base de datos
    const account = MOCK_USERS[form.email.trim()]

    if (!account) {
      throw new Error('El correo electrónico es incorrecto')
    } else if (account.pass !== form.password) {
      throw new Error('La contraseña es incorrecta')
    }
//guarda el perfil en el almacenamiento local del navegador
    localStorage.setItem('auth_user', JSON.stringify(account.profile))

    successMessage.value = 'usuario correcto'
    emit('login-success', { email: form.email })
//redirecciona al inicio ya validado
    setTimeout(() => {
      router.push('/admin')
    }, 600)
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

    <form class="login-card" novalidate @submit.prevent="handleSubmit">
      <div class="login-form-side">
        <h1 class="login-title">Log In de Usuarios</h1>
        <p class="login-subtitle">Ingrese sus datos</p>

        <!-- Campo Email -->
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

        <!-- Campo Contraseña -->
        <div class="field">
          <label for="password">Contraseña</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Escribe tu contraseña"
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

        <!-- Mensajes de error específicos -->
        <p v-if="serverError" class="server-error">{{ serverError }}</p>

        <!-- Mensaje de éxito -->
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
<!--boton de envío -->
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Ingresando...' : 'Login' }}
        </button>
      </div>

      <div class="login-image-side">
        <div class="side-blob side-blob-1"></div>
        <div class="side-blob side-blob-2"></div>
        <div class="side-blob side-blob-3"></div>
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
  background: transparent !important;
  color: #1a1a1a !important;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.field input:-webkit-autofill,
.field input:-webkit-autofill:hover, 
.field input:-webkit-autofill:focus, 
.field input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
  -webkit-text-fill-color: #1a1a1a !important;
  transition: background-color 5000s ease-in-out 0s;
}

.field input:focus {
  border-bottom-color: #D46D25;
  background: transparent !important;
  outline: none;
}

.field input.invalid {
  border-bottom-color: #D46D25;
}

.error-text {
  margin-top: 6px;
  font-size: 13px;
  color: #D46D25;
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
  background: none !important;
  border: none !important;
  color: #4D6787 !important;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 6px;
  outline: none !important;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.toggle-password:focus,
.toggle-password:active {
  color: #4D6787 !important;
  outline: none !important;
  background: none !important;
}

.server-error {
  background: rgba(212, 109, 37, 0.12);
  border: 1px solid #D46D25;
  color: #b05111;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 18px;
  text-align: center;
}

.success-message {
  background: rgba(104, 157, 75, 0.15);
  border: 1px solid #689D4B;
  color: #3b6624;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 18px;
  text-align: center;
  text-transform: lowercase;
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
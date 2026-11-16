<script setup lang="ts">
// Importación de funciones reactivas de Vue y utilidades de Vue Router
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReCaptcha } from 'vue-recaptcha-v3' // hook de reCAPTCHA


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

// 2 - Se guarda la instancia completa de reCAPTCHA
const recaptchaInstance = useReCaptcha()

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


async function handleSubmit(): Promise<void> {
  serverError.value = ''
  successMessage.value = ''

  if (!validate()) return

  isLoading.value = true

  try {
    // 3 - Comprueba que la instancia esté lista
    if (!recaptchaInstance) {
      throw new Error('reCAPTCHA no está inicializado correctamente.')
    }

    // 3. Desestructura las funciones ahora que TypeScript sabe que existen
    const { executeRecaptcha, recaptchaLoaded } = recaptchaInstance

    await recaptchaLoaded()
    const token = await executeRecaptcha('login')

    if (!token) {
      throw new Error('No se pudo verificar la seguridad de reCAPTCHA.')
    }

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

    // NOTIFICAR A APP.VUE QUE LA SESIÓN CAMBIÓ
    window.dispatchEvent(new Event('auth-change'))

    successMessage.value = 'usuario correcto'
    emit('login-success', { email: form.email })
//redirecciona al inicio ya validado
    setTimeout(() => {
      router.push('/portal')
    }, 600)
  } catch (err) {
    serverError.value =
      err instanceof Error ? err.message : 'Ocurrió un error al iniciar sesión'
  } finally {
    isLoading.value = false
  }
}

function fillCredentials(email: string): void {
  const account = MOCK_USERS[email]
  if (!account) return
  form.email = email
  form.password = account.pass

  errors.email = ''
  errors.password = ''
  serverError.value = ''
  successMessage.value = ''
}

</script>

<template>
  
  <section class="login-page">

    <div class="page-header">
      <h2 class="page-title">Administrador de Proyectos</h2>
    </div>

    
    <form class="login-card" novalidate @submit.prevent="handleSubmit">
      <div class="login-form-side">
        <h1 class="login-title">Login de Usuarios</h1>
        <p class="login-subtitle">Ingrese sus datos</p>

        <div class="quick-login">
          <button
            type="button"
            class="quick-login-btn"
            @click="fillCredentials('administrador1@gmail.com')"
          >
          Administrador
          </button>
          <button
            type="button"
            class="quick-login-btn"
            @click="fillCredentials('usr2@gmail.com')"
          >
          Usuario del Sistema
          </button>
          <button
            type="button"
            class="quick-login-btn"
            @click="fillCredentials('usr3@gmail.com')"
          >
          Externo
          </button>
        </div>

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

    </form>
  </section>
</template>

<style scoped>
.login-page {
  font-family: 'Futura', sans-serif;
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 2px 60px 20px;
  box-sizing: border-box;
  background: #F2F2F2;
}

.page-header {
  position: relative;
  z-index: 1;
  text-align: center;
}

.page-title {
  margin: 0;
  font-size: 50px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #000000;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 500px;
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
  color: #1e3a5f;
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
  border-bottom: 1.5px solid #5b7089;
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
  border-bottom-color: #0f766e;
  background: transparent !important;
  outline: none;
}

.field input.invalid {
  border-bottom-color: #0f766e;
}

.error-text {
  margin-top: 6px;
  font-size: 13px;
  color: #0f766e;
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
  color: #5b7089 !important;
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
  color: #5b7089 !important;
  outline: none !important;
  background: none !important;
}

.server-error {
  background: rgba(15, 118, 110, 0.12);
  border: 1px solid #0f766e;
  color: #115e59;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 18px;
  text-align: center;
}

.success-message {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  color: #047857;
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
  color: #FFFF;
  background: #AFD06E;
  border: none;
  border-radius: 999px;
  padding: 13px;
  cursor: pointer;
  box-shadow: 0 0px 20px -6px rgb(255, 230, 230)
  ;
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

/* BOTONES NUEVOS */
.quick-login {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.quick-login-btn {
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #132441;
  background: #dbe7f5;
  border: 1.5px solid #FFFF;
  border-radius: 999px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.quick-login-btn:hover {
  background: #a9bfd9;
  transform: translateY(-1px);
}

@media (max-width: 720px) {
  .login-card {
    flex-direction: column;
    min-height: auto;
  }
}
</style>
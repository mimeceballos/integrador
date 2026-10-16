import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { VueReCaptcha } from 'vue-recaptcha-v3' // Se importa la librería pasar usar el captcha
import 'font-awesome/css/font-awesome.min.css'


const app = createApp(App)
app.use(router)

//Codigo para registrar el captcha
app.use(VueReCaptcha, {
  siteKey: '6LdNyMEtAAAAAA6A0wL_JIjko0VBREAe0P-Qytfk',
  loaderOptions: {
    autoHideBadge: false // Pon 'true' si deseas ocultar el ícono flotante de reCAPTCHA
  }
})

app.mount ("#app")
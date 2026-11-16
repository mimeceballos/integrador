
/*Guarda la cookie con tiempo de expiración en minutos*/
export function setCookie(nombre: string, valor: string, minutos: number): void {
  const fecha = new Date()
  fecha.setTime(fecha.getTime() + minutos * 60 * 1000)
  const expiracion = `expires=${fecha.toUTCString()}`
  document.cookie = `${nombre}=${encodeURIComponent(valor)};${expiracion};path=/;SameSite=Lax`
}

/**Lee una cookie específica ('usuario')*/
export function getCookie(nombre: string): string | null {
  const nombreEQ = `${nombre}=`
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim()
    if (c.indexOf(nombreEQ) === 0) {
      return decodeURIComponent(c.substring(nombreEQ.length, c.length))
    }
  }
  return null
}

/*Elimina la cookie inmediatamente*/
export function deleteCookie(nombre: string): void {
  document.cookie = `${nombre}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

/*Método genérico: verifica si existe la cookie 'usuario' y el perfil en localStorage.
 * Si borraron la cookie en el inspector, limpia todo y devuelve false.
 */
export function verificarSesionActiva(): boolean {
  const usuarioCookie = getCookie('usuario')
  const authUser = localStorage.getItem('auth_user')

  if (!usuarioCookie || !authUser) {
    deleteCookie('usuario')
    localStorage.removeItem('auth_user')
    return false
  }
  return true
}

/*Cierra la sesión limpiando cookie, localStorage y avisando a App.vue*/
export function cerrarSesionCompleta(): void {
  deleteCookie('usuario')
  localStorage.removeItem('auth_user')
  window.dispatchEvent(new Event('auth-change'))
}
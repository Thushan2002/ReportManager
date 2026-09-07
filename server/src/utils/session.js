const SESSION_COOKIE = 'report_manager_session'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/'
}

export const setSessionCookie = (response, token) => {
  response.cookie(SESSION_COOKIE, token, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000
  })
}

export const clearSessionCookie = (response) => {
  response.clearCookie(SESSION_COOKIE, cookieOptions)
}

export const getSessionToken = (request) => {
  const cookieHeader = request.headers.cookie
  if (!cookieHeader) return null

  const sessionCookie = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`))

  return sessionCookie ? decodeURIComponent(sessionCookie.slice(SESSION_COOKIE.length + 1)) : null
}
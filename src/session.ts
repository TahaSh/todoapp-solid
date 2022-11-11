import { createCookieSessionStorage, FormError, redirect } from 'solid-start'
import { LOGIN_USER } from './graphql/mutations'
import { CURRENT_USER } from './graphql/queries'
import { setToken, urqlClient } from './lib/urqlclient'

const storage = createCookieSessionStorage({
  cookie: {
    name: import.meta.env.VITE_COOKIE_TOKEN_KEY,
    secure: true,
    secrets: [import.meta.env.VITE_COOKIE_SECRET_KEY],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true
  }
})

interface LoginForm {
  username: string
  password: string
}

export const login = async ({ username, password }: LoginForm) => {
  const result = await urqlClient()
    .mutation(LOGIN_USER, { username, password })
    .toPromise()

  if (!result.data?.loginUser?.token) {
    throw new FormError('Wrong username or password')
  }

  const token = result.data.loginUser.token

  const session = await storage.getSession()
  session.set('token', token)
  return {
    'Set-Cookie': await storage.commitSession(session)
  }
}

export const getUser = async (request: Request) => {
  const session = await storage.getSession(request.headers.get('Cookie'))
  const token = session.get('token')
  if (!token) {
    return null
  }

  setToken(token)

  const result = await urqlClient().query(CURRENT_USER, {}).toPromise()

  if (!result.data?.currentUser) {
    return redirect('/login')
  }
  return result.data.currentUser
}

export const logout = async (request: Request) => {
  const session = await storage.getSession(request.headers.get('Cookie'))
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session)
    }
  })
}

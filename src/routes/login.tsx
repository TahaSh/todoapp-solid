import { Component, Show } from 'solid-js'
import { A, FormError, useRouteData } from 'solid-start'
import {
  createServerAction$,
  createServerData$,
  redirect
} from 'solid-start/server'
import Header from '~/components/Header'
import { getUser, login } from '~/session'

export function routeData() {
  return createServerData$(async (_, { request }) => {
    if (await getUser(request)) {
      throw redirect('/')
    }
    return {}
  })
}

const Login: Component = () => {
  const data = useRouteData<typeof routeData>()

  const [loggingIn, { Form }] = createServerAction$(async (form: FormData) => {
    const username = form.get('username')
    const password = form.get('password')

    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new FormError('Form data are not correct')
    }

    const headers = await login({ username, password })
    if (headers) {
      return redirect('/', { headers })
    }
  })

  return (
    <div class="min-h-screen flex flex-col justify-center items-center">
      <Show when={loggingIn.error}>
        <div class="mb-3.5 px-3.5 py-2 rounded-lg bg-red-700 text-red-50 text-sm font-medium">
          Your username or password is incorrect
        </div>
      </Show>
      <Header />
      <Form class="mt-5 w-full max-w-lg mx-auto flex flex-col">
        <input
          class="p-3.5 rounded-t border-b border-gray-300 text-gray-900 outline-none"
          name="username"
          value="testuser1"
          readonly={loggingIn.pending}
          type="text"
          placeholder="Username"
          required
        />
        <input
          class="p-3.5 rounded-b text-gray-900 outline-none"
          name="password"
          value="password"
          readonly={loggingIn.pending}
          type="password"
          placeholder="Password"
          required
        />
        <button
          class={
            'mt-2.5 py-2.5 rounded ' +
            (!loggingIn.pending
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-500 hover:bg-gray-500')
          }
          disabled={loggingIn.pending}
        >
          {data() ? 'Log in' : ''}
        </button>
      </Form>
      <div class="mt-5">
        Don't have an account?
        <A class="text-blue-400 ml-1" href="/signup">
          Sign up here
        </A>
      </div>
    </div>
  )
}

export default Login

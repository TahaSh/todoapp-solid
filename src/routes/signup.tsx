import { Component, Show } from 'solid-js'
import { A, FormError, useRouteData } from 'solid-start'
import {
  createServerAction$,
  createServerData$,
  redirect
} from 'solid-start/server'
import Header from '~/components/Header'
import { urqlClient } from '~/lib/urqlclient'
import { getUser } from '~/session'
import { SIGNUP_USER } from '../graphql/mutations'

export function routeData() {
  return createServerData$(async (_, { request }) => {
    if (await getUser(request)) {
      throw redirect('/')
    }
    return {}
  })
}

const Signup: Component = () => {
  const [signingUp, { Form }] = createServerAction$(async (form: FormData) => {
    const name = form.get('name')
    const username = form.get('username')
    const password = form.get('password')

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      typeof name !== 'string'
    ) {
      throw new FormError('Form data are not correct')
    }

    const result = await urqlClient()
      .mutation(SIGNUP_USER, { input: { name, username, password } })
      .toPromise()
    if (result) {
      return redirect('/login')
    }
  })

  const data = useRouteData<typeof routeData>()
  return (
    <div class="min-h-screen flex flex-col justify-center items-center">
      <Header />
      <Show when={signingUp.error}>
        <div class="mb-3.5 px-3.5 py-2 rounded-lg bg-red-700 text-red-50 text-sm font-medium">
          An error occurred while signing up
        </div>
      </Show>
      <Form class="mt-5 w-full max-w-lg mx-auto flex flex-col">
        <input
          class="p-3.5 rounded-t border-b border-gray-300 text-gray-900 outline-none"
          name="name"
          readonly={signingUp.pending}
          type="text"
          placeholder="Name"
          required
        />
        <input
          class="p-3.5 border-b border-gray-300 text-gray-900 outline-none"
          name="username"
          readonly={signingUp.pending}
          type="text"
          placeholder="Username"
          required
        />
        <input
          class="p-3.5 rounded-b text-gray-900 outline-none"
          name="password"
          readonly={signingUp.pending}
          type="password"
          placeholder="Password"
          required
        />
        <button
          class={
            'mt-2.5 py-2.5 rounded ' +
            (signingUp.pending
              ? 'bg-gray-500 hover:bg-gray-500'
              : 'bg-blue-500 hover:bg-blue-600')
          }
          disabled={signingUp.pending}
        >
          {data() ? 'Sign up' : ''}
        </button>
      </Form>
      <div class="mt-5">
        Already have an account?
        <A class="text-blue-400 ml-1" href="/login">
          Log in here
        </A>
      </div>
    </div>
  )
}

export default Signup

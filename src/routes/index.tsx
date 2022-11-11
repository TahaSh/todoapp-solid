import { Component, createResource, For, Show } from 'solid-js'
import { useRouteData } from 'solid-start'
import {
  createServerAction$,
  createServerData$,
  redirect
} from 'solid-start/server'
import AddTodoInput from '~/components/AddTodoInput'
import Header from '~/components/Header'
import Spinner from '~/components/Spinner'
import TodoItem, { Todo } from '~/components/TodoItem'
import { urqlClient } from '~/lib/urqlclient'
import { getUser, logout } from '~/session'
import { TODOS } from '../graphql/queries'

export function routeData() {
  const user = createServerData$(async (_, { request }) => {
    const user = await getUser(request)

    if (!user) {
      throw redirect('/login')
    }
    return user
  })

  const [todos, { refetch }] = createResource<Todo[]>(async () => {
    const { data } = await urqlClient().query(TODOS, {}).toPromise()
    return data.todos
  })

  return { user, todos, refetchTodos: refetch }
}

const Home: Component = () => {
  const { user, todos, refetchTodos } = useRouteData<typeof routeData>()
  todos()

  const [, { Form }] = createServerAction$((f: FormData, { request }) =>
    logout(request)
  )

  return (
    <div class="mt-20 w-full max-w-lg mx-auto">
      <Header />
      <div class="mt-10 flex items-center justify-between">
        <div>
          Hey <span class="font-bold">{user()?.name}</span>
        </div>
        <Form>
          <button class="cursor-pointer text-gray-200 hover:text-white">
            Log out
          </button>
        </Form>
      </div>
      <div class="mt-2.5">
        <AddTodoInput refetchTodos={refetchTodos} />
        <div class="mt-3.5">
          <Show when={todos.loading}>
            <div class="mt-10 flex items-center justify-center text-xl font-medium">
              <div class="w-5 mr-2.5">
                <Spinner />
              </div>
              Loading Todos
            </div>
          </Show>
          <Show when={!todos.loading && todos().length > 0}>
            <div class="space-y-2.5">
              <For each={todos()}>
                {(todo: Todo) => (
                  <TodoItem todo={todo} refetchTodos={refetchTodos} />
                )}
              </For>
            </div>
          </Show>
          <Show when={!todos.loading && !todos().length}>
            <div class="mt-10 text-center text-blue-50 text-opacity-40">
              Your Todo List is Empty
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}

export default Home

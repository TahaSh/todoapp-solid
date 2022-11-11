import { Component, createEffect, Show } from 'solid-js'
import { createRouteAction } from 'solid-start'
import { urqlClient } from '~/lib/urqlclient'
import Spinner from './Spinner'
import { ADD_TODO } from '../graphql/mutations'

interface AddTodoInputProps {
  refetchTodos: () => void
}

const AddTodoInput: Component<AddTodoInputProps> = (
  props: AddTodoInputProps
) => {
  const [addingTodo, { Form }] = createRouteAction(async (form: FormData) => {
    return await urqlClient()
      .mutation(ADD_TODO, {
        input: {
          title: form.get('title')
        }
      })
      .toPromise()
  })

  createEffect(() => {
    if (addingTodo.result) {
      props.refetchTodos()
    }
  })

  let inputRef: HTMLInputElement

  return (
    <Form
      class="px-5 w-full bg-gray-100 rounded-lg outline-none text-gray-900 flex items-center justify-between"
      onSubmit={(e) => {
        if (!inputRef.value.trim()) e.preventDefault()
        setTimeout(() => (inputRef.value = ''))
      }}
    >
      <input
        class="rounded-lg py-3.5 flex-1 bg-gray-100 outline-none pr-2.5"
        name="title"
        type="text"
        placeholder="What needs to be done?"
        readonly={addingTodo.pending}
        ref={inputRef}
      />
      <Show when={addingTodo.pending}>
        <div class="text-blue-900 w-8">
          <Spinner />
        </div>
      </Show>
    </Form>
  )
}

export default AddTodoInput

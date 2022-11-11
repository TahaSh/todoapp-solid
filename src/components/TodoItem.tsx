import { Component, createEffect, Show } from 'solid-js'
import { createRouteAction } from 'solid-start'
import { urqlClient } from '~/lib/urqlclient'
import { DELETE_TODO, UPDATE_TODO } from '../graphql/mutations'

export interface Todo {
  id: string
  title: string
  completed: boolean
}

interface TodoProps {
  todo: {
    id: string
    title: string
    completed: boolean
  }
  refetchTodos: () => void
}

const TodoItem: Component<TodoProps> = (props: TodoProps) => {
  const [deletingTodo, deleteTodo] = createRouteAction(
    async (todoId: string) => {
      return await urqlClient()
        .mutation(DELETE_TODO, {
          todoId: todoId
        })
        .toPromise()
    }
  )

  const [togglingTodo, toggleTodo] = createRouteAction(
    async ({ todoId, completed }: { todoId: string; completed: boolean }) => {
      return await urqlClient()
        .mutation(UPDATE_TODO, {
          input: {
            todoId,
            completed
          }
        })
        .toPromise()
    }
  )

  createEffect(() => {
    if (deletingTodo.result || togglingTodo.result) {
      props.refetchTodos()
    }
  })

  return (
    <div class="group flex items-center justify-between bg-gray-200 rounded-lg px-5 py-3.5 text-gray-900">
      <div class="flex items-center">
        <button
          class={
            'hover:border-blue-500 border-2 w-5 h-5 rounded-full flex items-center justify-center text-white cursor-pointer ' +
            (props.todo.completed
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-500')
          }
          onClick={() =>
            toggleTodo({
              todoId: props.todo.id,
              completed: !props.todo.completed
            })
          }
        >
          <Show when={props.todo.completed}>
            <svg style="width: 15px; height: 15px" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
              />
            </svg>
          </Show>
        </button>
        <span
          class={
            (props.todo.completed ? 'line-through text-gray-500' : '') +
            ' ml-2.5'
          }
        >
          {props.todo.title}
        </span>
      </div>

      <button
        class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-900"
        onClick={() => deleteTodo(props.todo.id)}
      >
        <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M9,8H11V17H9V8M13,8H15V17H13V8Z"
          />
        </svg>
      </button>
    </div>
  )
}

export default TodoItem

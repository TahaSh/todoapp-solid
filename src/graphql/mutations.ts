import { gql } from 'graphql-tag'

export const SIGNUP_USER = gql`
  mutation signupUser($input: SignupUserInput!) {
    signupUser(input: $input) {
      status
    }
  }
`

export const LOGIN_USER = gql`
  mutation loginUser($username: String!, $password: String!) {
    loginUser(username: $username, password: $password) {
      token
    }
  }
`

export const UPDATE_TODO = gql`
  mutation updateTodo($input: UpdateTodoInput) {
    updateTodo(input: $input) {
      status
    }
  }
`

export const DELETE_TODO = gql`
  mutation deleteTodo($todoId: ID) {
    deleteTodo(todoId: $todoId) {
      status
    }
  }
`

export const ADD_TODO = gql`
  mutation addTodo($input: AddTodoInput!) {
    addTodo(input: $input) {
      id
      title
      completed
    }
  }
`

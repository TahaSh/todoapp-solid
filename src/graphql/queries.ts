import { gql } from 'graphql-tag'

export const CURRENT_USER = gql`
  query currentUser {
    currentUser {
      id
      username
      name
    }
  }
`

export const TODOS = gql`
  query todos {
    todos {
      id
      title
      completed
    }
  }
`

import { createClient } from '@urql/core'
import { isServer } from 'solid-js/web'

let token = ''

export function setToken(newToken: string) {
  token = newToken
}

export const urqlClient = () => {
  return createClient({
    url: isServer ? import.meta.env.VITE_GRAPHQL_URL : '/api/graphql',
    fetchOptions: () => {
      return {
        headers: {
          authorization: token || ''
        }
      }
    }
  })
}

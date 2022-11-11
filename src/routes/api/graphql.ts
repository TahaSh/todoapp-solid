import { APIEvent, json } from 'solid-start'
import cookieParser from 'cookie'
import cookieSign from 'cookie-signature'

async function parseBody(request: Request) {
  const reader = request.body.getReader()
  const stream = await new ReadableStream({
    start(controller) {
      return pump()
      function pump() {
        return reader.read().then(({ done, value }) => {
          if (done) {
            controller.close()
            return
          }
          controller.enqueue(value)
          return pump()
        })
      }
    }
  })
  return await (await new Response(stream)).json()
}

function getToken(request: Request) {
  const parsedCookies = cookieParser.parse(request.headers.get('Cookie'))
  const unsigned = cookieSign.unsign(
    parsedCookies[import.meta.env.VITE_COOKIE_TOKEN_KEY],
    import.meta.env.VITE_COOKIE_SECRET_KEY
  )
  const decoded = JSON.parse(Buffer.from(unsigned, 'base64').toString('utf8'))
  return decoded.token
}

const proxyGraphqlRequest = async (request: Request) => {
  const payload = await parseBody(request)
  const token = await getToken(request)

  try {
    const resposne = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        ...request.headers,
        'content-type': 'application/json',
        authorization: token
      },
      body: JSON.stringify(payload)
    })
    const jsonResponse = await resposne.json()
    return json(jsonResponse)
  } catch (error) {
    console.log('error', error)
  }
}

export const POST = ({ request }: APIEvent) => {
  return proxyGraphqlRequest(request)
}

import { createServer } from 'node:http'
import serverHandler from './server/server.js'

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'

const server = createServer(async (req, res) => {
  try {
    // Create a Request object from the Node.js request
    const url = new URL(req.url, `http://${req.headers.host}`)
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
    })

    // Call the TanStack Start server handler
    const response = await serverHandler.fetch(request)

    // Set response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    // Set status code
    res.statusCode = response.status

    // Send response body
    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }

    res.end()
  } catch (error) {
    console.error('Server error:', error)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`)
})

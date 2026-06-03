import app from './app.js'
import env from './env/index.js'

app
  .listen({
    port: env.PORT,
    host: env.HOST,
  })
  .then(() => {
    console.log(`[${new Date()}] HTTP Server running on port ${env.PORT}...`)
  })

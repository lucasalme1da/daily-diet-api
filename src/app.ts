import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import { foodsRoutes } from './routes/foods.js'
import { usersRoutes } from './routes/users.js'

const app = fastify()

app.register(fastifyCookie)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(foodsRoutes, {
  prefix: 'foods',
})

export default app

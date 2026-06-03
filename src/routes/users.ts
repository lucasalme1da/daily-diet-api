import type { FastifyInstance } from 'fastify'
import { knex } from '../database.js'
import z from 'zod'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const { login, password } = <{ login?: string; password?: string }>(
      request.body
    )

    if (!password)
      return reply
        .status(404)
        .send({ errorMessage: `Password should not be empty` })

    const user = await knex('users')
      .select(['id', 'password'])
      .where({
        login,
      })
      .returning(['id', 'password'])
      .first()

    if (!user)
      return reply
        .status(404)
        .send({ errorMessage: `User or password are incorrect` })

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword)
      return reply
        .status(400)
        .send({ errorMessage: `User or password are incorrect` })

    const sessionId = randomUUID()

    await knex('users').update({ session_id: sessionId }).where({
      id: user.id,
    })

    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return reply.status(200).send('Login successfull')
  })

  app.post('/signup', async (request, reply) => {
    try {
      const createNewUserSchema = z.object({
        login: z.string().min(4, 'O login deve conter ao menos 4 caracteres.'),
        password: z
          .string()
          .min(8, 'A senha deve conter no mínimo 8 caracteres'),
      })

      const { login, password } = createNewUserSchema.parse(request.body)

      const sessionId = randomUUID()

      const passwordHash = await bcrypt.hash(password, 10)

      await knex('users')
        .insert({
          id: randomUUID(),
          login,
          password: passwordHash,
          session_id: sessionId,
        })
        .returning('')

      reply.setCookie('session_id', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return reply.status(201).send()
    } catch (error) {
      console.error(error)
      return reply.status(400).send({ errorMessage: 'Erro ao criar usuário' })
    }
  })
}

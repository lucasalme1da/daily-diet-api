import type { FastifyInstance } from 'fastify'
import { knex } from '../database.js'
import z from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists.js'

export async function foodsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      try {
        const createFoodSchema = z.object({
          name: z.string().nonempty(),
          description: z.string().nonempty(),
          date: z.iso.date().nonoptional(),
          time: z.iso.time().nonoptional(),
          healthy: z.boolean().nonoptional(),
        })

        const newFood = createFoodSchema.parse(request.body)

        const sessionId = request.cookies.sessionId

        const user = await knex('users')
          .select()
          .where({
            session_id: sessionId,
          })
          .returning('id')
          .first()

        if (!user) reply.status(400).send({ errorMessage: 'User not found' })
        console.log(user)
        const newTransaction = await knex('foods')
          .insert({
            id: randomUUID(),
            ...newFood,
            user_id: user.id,
          })
          .returning('*')

        return reply.status(201).send(newTransaction)
      } catch (error) {
        console.log(error)
        return reply.status(400).send()
      }
    },
  )

  app.put(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      try {
        const { id: foodId } = <{ id: string }>request.params

        const updateFoodSchema = z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          date: z.iso.date().optional(),
          time: z.iso.time().optional(),
          healthy: z.boolean().optional(),
        })

        const updatedFoodInfo = updateFoodSchema.parse(request.body)

        await knex('foods')
          .update({
            ...updatedFoodInfo,
          })
          .where({
            id: foodId,
          })

        return reply.status(200).send()
      } catch (error) {
        console.log(error)
        return reply.status(400).send()
      }
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      try {
        const { id: foodId } = <{ id: string }>request.params

        const deleted = await knex('foods').delete().where({
          id: foodId,
        })

        if (deleted < 1)
          return reply.status(400).send({ errorMessage: 'Food not found' })

        return reply.status(200).send()
      } catch (error) {
        console.log(error)
        return reply.status(400).send()
      }
    },
  )

  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const user = await knex('users')
        .select()
        .where({
          session_id: sessionId,
        })
        .returning('id')
        .first()

      const foods = await knex('foods')
        .select('name', 'date', 'time', 'healthy')
        .where({
          user_id: user.id,
        })

      return reply.status(200).send(foods)
    },
  )

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { id } = <{ id: string }>request.params
      const food = await knex('foods')
        .select('name', 'description', 'date', 'time', 'healthy')
        .where({
          id,
        })
        .first()

      return reply.status(200).send(food)
    },
  )

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const user = await knex('users')
        .select()
        .where({
          session_id: sessionId,
        })
        .returning('id')
        .first()

      const foods = await knex('foods')
        .select('name', 'date', 'time', 'healthy')
        .where({
          user_id: user.id,
        })

      const summary = foods.reduce(
        (sum, food) => {
          sum.total_food_entries += 1

          if (food.healthy) {
            sum.total_food_healthy += 1
            sum.best_healthy_sequence[0] = sum.best_healthy_sequence[0] + 1
          } else {
            sum.total_food_unhealthy += 1
            if (sum.best_healthy_sequence[0] > 0)
              sum.best_healthy_sequence = [0, ...sum.best_healthy_sequence]
          }

          return sum
        },
        {
          total_food_entries: 0,
          total_food_healthy: 0,
          total_food_unhealthy: 0,
          best_healthy_sequence: [0],
        },
      )

      return reply.status(200).send({
        ...summary,
        best_healthy_sequence: Math.max(...summary.best_healthy_sequence),
      })
    },
  )
}

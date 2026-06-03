import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import app from '../src/app'

describe('Foods routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should record a food for a user sucessfully', async () => {
    const user = {
      login: 'johndoe',
      password: '12345abc*',
    }

    await request(app.server).post('/users/signup').send(user)

    const loginUserResponse = await request(app.server)
      .post('/users/login')
      .send(user)

    const cookies = loginUserResponse.get('Set-Cookie') || []

    await request(app.server)
      .post('/foods')
      .set('Cookie', cookies)
      .send({
        name: 'Apple Pie',
        description: 'Pie made of apples.',
        date: '2026-05-31',
        time: '11:00',
        healthy: false,
      })
      .expect(201)
  })

  it('should list all the foods of a user', async () => {
    const user = {
      login: 'johndoe',
      password: '12345abc*',
    }

    await request(app.server).post('/users/signup').send(user)

    const loginUserResponse = await request(app.server)
      .post('/users/login')
      .send(user)

    const cookies = loginUserResponse.get('Set-Cookie') || []
    console.log(cookies)
    const foods = [
      {
        name: 'Apple',
        description: 'An apple fruit.',
        date: '2026-05-31',
        time: '11:00',
        healthy: true,
      },
      {
        name: 'Apple Pie',
        description: 'Pie made of apples.',
        date: '2026-05-31',
        time: '11:00',
        healthy: false,
      },
      {
        name: 'Apple Juice',
        description: 'Juice made from fresh apples. Sugar free.',
        date: '2026-05-31',
        time: '11:00',
        healthy: true,
      },
    ]

    for (const food of foods) {
      await request(app.server)
        .post('/foods')
        .set('Cookie', cookies)
        .send(food)
        .expect(201)
    }

    const listFoodsResponse = await request(app.server)
      .get('/foods')
      .set('Cookie', cookies)
      .expect(200)

    expect(listFoodsResponse.body.length).equal(foods.length)
  })

  it('should list users food summary isolated', async () => {
    const foods = [
      {
        name: 'Apple',
        description: 'An apple fruit.',
        date: '2026-05-31',
        time: '11:00',
        healthy: true,
      },
      {
        name: 'Apple Juice',
        description: 'Juice made from fresh apples. Sugar free.',
        date: '2026-05-31',
        time: '11:00',
        healthy: true,
      },
      {
        name: 'Apple Pie',
        description: 'Pie made of apples.',
        date: '2026-05-31',
        time: '11:00',
        healthy: false,
      },
    ]

    const users = [
      {
        login: 'johndoe',
        password: '12345abc*',
        bestSequence: 2,
        foods,
      },
      {
        login: 'maryjane',
        password: '67890abc*',
        bestSequence: 3,
        foods: [
          {
            name: 'Orange',
            description: 'An orange fruit.',
            date: '2026-05-31',
            time: '11:00',
            healthy: true,
          },
          ...foods,
        ],
      },
    ]

    for (const user of users) {
      await request(app.server).post('/users/signup').send(user)

      const loginUserResponse = await request(app.server)
        .post('/users/login')
        .send(user)

      const cookies = loginUserResponse.get('Set-Cookie') || []

      for (const food of user.foods) {
        await request(app.server)
          .post('/foods')
          .set('Cookie', cookies)
          .send(food)
          .expect(201)
      }

      const summaryFoodsResponse = await request(app.server)
        .get('/foods/summary')
        .set('Cookie', cookies)
        .expect(200)

      expect(summaryFoodsResponse.body.best_healthy_sequence).equal(
        user.bestSequence,
      )
    }
  })
})

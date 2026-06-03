import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import app from '../src/app'

describe('Users routes', () => {
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

  it('should create a user sucessfully', async () => {
    await request(app.server)
      .post('/users/signup')
      .send({
        login: 'johndoe',
        password: 'test12345*',
      })
      .expect(201)
  })

  it('should create a user and login sucessfully', async () => {
    const newUser = {
      login: 'johndoe',
      password: 'test12345*',
    }

    await request(app.server).post('/users/signup').send(newUser)

    await request(app.server).post('/users/login').send(newUser).expect(200)
  })
})

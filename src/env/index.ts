import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  HOST: z.enum(['127.0.0.1', '0.0.0.0']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
})

const { data: env, error } = envSchema.safeParse(process.env)

if (env === undefined) {
  throw new Error('Env is null')
}

if (error) {
  console.log(`Invalid .env variables:`, z.treeifyError(error))

  throw new Error('Invalid .env variables.')
}

export default env ?? {}

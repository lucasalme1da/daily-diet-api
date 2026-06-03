import { Knex } from 'knex'
import type { Users } from '../interfaces.ts'

declare module 'knex/types/tables' {
  export interface Tables {
    users: Knex.CompositeTableType<
      Users,
      Omit<
        Users,
        | 'id'
        | 'session_id'
        | 'session_id_expires_at'
        | 'created_at'
        | 'updated_at'
      >,
      Omit<
        Users,
        | 'id'
        | 'session_id'
        | 'session_id_expires_at'
        | 'created_at'
        | 'updated_at'
      >
    >
  }
}

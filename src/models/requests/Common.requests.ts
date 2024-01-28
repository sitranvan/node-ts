import { Query } from 'express-serve-static-core'

export interface PaginationQuery extends Query {
  limit: string
  page: string
}

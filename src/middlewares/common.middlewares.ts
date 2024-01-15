import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

type FilterKeys<T> = Array<keyof T>

// Lọc các giá trị trong body tránh trường hợp người dùng truyền vào các trường nhạy cảm
export const filterMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }

import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { pick } from 'lodash'
import { COMMON_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validate'

type FilterKeys<T> = Array<keyof T>

// Lọc các giá trị trong body tránh trường hợp người dùng truyền vào các trường nhạy cảm
export const filterMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }

// Kiểm tra dữ liệu phân trang page, limit
export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        errorMessage: COMMON_MESSAGES.LIMIT_MUST_BE_A_NUMBER,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error(COMMON_MESSAGES.LIMIT_MUST_BE_LESS_THAN_100_AND_GREATER_THAN_1)
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        errorMessage: COMMON_MESSAGES.PAGE_MUST_BE_A_NUMBER,
        custom: {
          options: async (value, { req }) => {
            const page = Number(value)
            if (page < 1) {
              throw new Error(COMMON_MESSAGES.PAGE_MUST_BE_GREATER_THAN_1)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

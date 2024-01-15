import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Trường hợp thuộc lỗi ErrorWithStatus
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }

  // Trường hợp lỗi 500 do server
  // Xử lí trường hợp enumerable của err đang bị ẩn nên không thể lấy được thông tin
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, ['stack'])
  })
}

export default defaultErrorHandler

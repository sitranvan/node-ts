import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'

const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    // Trường hợp thuộc lỗi ErrorWithStatus
    if (err instanceof ErrorWithStatus) {
      return res.status(err.status).json(omit(err, ['status']))
    }

    // Trường hợp lỗi 500 do server
    // Xử lí trường hợp enumerable của err đang bị ẩn nên không thể lấy được thông tin
    const finalErr: any = {}
    Object.getOwnPropertyNames(err).forEach((key) => {
      // Trường hợp dùng aws họ sẽ ẩn các thông tin của err là false toàn bộ như enumerable, writable, configurable họ không cho can thiệp thì return
      if (
        !Object.getOwnPropertyDescriptor(err, key)?.configurable ||
        !Object.getOwnPropertyDescriptor(err, key)?.writable
      ) {
        return
      }
      // Gán lại giá trị cho finalErr
      finalErr[key] = err[key]
    })
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: finalErr.message,
      errorInfo: omit(finalErr, ['stack'])
    })
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR,
      errorInfo: omit(err as any, ['stack'])
    })
  }
}

export default defaultErrorHandler

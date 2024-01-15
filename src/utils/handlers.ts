import { NextFunction, Request, RequestHandler, Response } from 'express'

export const wrapRequest = <P>(func: RequestHandler<P, any, any, Record<string, any>>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

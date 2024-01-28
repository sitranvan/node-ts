import { NextFunction, Request, RequestHandler, Response } from 'express'

// P -> Request Params, Q -> Request Query
// P = core.ParamsDictionary,
// ResBody = any,
// ReqBody = any,
// ReqQuery = core.Query,
// Locals extends Record<string, any> = Record<string, any>,

// Cách viết đầy đủ
export const wrapRequest = <P, Res, Req, Q>(func: RequestHandler<P, Res, Req, Q>) => {
  return async (req: Request<P, Res, Req, Q>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

// Viết fix nhanh
// export const wrapRequest = <P, Q>(func: RequestHandler<P, any, any, any>) => {
//   return async (req: Request<P, Q>, res: Response, next: NextFunction) => {
//     try {
//       await func(req, res, next)
//     } catch (error) {
//       next(error)
//     }
//   }
// }

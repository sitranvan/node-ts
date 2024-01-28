import { ParamsDictionary } from 'express-serve-static-core'
export interface LikeTweetRequestBody {
  tweet_id: string
}
export interface UnLikeTweetRequestParams extends ParamsDictionary {
  tweet_id: string
}

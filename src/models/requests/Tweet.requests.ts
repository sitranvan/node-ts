import { ParamsDictionary, Query } from 'express-serve-static-core'
import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Other'
import { PaginationQuery } from './Common.requests'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}

export interface TweetIdRequestParams extends ParamsDictionary {
  tweet_id: string
}

export interface TweetChildrenQuery extends PaginationQuery {
  tweet_type: string
}

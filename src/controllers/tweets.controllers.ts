import { Request, Response } from 'express'
import { wrapRequest } from '~/utils/handlers'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetIdRequestParams, TweetChildrenQuery, TweetRequestBody } from '~/models/requests/Tweet.requests'
import tweetsService from '~/services/tweets.services'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/User.requests'
import { TweetType } from '~/constants/enum'
import { PaginationQuery } from '~/models/requests/Common.requests'

// Tạo tweet
export const createTweetController = wrapRequest(
  async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await tweetsService.createTweet(user_id, req.body)
    return res.json({
      message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESS,
      result
    })
  }
)

// Lấy tweet theo id
export const getTweetController = wrapRequest(async (req: Request<TweetIdRequestParams>, res: Response) => {
  const result = await tweetsService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  // Xử lý cập nhật lại object vì nó không tự cập nhật khi get dữ liệu là dữ liệu cũ chứ không phải dữ liệu sau khi tăng view
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }
  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    result: tweet
  })
})
// Get tweet children như comment, quote...
export const getTweetChildrenController = wrapRequest(
  async (req: Request<TweetIdRequestParams, any, any, TweetChildrenQuery>, res: Response) => {
    const tweet_type = Number(req.query.tweet_type) as TweetType
    const limit = Number(req.query.limit)
    const page = Number(req.query.page)
    const user_id = req.decoded_authorization?.user_id
    const { total, tweets } = await tweetsService.getTweetChildren({
      tweet_id: req.params.tweet_id,
      tweet_type,
      limit,
      page,
      user_id
    })
    return res.json({
      message: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESS,
      result: {
        tweets,
        pagination: {
          limit,
          page,
          total_page: Math.ceil(total / limit)
        }
      }
    })
  }
)

// Lấy ra những tweet mới nhất
export const getNewFeedsController = wrapRequest(
  async (req: Request<ParamsDictionary, any, any, PaginationQuery>, res: Response) => {
    const limit = Number(req.query.limit)
    const page = Number(req.query.page)
    const user_id = req.decoded_authorization?.user_id as string
    const { tweets, total } = await tweetsService.getNewFeeds({ limit, page, user_id })
    return res.json({
      message: TWEETS_MESSAGES.GET_NEW_FEEDS_SUCCESS,
      result: {
        tweets,
        pagination: {
          limit,
          page,
          total_page: Math.ceil(total / limit)
        }
      }
    })
  }
)

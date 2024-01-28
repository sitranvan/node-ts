import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LIKES_MESSAGES } from '~/constants/messages'
import { LikeTweetRequestBody, UnLikeTweetRequestParams } from '~/models/requests/Like.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import likesService from '~/services/likes.services'
import { wrapRequest } from '~/utils/handlers'

export const likeTweetController = wrapRequest(
  // Likes tweet
  async (req: Request<ParamsDictionary, any, LikeTweetRequestBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await likesService.likeTweet(user_id, req.body.tweet_id)
    return res.json({
      message: LIKES_MESSAGES.LIKE_TWEET_SUCCESS,
      result
    })
  }
)

// Unlike tweet
export const unLikeTweetController = wrapRequest(async (req: Request<UnLikeTweetRequestParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await likesService.unLikeTweet(user_id, req.params.tweet_id)
  return res.json({
    message: LIKES_MESSAGES.UNLIKE_TWEET_SUCCESS
  })
})

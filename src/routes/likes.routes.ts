import { Router } from 'express'
import { likeTweetController, unLikeTweetController } from '~/controllers/likes.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
const likesRouter = Router()
/**
 * Description: Like tweet.
 * Path:/
 * Method: POST
 * Body: {tweet_id: string}
 * Header: {Authorization: Bearer <access_token>}
 */
likesRouter.post('/', accessTokenValidator, verifiedUserValidator, tweetIdValidator, likeTweetController)

/**
 * Description: Unlike tweet.
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Body: {tweet_id: string}
 * Header: {Authorization: Bearer <access_token>}
 */
likesRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  unLikeTweetController
)

export default likesRouter

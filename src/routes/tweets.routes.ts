import { Router } from 'express'
import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import { paginationValidator } from '~/middlewares/common.middlewares'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
const tweetsRouter = Router()
/**
 * Description: Create a new tweet.
 * Path:/
 * Method: POST
 * Body: TweetRequestBody
 * Header: {Authorization: Bearer <access_token>}
 */
tweetsRouter.post('/', accessTokenValidator, verifiedUserValidator, createTweetValidator, createTweetController)

/**
 * Description: Get tweet detail
 * Path:/:tweet_id
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */
tweetsRouter.get(
  '/:tweet_id',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  tweetIdValidator,
  audienceValidator,
  getTweetController
)

/**
 * Description: Get tweet children
 * Path:/:tweet_id/chilren
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number, page: number, tweet_type:TweetType} skip <=> page
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  getTweetChildrenController
)

/**
 * Description: Get new feeds
 * Path:/
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number, page: number} skip <=> page
 */
tweetsRouter.get('/', paginationValidator, accessTokenValidator, verifiedUserValidator, getNewFeedsController)
export default tweetsRouter

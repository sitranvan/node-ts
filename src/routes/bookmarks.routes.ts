import { Router } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
const bookmarksRouter = Router()
/**
 * Description: Bookmark tweet.
 * Path:/
 * Method: POST
 * Body: {tweet_id: string}
 * Header: {Authorization: Bearer <access_token>}
 */
bookmarksRouter.post('/', accessTokenValidator, verifiedUserValidator, tweetIdValidator, bookmarkTweetController)

/**
 * Description: Unbookmark tweet.
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Body: {tweet_id: string}
 * Header: {Authorization: Bearer <access_token>}
 */
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  unBookmarkTweetController
)

// Có thể thiết kế thêm trường hợp khi muốn cho người dùng biết tweet đó có được bookmark hay không bằng cách hiển thị bên frontend nếu được bookmark thì màu xanh không thì màu xám...
export default bookmarksRouter

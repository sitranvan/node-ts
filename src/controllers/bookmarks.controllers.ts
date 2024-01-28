import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { wrapRequest } from '~/utils/handlers'
import { BookmarkTweetRequestBody, UnbookmarkTweetRequestParams } from '~/models/requests/Bookmark.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarksService from '~/services/bookmarks.services'
import { BOOKMARKS_MESSAGES } from '~/constants/messages'

export const bookmarkTweetController = wrapRequest(
  // Bookmarks tweet
  async (req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await bookmarksService.bookmarkTweet(user_id, req.body.tweet_id)
    return res.json({
      message: BOOKMARKS_MESSAGES.BOOKMARK_TWEET_SUCCESS,
      result
    })
  }
)

// Unbookmarks tweet
export const unBookmarkTweetController = wrapRequest(
  async (req: Request<UnbookmarkTweetRequestParams>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    await bookmarksService.unBookmarkTweet(user_id, req.params.tweet_id)
    return res.json({
      message: BOOKMARKS_MESSAGES.UNBOOKMARK_TWEET_SUCCESS
    })
  }
)

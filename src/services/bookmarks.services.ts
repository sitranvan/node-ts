import { ObjectId } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmark.schemas'
import databaseService from './database.services'

class BookmarksService {
  // Bookmark tweet
  async bookmarkTweet(user_id: string, tweet_id: string) {
    // Nếu không có thì insert còn có thì không làm gì cả
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) })
        // Nếu muốn cập nhật thêm thông tin thì thêm vào đây dùng $set
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result as Bookmark
  }
  // Unbookmark tweet
  async unBookmarkTweet(user_id: string, tweet_id: string) {
    // Nếu không có thì insert còn có thì không làm gì cả
    const result = await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result as Bookmark
  }
}

const bookmarksService = new BookmarksService()
export default bookmarksService

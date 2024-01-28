import { ObjectId, WithId } from 'mongodb'
import Like from '~/models/schemas/Like.schemas'
import databaseService from './database.services'

class LikesService {
  // Like tweet
  async likeTweet(user_id: string, tweet_id: string) {
    // Nếu không có thì insert còn có thì không làm gì cả
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Like({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) })
        // Nếu muốn cập nhật thêm thông tin thì thêm vào đây dùng $set
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result as Like
  }
  // Unlike tweet
  async unLikeTweet(user_id: string, tweet_id: string) {
    // Nếu không có thì insert còn có thì không làm gì cả
    const result = await databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result as Like
  }
}

const likesService = new LikesService()
export default likesService

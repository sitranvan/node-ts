import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '~/constants/config'
import Bookmark from '~/models/schemas/Bookmark.schemas'
import Conversation from '~/models/schemas/Coversation.schemas'
import Follower from '~/models/schemas/Follower.schemas'
import Hashtag from '~/models/schemas/Hashtag.schemas'
import Like from '~/models/schemas/Like.schemas'
import RefreshToken from '~/models/schemas/RefreshToken.shemas'
import Tweet from '~/models/schemas/Tweet.schemas'
import User from '~/models/schemas/User.schemas'
const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@stvcluster.hezg5zc.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.dbName)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error connecting ', error)
    }
  }
  async indexUser() {
    // Tránh tạo index nhiều lần, mặc dù không ảnh hưởng lgocic nhưng ảnh hưởng đến performance
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])
    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshToken() {
    const exists = await this.refreshToken.indexExists(['token_1', 'exp_1'])
    if (!exists) {
      this.refreshToken.createIndex({ token: 1 }, { unique: true })
      // Set TTL cho collection refresh_token
      this.refreshToken.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }
  async indexFollower() {
    const exists = await this.followers.indexExists(['user_id_1_followed_id_1'])
    if (!exists) {
      this.followers.createIndex({ user_id: 1, followed_id: 1 })
    }
  }
  async indexTweet() {
    // Create index content type text
    const exists = await this.tweets.indexExists(['content_text'])
    if (!exists) {
      // default_language: 'none' để không bị lỗi khi tìm kiếm tiếng việt và các từ như who, is, are, ... hay còn gọi là stop words
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }

  get users(): Collection<User> {
    // Nếu không có as string thì sẽ không biết được chắc chắn có phải DB_USERS_COLLECTION là string hay không hay là null, undefined
    return this.db.collection(envConfig.dbUsersCollection)
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokenCollection)
  }
  get followers(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowersCollection)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetsCollection)
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(envConfig.dbHashtagsCollection)
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.dbBookmarksCollection)
  }
  get likes(): Collection<Like> {
    return this.db.collection(envConfig.dbLikesCollection)
  }
  get conversations(): Collection<Conversation> {
    return this.db.collection(envConfig.dbConversationsCollection)
  }
}
// Tạo object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService

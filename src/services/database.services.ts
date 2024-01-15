import { Collection, Db, MongoClient } from 'mongodb'
import Follower from '~/models/schemas/Follower.schemas'
import RefreshToken from '~/models/schemas/RefreshToken.shemas'
import User from '~/models/schemas/User.schemas'
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@stvcluster.hezg5zc.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error connecting ', error)
    }
  }
  get users(): Collection<User> {
    // Nếu không có as string thì sẽ không biết được chắc chắn có phải DB_USERS_COLLECTION là string hay không hay là null, undefined
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
  }
  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }
}
// Tạo object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService

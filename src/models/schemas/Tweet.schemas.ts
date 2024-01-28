import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Other'
import { isEmpty } from 'lodash'

interface TweetConstructor {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc
  hashtags: ObjectId[]
  mentions: string[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
}

export default class Tweet {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date

  constructor(data: TweetConstructor) {
    const date = new Date()
    this._id = data._id
    this.user_id = data.user_id
    this.type = data.type
    this.audience = data.audience
    this.content = data.content
    this.parent_id = data.parent_id && !isEmpty(data.parent_id) ? new ObjectId(data.parent_id) : null
    this.hashtags = data.hashtags
    this.mentions = data.mentions.map((mention) => new ObjectId(mention))
    this.medias = data.medias
    this.guest_views = data.guest_views || 0
    this.user_views = data.user_views || 0
    this.created_at = data.created_at || date
    this.updated_at = data.updated_at || date
  }
}

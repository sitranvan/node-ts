import Tweet from '~/models/schemas/Tweet.schemas'

export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video
}
export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}

export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}

export enum PeoPleFollow {
  Anyone = '0',
  Following = '1'
}

import { Express } from 'express'
import express from 'express'
import mediasRouter from './medias.routes'
import staticRouter from './static.routes'
import usersRouter from './users.routes'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
import tweetsRouter from './tweets.routes'
import bookmarksRouter from './bookmarks.routes'
import likesRouter from './likes.routes'
import searchRouter from './search.routes'
import conversationsRouter from './conversations.routes'
export default function handleRoutes(app: Express) {
  app.use('/users', usersRouter)
  app.use('/medias', mediasRouter)

  app.use('/static', staticRouter)
  app.use('/tweets', tweetsRouter)
  app.use('/bookmarks', bookmarksRouter)
  app.use('/likes', likesRouter)
  app.use('/searchs', searchRouter)
  app.use('/conversations', conversationsRouter)

  // Serving static files -> cách 1
  app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
}

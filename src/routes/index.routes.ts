import { Express } from 'express'
import express from 'express'
import mediasRouter from './medias.routes'
import staticRouter from './static.routes'
import usersRouter from './users.routes'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
export default function handleRoutes(app: Express) {
  app.use('/users', usersRouter)
  app.use('/medias', mediasRouter)
  // Serving static files -> cách 1
  app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
  app.use('/static', staticRouter)
}

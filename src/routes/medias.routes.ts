import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'

const mediasRouter = Router()

mediasRouter.post('/upload-image', uploadImageController)
mediasRouter.post('/upload-video', uploadVideoController)

export default mediasRouter

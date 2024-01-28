import { Router } from 'express'

import { getConversationsByReceiverIdController } from '~/controllers/conversations.controllers'
import { paginationValidator } from '~/middlewares/common.middlewares'
import { accessTokenValidator, getConversationsValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

const conversationsRouter = Router()

conversationsRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  getConversationsValidator,
  paginationValidator,
  getConversationsByReceiverIdController
)

export default conversationsRouter

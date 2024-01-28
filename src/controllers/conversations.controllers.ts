import { Request, Response } from 'express'
import { CONVERSATIONS_MESSAGES } from '~/constants/messages'
import { PaginationQuery } from '~/models/requests/Common.requests'
import { GetConversationParams } from '~/models/requests/Conversation.requets'
import conversationsService from '~/services/conversations.services'
import { wrapRequest } from '~/utils/handlers'

export const getConversationsByReceiverIdController = wrapRequest(
  async (req: Request<GetConversationParams, any, any, PaginationQuery>, res: Response) => {
    const { receiver_id } = req.params
    const limit = Number(req.query.limit)
    const page = Number(req.query.page)

    const sender_id = req.decoded_authorization?.user_id as string

    const { conversations, total } = await conversationsService.getConversations({
      sender_id,
      receiver_id,
      limit,
      page
    })
    return res.json({
      message: CONVERSATIONS_MESSAGES.GET_CONVERSATIONS_SUCCESS,
      result: {
        conversations,
        pagination: {
          limit,
          page,
          total_page: Math.ceil(total / limit)
        }
      }
    })
  }
)

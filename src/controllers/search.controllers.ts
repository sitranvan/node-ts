import { wrapRequest } from '~/utils/handlers'
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { SearchQuery } from '~/models/requests/Search.requests'
import searchService from '~/services/search.services'
import { TokenPayload } from '~/models/requests/User.requests'
import { SEARCH_MESSAGE } from '~/constants/messages'
import { PeoPleFollow } from '~/constants/enum'

export const searchController = wrapRequest(
  async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
    const content = req.query.content
    const limit = Number(req.query.limit)
    const page = Number(req.query.page)
    const user_id = req.decoded_authorization?.user_id as string
    const media_type = req.query.media_type
    const people_follow = req.query.people_follow
    const { tweets, total } = await searchService.search({ content, media_type, people_follow, limit, page, user_id })
    return res.json({
      message: SEARCH_MESSAGE.SEARCH_SUCCESS,
      result: {
        tweets,
        pagination: {
          limit,
          page,
          total_page: Math.ceil(total / limit)
        }
      }
    })
  }
)

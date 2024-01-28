import { checkSchema } from 'express-validator'
import { MediaTypeQuery, PeoPleFollow } from '~/constants/enum'
import { SEARCH_MESSAGE } from '~/constants/messages'
import { validate } from '~/utils/validate'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: SEARCH_MESSAGE.CONTENT_IS_STRING
        }
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)],
          errorMessage: SEARCH_MESSAGE.INVALID_MEDIA_TYPE
        }
      },
      people_follow: {
        optional: true,
        isIn: {
          options: [Object.values(PeoPleFollow)],
          errorMessage: SEARCH_MESSAGE.INVALID_PEOPLE_FOLLOW
        }
      }
    },
    ['query']
  )
)

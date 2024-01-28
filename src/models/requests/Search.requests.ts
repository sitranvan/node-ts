import { MediaTypeQuery, PeoPleFollow } from '~/constants/enum'
import { PaginationQuery } from './Common.requests'

export interface SearchQuery extends PaginationQuery {
  content: string
  media_type: MediaTypeQuery
  people_follow: PeoPleFollow
}

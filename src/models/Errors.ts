import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'

// Không kế thường từ Error vì nếu kế thừa thì express-validation sẽ chỉ nhận được message
type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
> // =>  { [key: string]: object }

/**
 * Nếu không dùng Record
 * type ErrorType = {
  [key: string]: {
    msg: string;
    location: string;
    value: any;
    path: string;
    [key: string]: any;
  };
};
 */

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

// Các lỗi liên quan đến validation
export class EntityError extends ErrorWithStatus {
  errors: ErrorType
  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}

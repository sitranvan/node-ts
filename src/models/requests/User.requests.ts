import { ParamsDictionary } from 'express-serve-static-core'
import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface LogoutRequestBody {
  refresh_token: string
}
export interface RefreshTokenRequestBody {
  refresh_token: string
}

export interface VerifyEmailRequestBody {
  email_verify_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  verify: UserVerifyStatus
  token_type: TokenType
}

export interface ForgotPasswordRequestBody {
  email: string
}

export interface ResetPasswordRequestBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface UpdateMeRequestBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface GetProfileRequestParams extends ParamsDictionary {
  username: string
}

// Vì kiểu ParamsDictionary mặc định không đáp ứng được tất các các param (trường hợp này không có user_id) truyền vào nên nếu không kế thừa từ ParamsDictionary sẽ báo lỗi
export interface UnfollowerRequestParams extends ParamsDictionary {
  user_id: string
}

export interface FollowRequestBody {
  followed_user_id: string
}

export interface ChangePasswordRequestBody {
  old_password: string
  password: string
  confirm_password: string
}

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
  exp: number
  iat: number
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

// Khai báo các kiểu dữ liệu cho swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: Tên đăng nhập
 *           example: it.sitranvan@gmail.com
 *         password:
 *           type: string
 *           description: Mật khẩu
 *           example: Si123@
 *
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         accsess_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjViMjFmMGY0OTkwMDA5YmUxNDE2OGY0IiwidG9rZW5fdHlwZSI6MCwidmVyaWZ5IjowLCJpYXQiOjE3MDYyNDAzMTQsImV4cCI6MTcwNjI0MTUxNH0.MjKYX-uR6bKhzkpspGf0Ay0PtTHQeG5CjjpxCmIaqq4
 *         refresh_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjViMjFmMGY0OTkwMDA9y642h, 65b21f0f4990009be14y642c
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: ObjectId
 *           example: 65b21f0f4990009be14168f4
 *         name:
 *           type: string
 *           example: Si Tran Van
 *         email:
 *           type: string
 *           example: it.sitranvan@gmail.com
 *         date_of_birth:
 *           type: string
 *           format: ISO8601
 *           example: 2002-06-03T08:30:00.000Z
 *         created_at:
 *           type: string
 *           format: ISO8601
 *           example: 2024-01-25T08:42:55.688Z
 *         updated_at:
 *           type: string
 *           format: ISO8601
 *           example: 2024-01-25T09:53:22.281Z
 *         verify:
 *           type: integer
 *           example: 1
 *         twitter_circle:
 *           type: 'array'
 *           items:
 *             type: string
 *             format: ObjectId
 *           example: [65b21f0f4990009be14y642h, 65b21f0f4990009be14y642c]
 *         bio:
 *           type: string
 *           example: No pain no gain
 *         location:
 *           type: string
 *           example: Ho Chi Minh
 *         website:
 *           type: string
 *           example: www.example.com
 *         username:
 *           type: string
 *           example: User65b21f0f4990009be14168f4
 *         avatar:
 *           type: string
 *           example: http://localhost:3000/images/avatars.jpeg
 *         cover_photo:
 *           type: string
 *           example: http://localhost:3000/images/avatars/sitran.jpeg
 *
 *     UserVerifyStatus:
 *       type: 'integer'
 *       example: 1
 *       enum: [Unverified, Verified, Banned]
 *
 */

import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'

import { USERS_MESSAGES } from '~/constants/messages'
import {
  ChangePasswordRequestBody,
  FollowRequestBody,
  ForgotPasswordRequestBody,
  GetProfileRequestParams,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  TokenPayload,
  UnfollowerRequestParams,
  UpdateMeRequestBody,
  VerifyEmailRequestBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schemas'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { wrapRequest } from '~/utils/handlers'

// Đăng nhập
export const loginController = wrapRequest(
  async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
    const user = req.user as User
    const user_id = user._id as ObjectId
    // Vì user_id là object nhưng bên usersService nhận vào là string
    const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
    return res.json({
      message: USERS_MESSAGES.LOGIN_SUCCESS,
      result
    })
  }
)

// Đăng ký
export const registerController = wrapRequest(
  async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
    const result = await usersService.register(req.body)
    return res.json({
      message: USERS_MESSAGES.REGISTER_SUCCESS,
      result
    })
  }
)

// Đăng xuất
export const logoutController = wrapRequest(
  async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
    const { refresh_token } = req.body
    const result = await usersService.logout(refresh_token)
    return res.json(result)
  }
)

// Refresh token
export const refreshTokenController = wrapRequest(
  async (req: Request<ParamsDictionary, any, RefreshTokenRequestBody>, res: Response) => {
    const { refresh_token } = req.body
    const { user_id, verify } = req.decoded_refresh_token as TokenPayload
    const result = await usersService.refreshToken({
      user_id,
      refresh_token,
      verify
    })
    return res.json({
      message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
      result
    })
  }
)

// Xác thực tài khoản
export const verifyEmailController = wrapRequest(
  async (req: Request<ParamsDictionary, any, VerifyEmailRequestBody>, res: Response) => {
    const { user_id } = req.decoded_email_verify_token as TokenPayload
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    // Không tìm thấy user
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    // Khi mà đã verify thì email_verify_token sẽ là rỗng
    // Không báo lỗi mà sẽ trả về status OK message là đã verify trước đó rồi
    if (user.email_verify_token === '') {
      return res.json({
        message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
      })
    }

    // Tiến hành verify
    const result = await usersService.verifyEmail(user_id)
    return res.json({
      message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
      result
    })
  }
)

// Gửi lại yêu cầu xác thực tài khoản
export const resendVerifyEmailController = wrapRequest(async (req: Request, res: Response) => {
  // Lấy thông tin người dùng kho đã verify access token thàn h công
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // Kiểm tra user đã verified hay chưa
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS
    })
  }

  // Tiến hành gửi lại xác thực email
  const result = await usersService.resendVerifyEmail(user_id)
  return res.json(result)
})

// Quên mật khẩu
export const forgotPasswordController = wrapRequest(
  async (req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>, res: Response) => {
    // const { email } = req.body
    const { _id, verify } = req.user as User
    const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
    return res.json(result)
  }
)

// Xác thực token forgot password
export const verifyForgotPasswordController = wrapRequest(
  async (req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>, res: Response) => {
    // Vì đã check bên validator nếu đã pass hết thì bên controller chỉ cần trả về thành công không cần gọi gì đến service
    return res.json({
      message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
    })
  }
)

// Reset mật khẩu
export const resetPasswordController = wrapRequest(
  async (req: Request<ParamsDictionary, any, ResetPasswordRequestBody>, res: Response) => {
    const { user_id } = req.decoded_forgot_password_token as TokenPayload
    const { password } = req.body
    const result = await usersService.resetPassword(user_id, password)
    return res.json(result)
  }
)

// Lấy thông tin cá nhân
export const getMeController = wrapRequest(async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    user
  })
})

// Cập nhật thông tin cá nhân
export const updateMeController = wrapRequest(
  async (req: Request<ParamsDictionary, any, UpdateMeRequestBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { body } = req
    const user = await usersService.updateMe(user_id, body)
    return res.json({
      message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
      user
    })
  }
)

// Get thông tin người dùng khác
export const getProfileController = wrapRequest(async (req: Request<GetProfileRequestParams>, res: Response) => {
  const { username } = req.params
  const user = await usersService.getProfile(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    user
  })
})

// Follower
export const followerController = wrapRequest(
  async (req: Request<ParamsDictionary, any, FollowRequestBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { followed_user_id } = req.body
    const result = await usersService.follower(user_id, followed_user_id)
    return res.json(result)
  }
)

// Unfollower
export const unFollowerController = wrapRequest(async (req: Request<UnfollowerRequestParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await usersService.unFollower(user_id, followed_user_id)
  return res.json(result)
})

// Thay đổi mật khẩu
export const changePasswordController = wrapRequest(
  async (req: Request<ParamsDictionary, any, ChangePasswordRequestBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { password } = req.body
    const result = await usersService.changePassword(user_id, password)
    return res.json(result)
  }
)

// Đăng nhập với google
export const oauthController = wrapRequest(async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await usersService.oauth(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.new_user}&verify=${result.verify}`
  return res.redirect(urlRedirect)
})

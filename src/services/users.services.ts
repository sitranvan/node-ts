import User from '~/models/schemas/User.schemas'
import databaseService from './database.services'
import { RegisterRequestBody, UpdateMeRequestBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.shemas'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import Follower from '~/models/schemas/Follower.schemas'
import axios from 'axios'

/**
 * Tập trung xử lý logic
 */

class UsersService {
  // Tạo access token
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  // Tạo refresh token
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  // Tạo email verify token
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  // Tạo forgot password token
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  // Tạo access_token và refreshtoken
  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  // Đăng ký
  async register(payload: RegisterRequestBody) {
    // Phải tự tạo user_id mới tạo được email_verify_token để tạo tài khoản
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        // Ghi đè date_of_birth để convert ISO string to date
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    console.log('Email verify token: ', email_verify_token)
    return {
      access_token,
      refresh_token
    }
  }

  // Đăng nhập
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify
    })
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }

  // Đăng xuất
  async logout(refresh_token: string) {
    await databaseService.refreshToken.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  // Refresh token
  async refreshToken({
    user_id,
    refresh_token,
    verify
  }: {
    user_id: string
    refresh_token: string
    verify: UserVerifyStatus
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify }),
      databaseService.refreshToken.deleteOne({ token: refresh_token })
    ])
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }

  // Xác thực tài khoản
  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id: user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
            // updated_at: new Date()
          },
          // Có 2 thời điểm tạo giá trị cập nhật new Date() và MongoDB cập nhật giá trị $currentDate chênh lệnh khoảng vài trăm miliseconds
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])
    // Tùy nghiệp vụ có thể verify xong thì trả về access_token, refresh_token và đăng nhập luôn, hoặc bảo người dùng tự đănng nhập
    const [access_token, refresh_token] = token
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  // Gửi lại yêu cầu xác thực tài khoản
  async resendVerifyEmail(user_id: string) {
    // Gửi email
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id,
      verify: UserVerifyStatus.Unverified
    })
    console.log('ResendVerifyEmail: ', email_verify_token)

    // Cập nhật lại email_verify_token
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  // Quên mật khẩu
  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    // Cập nhật
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    // Gửi email kèm đường link: https://twitter.com/forgot-password?token=${token}
    console.log('forgot password token: ', forgot_password_token)

    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  // Reset mật khẩu
  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    // Tùy nghiệp vụ nếu muốn đăng nhập luôn thì gửi về access_token và refresh_token
    return {
      messsage: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  // Lấy thông tin cá nhân
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        // Không muốn trả về
        projection: {
          // false or 0
          password: false,
          email_verify_token: false,
          forgot_password_token: false
        }
      }
    )
    return user
  }

  // Cập nhật thông tin cá nhân
  async updateMe(user_id: string, payload: UpdateMeRequestBody) {
    // findOneAndUpdate -> return document, updateOne -> not return document
    // Nếu có gửi lên date_of_birth thì chuyển sang kiểu date còn không thì trả về payload bình thường
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as UpdateMeRequestBody & { date_of_birth: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        // Trả về document sau khi update
        returnDocument: 'after',
        projection: {
          password: false,
          email_verify_token: false,
          forgot_password_token: false
        }
      }
    )
    return user
  }
  // Lấy thông tin người khác thông qua username
  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: false,
          email_verify_token: false,
          forgot_password_token: false,
          verify: false,
          created_at: false,
          update_at: false
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }

  // Folow
  async follower(user_id: string, followed_user_id: string) {
    // Kiểm tra xem đã follower người đó chưa
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower === null) {
      await databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
      return {
        message: USERS_MESSAGES.FOLLOWER_SUCCESS
      }
    }
    return {
      message: USERS_MESSAGES.FOLLOWED
    }
  }

  // Unfollower
  async unFollower(user_id: string, followed_user_id: string) {
    // Kiểm tra xem đã follower người đó chưa
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    // Không tìm thấy document tức là chưa followed người này
    if (follower === null) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED
      }
    }
    // Tìm thấy tức là đã follow tiến hành xóa
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: USERS_MESSAGES.UNFOLLOWED_SUCCESS
    }
  }

  // Thay đổi mật khẩu
  async changePassword(user_id: string, new_password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }

  // Lấy token từ googleapis
  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    // Gọi api
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    // Dùng Promise giống getGoogleUserInfo hoặc as data
    return data as {
      id_token: string
      access_token: string
    }
  }

  // Lấy thông tin người dùng từ google api
  private async getGoogleUserInfo(
    id_token: string,
    access_token: string
  ): Promise<{
    id: string
    email: string
    verified_email: boolean
    name: string
    given_name: string
    family_name: string
    picture: string
    locale: string
  }> {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data
  }

  // Đăng nhập với oauth google
  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(id_token, access_token)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    // Kiểm tra email đã đăng ký hay chưa
    const user = await databaseService.users.findOne({ email: userInfo.email })
    // Tồn tại cho login
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user?._id.toString(),
        verify: user.verify
      })
      await databaseService.refreshToken.insertOne(new RefreshToken({ user_id: user._id, token: refresh_token }))
      return {
        access_token,
        refresh_token,
        new_user: 0,
        verify: user.verify
      }
    } else {
      // Random string password
      const password = Math.random().toString(36).substring(2, 15)
      // Không thì đăng ký
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password,
        confirm_password: password
      })
      return { ...data, new_user: 1, verify: UserVerifyStatus.Unverified }
    }
  }
}

const usersService = new UsersService()
export default usersService

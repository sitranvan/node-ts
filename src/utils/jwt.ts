import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.requests'

type ParamsSignToken = {
  payload: string | Buffer | object
  privateKey: string
  options?: SignOptions
}
/**
 * Nếu không truyền object thì để giá trị mặc định cho privateKey vô nghĩa vì phải truyền đầy đủ 3 tham số
 * Nếu không chuyển sang object thì có thể đưa tham số privateKey về cuối cùng
 */

// Sign token
export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: ParamsSignToken) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw reject(error)
      }
      // Vì promise trả về string nếu không có as string thì TS nghĩ có thể token sẽ undefined
      resolve(token as string)
    })
  })
}

// Verify token
export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        throw reject(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}

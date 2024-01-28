import express from 'express'
import cors, { CorsOptions } from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { createServer } from 'http'
import swaggerUi from 'swagger-ui-express'
import defaultErrorHandler from './middlewares/error.middlewares.'
import handleRoutes from './routes/index.routes'
import databaseService from './services/database.services'
import { initFolder } from './utils/file'
import initSocket from './utils/socket'
import { openapiSpecification } from './utils/swagger'
import { envConfig, isProduction } from './constants/config'
import { limiter } from './utils/limit'

// Fake dữ liệu
// import '~/utils/fake'
const app = express()
const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*'
}
app.use(cors(corsOptions))
// Helmet giúp bảo mật ứng dụng bằng cách thiết lập các HTTP header
app.use(helmet())
// Soket io
const httpServer = createServer(app)
initSocket(httpServer)
// Tạo foder uploads
initFolder()

app.use(express.json())

// Rate limit
app.use(limiter)

// Swagger,
/**
 * Có 2 cách để tạo swagger docs nhưng thường sẽ dùng 1 file yaml để viết docs
 */

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))

// Kết nối database và tạo index
databaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshToken()
  databaseService.indexFollower()
  databaseService.indexTweet()
})

// Routes
handleRoutes(app)
// Xử lý lỗi
app.use(defaultErrorHandler)

httpServer.listen(envConfig.port, () => {
  console.log(`Example app listening on port ${envConfig.port}`)
})

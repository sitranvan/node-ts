import 'dotenv/config'
import express from 'express'
import defaultErrorHandler from './middlewares/error.middlewares.'
import handleRoutes from './routes/index.routes'
import databaseService from './services/database.services'
import { initFolder } from './utils/file'
import { UPLOAD_IMAGE_DIR } from './constants/dir'

const app = express()

// Tạo foder uploads
initFolder()

app.use(express.json())

// Kết nối database
databaseService.connect()

// Routes
handleRoutes(app)
// Xử lý lỗi
app.use(defaultErrorHandler)
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})

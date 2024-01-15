import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import mime from 'mime'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasServices from '~/services/medias.services'
import { wrapRequest } from '~/utils/handlers'

// Upload ảnh
export const uploadImageController = wrapRequest(async (req: Request, res: Response) => {
  const result = await mediasServices.uploadImage(req)
  return res.json({
    result,
    message: USERS_MESSAGES.UPLOAD_SUCCESS
  })
})

// Upload video
export const uploadVideoController = wrapRequest(async (req: Request, res: Response) => {
  const result = await mediasServices.uploadVideo(req)
  return res.json({
    result,
    message: USERS_MESSAGES.UPLOAD_SUCCESS
  })
})

// Sử lý static cách 2 thường dùng
export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params
  console.log(name)
  // Khuyến khích dùng đường dẫn tuyệt đối
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name + '.jpeg'), (err) => {
    if (err) {
      return res.status((err as any).status).send(USERS_MESSAGES.IMAGE_NOT_FOUND)
    }
  })
}

// Chỉ có tác dụng với image có vấn đề với video -> dùng serving mặc định của express hoạt động tốt
// Tuy nhiên ta có thể custom lại
export const serveVideoStreamController = (req: Request, res: Response) => {
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send(USERS_MESSAGES.RANGE_NOT_FOUND)
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name) // Lấy ra đường dẫn video
  // 1MB = 10^6 bytes (Tính theo hệ thập phân)
  // 1MB = 2^20 bytes (Tính theo hệ nhị phân)

  // Dung lượng video
  const videoSize = fs.statSync(videoPath).size
  // Dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 10 ** 6 // 1MB

  // Lấy giá trị byte bắt đầu từ header Range, /\D/g là regex để lấy ra số từ chuỗi
  const start = Number(range.replace(/\D/g, '')) // 0
  // Lấy giá trị byte kết thúc từ header Range, vượt qua giới hạn thì lấy giá trị cuối cùng
  const end = Math.min(start + chunkSize, videoSize - 1)
  // Dung lượng thực tế cho mỗi phân đoạn stream
  // Thường đây sẽ là chunkSize, ngoại trừ đoạn cuối cùng
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  // Trả về status 206 Partial Content, writeHead để set header cho response trước khi pipe stream vào response
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  // Tạo stream từ videoPath
  const videoStream = fs.createReadStream(videoPath, { start, end })
  // Pipe stream vào response
  videoStream.pipe(res)
}

import { Request, Response } from 'express'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFromFullname, hanldeUploadImage, hanldeUploadVideo } from '~/utils/file'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Orther'

class MediasServices {
  async uploadImage(req: Request) {
    const files = await hanldeUploadImage(req)
    // Vì upload nhiều file nên dùng Promise.all để tiết kiệm thời gian
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpeg`)
        // Chuyển đổi hình ảnh thành jpeg
        await sharp(file.filepath).jpeg().toFile(newPath)
        // Xóa file tạm lưu trong thư mục temp
        // fs.unlinkSync(file.filepath)

        // Mỗi một lần return sẽ trả về 1 url vì promise.all trả về 1 mảng
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpeg`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpeg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await hanldeUploadVideo(req)
    const { newFilename } = files[0]
    return {
      url: isProduction
        ? `${process.env.HOST}/static/video/${newFilename}`
        : `http://localhost:${process.env.PORT}/static/video/${newFilename}`,
      type: MediaType.Video
    }
  }
}
const mediasServices = new MediasServices()
export default mediasServices

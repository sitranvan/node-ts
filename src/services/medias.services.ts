import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { Request } from 'express'
import fs from 'fs'
import fsPromise from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
import { getNameFromFullname, hanldeUploadImage, hanldeUploadVideo } from '~/utils/file'
import { uploadFileToS3 } from '~/utils/s3'
class MediasServices {
  async uploadImage(req: Request) {
    const files = await hanldeUploadImage(req)
    // Vì upload nhiều file nên dùng Promise.all để tiết kiệm thời gian
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newFullFileName = `${newName}.jpeg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFileName)
        // Chuyển đổi hình ảnh thành jpeg
        await sharp(file.filepath).jpeg().toFile(newPath)
        // Upload lên s3
        const s3Result = await uploadFileToS3({
          filename: 'images/' + newFullFileName, // Thêm /images/ sẽ tự động tạo thư mục trong s3
          filepath: newPath,
          contentType: file.mimetype as string // 'image/jpeg'
        })
        // Xóa file tạm lưu trong thư mục temp Nếu dùng s3 xóa luôn file gốc trong uploads
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        const url = (s3Result as CompleteMultipartUploadCommandOutput).Location as string
        return {
          url,
          type: MediaType.Image
        }

        // Mỗi một lần return sẽ trả về 1 url vì promise.all trả về 1 mảng, upload trực tiếp vào src
        // return {
        //   url: isProduction
        //     ? `${envConfig.host}/static/image/${newFullFileName}`
        //     : `http://localhost:${envConfig.port}/static/image/${newFullFileName}`,
        //   type: MediaType.Image
        // }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await hanldeUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        // Upload lên s3
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename, // Thêm /images/ sẽ tự động tạo thư mục trong s3
          filepath: file.filepath,
          contentType: file.mimetype as string
        })
        fs.unlinkSync(file.filepath)
        const url = (s3Result as CompleteMultipartUploadCommandOutput).Location as string
        return {
          url,
          type: MediaType.Video
        }
      })
    )
    // upload trực tiếp vào src
    // const { newFilename } = files[0]
    // return {
    //   url: isProduction
    //     ? `${envConfig.host}/static/videos/${newFilename}`
    //     : `http://localhost:${envConfig.port}/videos/${newFilename}`,
    //   type: MediaType.Video
    // }
    return result
  }
}
const mediasServices = new MediasServices()
export default mediasServices

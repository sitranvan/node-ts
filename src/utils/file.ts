import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

// Tạo folder upload nếu chưa tồn tại
export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // Mục đích là để tạo folder netsed
      })
    }
  })
}

// Upload ảnh với formidable
export const hanldeUploadImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR, // Đường dẫn thư mục chứa file
    maxFiles: 4, // Upload 4 file
    keepExtensions: true, // lấy luôn đuôi mở rộng
    maxFieldsSize: 300 * 1024, // 300kb
    maxTotalFileSize: 300 * 1024 * 4, // Mỗi hình 300kb, tối đa 4 hình
    filter: function ({ name, originalFilename, mimetype }) {
      // Kiểm tra đuôi file
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // Xử lý nếu không gửi file lên, nếu không gửi lên err sẽ là null nên vượt qua reject
      if (!files.image) {
        return reject(new Error('File is not found'))
      }
      resolve(files.image as File[])
    })
  })
}

// Upload video với formidable
export const hanldeUploadVideo = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR, // Đường dẫn thư mục chứa file
    maxFiles: 1, // Upload 1 file
    maxFieldsSize: 50 * 1024 * 1024, // 50MB
    filter: function ({ name, originalFilename, mimetype }) {
      // Kiểm tra đuôi file, chỉ cho phép upload mp4 và quicktime, quicktime là đuôi mở rộng MOV
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // Xử lý nếu không gửi file lên, nếu không gửi lên err sẽ là null nên vượt qua reject
      if (!files.video) {
        return reject(new Error('File is not found'))
      }

      // Một số trường hợp đuôi mở rộng bị lỗi hoặc sai tên .app
      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + '.' + ext)
        video.newFilename = video.newFilename + '.' + ext
      })
      resolve(files.video as File[])
    })
  })
}

// Lấy tên mới trả về từ file
export const getNameFromFullname = (fullname: string) => {
  const nameArr = fullname.split('.')
  nameArr.pop()
  return nameArr.join('')
}

export const getExtension = (fullname: string) => {
  const nameArr = fullname.split('.')
  return nameArr[nameArr.length - 1]
}

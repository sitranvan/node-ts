import 'dotenv/config'
import { IncomingMessage, ServerResponse } from 'http'
import { ObjectId } from 'mongodb' // Soket io
import { Server } from 'socket.io'
import { Server as ServerHTTP } from 'http'
import Conversation from '~/models/schemas/Coversation.schemas'
import databaseService from '~/services/database.services'

/**
 *
 * Xử lí midderware socket xác thực người dùng,người dùng đã verify thì mới kết nối được, người dùng không đăng nhập không truyền lên access token thì không kết nối được... xử lý bổ sung nếu cần thiết
 */

const initSocket = (httpServer: ServerHTTP) => {
  const io = new Server(httpServer, {
    cors: {
      // Cho phép domain http://localhost:4000 kết nối
      origin: 'http://localhost:4000'
    }
  })

  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}

  // Khi có người kết nối
  io.on('connection', (socket) => {
    console.log(`${socket.id} connected`)
    const user_id = socket.handshake.auth._id
    users[user_id] = {
      socket_id: socket.id
    }
    console.log(users)
    socket.on('chat', async (data) => {
      const { receiver_id, sender_id, content } = data.payload
      console.log(data.payload)
      console.log(receiver_id, sender_id)
      const receiver_socket_id = users[receiver_id]?.socket_id
      if (!receiver_socket_id) return
      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id), // Thông tin người gửi
        receiver_id: new ObjectId(receiver_id), // Thông tin người nhận
        content
      })
      const result = await databaseService.conversations.insertOne(conversation)
      conversation._id = result.insertedId
      socket.to(receiver_socket_id).emit('receiver_chat', {
        payload: conversation
      })
    })

    // Khi có người ngắt kết nối
    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`${socket.id} disconnected`)
    })
  })
}

export default initSocket

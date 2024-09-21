import express from "express"
import { Server, createServer } from "node:http"
import { Server as Io } from "socket.io"

type MessageProps = {
  username: string
  userId: string
  message: string
  roomName: string
}

type JoinChatProps = {
  username: string
  userId: string
  roomName: string
}

export class App {
  app: express.Application
  server: Server
  private socketIo: Io
  private messages: Record<string, MessageProps[]> = {}

  constructor() {
    this.app = express()
    this.server = createServer(this.app)
    this.socketIo = new Io(this.server, {
      cors: {
        origin: "*",
      },
    })

    this.socketIo.on("connection", (socket) => {
      console.log(`Usuário conectado | ID - ${socket.id}`)

      socket.on("joinChat", (data: JoinChatProps) => {
        const roomName = data.roomName

        socket.join(roomName)

        // Enviar mensagens já armazenadas para o usuário que entrou na sala
        if (this.messages[roomName]) {
          this.messages[roomName].forEach((msg) => {
            socket.emit("messages", msg) // Aqui não precisa de alteração
          })
        }
      })

      // Enviar mensagens para a sala específica
      socket.on("sendMessage", (message: MessageProps) => {
        const roomName = message.roomName

        // Armazenar a mensagem
        if (!this.messages[roomName]) {
          this.messages[roomName] = []
        }
        this.messages[roomName].push(message)

        // Emitir a mensagem para todos na sala
        this.socketIo.to(roomName).emit("messages", message)
      })

      // Evento para recuperar mensagens da sala
      socket.on("messages", (roomName: string) => {
        if (this.messages[roomName]) {
          socket.emit("messages", this.messages[roomName])
        }
      })

      // Desconectar
      socket.on("disconnect", () => {
        console.log(`Usuário desconectado | ID - ${socket.id}`)
      })
    })
  }
}

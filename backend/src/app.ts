import express from "express"
import { Server, createServer } from "node:http"
import { Server as Io } from "socket.io"
import { prisma } from "./libs/prisma"

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
  // private messages: Record<string, MessageProps[]> = {}

  constructor() {
    this.app = express()
    this.server = createServer(this.app)
    this.socketIo = new Io(this.server, {
      cors: {
        origin: "*",
      },
    })

    this.socketIo.on("connection", (socket) => {
      socket.on("joinChat", async (data: JoinChatProps) => {
        const roomName = data.roomName

        socket.join(roomName)

        const allMessages = await prisma.message.findMany({
          where: {
            roomName: roomName,
          },
        })

        // Enviar mensagens já armazenadas para o usuário que entrou na sala
        allMessages.forEach((msg) => {
          socket.emit("messages", msg)
        })
      })

      // Enviar mensagens para a sala específica
      socket.on("sendMessage", async (message: MessageProps) => {
        const roomName = message.roomName

        // Emitir a mensagem para todos na sala
        this.socketIo.to(roomName).emit("messages", message)

        // Salva a mensagem em background
        await prisma.message.create({
          data: message,
        })
      })

      // Evento para recuperar mensagens da sala
      socket.on("messages", async (roomName: string) => {
        const rooms = await prisma.message.findMany({
          where: {
            roomName: roomName,
          },
        })

        if (rooms.length) {
          socket.emit("messages", rooms)
        }
      })

      // Desconectar
      socket.on("disconnect", () => {
        console.log(`Usuário desconectado | ID - ${socket.id}`)
      })
    })
  }
}

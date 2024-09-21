"use client";

import { JoinChatProps, MessageProps, socket } from "@/libs/socket";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type MessageRequest = Omit<MessageProps, "id">;

const example = "?user_id=1&username=Alfredo&roomname=lobyme";

export default function Home() {
  const [currentMessage, setCurrentMessage] = useState<MessageRequest>(
    {} as MessageRequest
  );
  const [messages, setMessages] = useState<MessageProps[]>([]);

  const search = useSearchParams();

  const userId = search.get("user_id");
  const username = search.get("username");
  const roomName = search.get("roomname");

  if (!userId || !username || !roomName) return null;

  useEffect(() => {
    const data: JoinChatProps = {
      roomName: roomName!,
      userId: userId!,
      username: username!,
    };

    // Entrar na sala
    socket.emit("joinChat", data);

    // Receber mensagens
    socket.on("messages", (msg) => {
      // Verifica se a mensagem já existe antes de adicioná-la
      setMessages((prevMessages) => {
        if (
          !prevMessages.some(
            (m) => m.message === msg.message && m.userId === msg.userId
          )
        ) {
          return [...prevMessages, msg];
        }
        return prevMessages;
      });
    });

    // Limpar eventos ao desmontar
    return () => {
      socket.off("messages");
    };
  }, [userId, username, roomName]);

  const sendMessage = () => {
    if (currentMessage.message) {
      const messageData = {
        ...currentMessage,
        roomName: roomName!,
      };

      // Envia a mensagem ao servidor
      socket.emit("sendMessage", messageData);

      // Limpa o input
      setCurrentMessage({ username, userId, message: "", roomName: roomName! });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <p>User ID: {userId}</p>
        <p>User Name: {username}</p>
        <p>Room Name: {roomName}</p>
      </div>
      <input
        type="text"
        className="border-2 border-white"
        onChange={(e) =>
          setCurrentMessage(() => ({
            message: e.target.value,
            roomName: roomName!,
            userId: userId!,
            username: username!,
          }))
        }
        value={currentMessage.message}
      />
      <button onClick={sendMessage}>Enviar</button>

      <ul>
        {messages.map((message) =>
          message.userId === userId ? (
            <li className="flex justify-end" key={message.id}>
              <p>
                <strong>{message.username}:</strong> {message.message}
              </p>
            </li>
          ) : (
            <li className="flex justify-start" key={message.id}>
              <p>
                <strong>{message.username}:</strong> {message.message}
              </p>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

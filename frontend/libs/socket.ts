import { io } from "socket.io-client";

export type MessageProps = {
  username: string;
  userId: string;
  message: string;
  roomName: string;
};

export type JoinChatProps = {
  username: string;
  userId: string;
  roomName: string;
};

export const socket = io("http://localhost:4444");

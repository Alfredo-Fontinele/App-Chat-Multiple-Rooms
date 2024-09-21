-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

import { getRoomById, getRoomParticipants } from "@/lib/room-actions"
import { notFound } from "next/navigation"
import { RoomClient } from "./room-client"

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await getRoomById(id)

  if (!room) {
    notFound()
  }

  const participants = await getRoomParticipants(id)

  return <RoomClient room={room} initialParticipants={participants} />
}

import { getRooms } from "@/lib/room-actions"
import Link from "next/link"
import { MessageCircle, Mic, Users, Plus } from "lucide-react"
import { CreateRoomDialog } from "@/components/create-room-dialog"

export default async function HomePage() {
  const rooms = await getRooms()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Clean Professional Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Pain House
            </h1>
            <p className="text-lg text-slate-700 dark:text-slate-300" dir="rtl">
              خانه درد
            </p>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Anonymous support rooms for sharing stories and healing together
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Create Room Section */}
        <div className="mb-12 text-center">
          <CreateRoomDialog locale="en" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
            Create your own support room or join an existing one below
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link key={room.id} href={`/room/${room.id}`}>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow hover:shadow-lg transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      {room.room_type === "audio" ? (
                        <Mic className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <MessageCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{room.capacity}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {room.name}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3" dir="rtl">
                  {room.name_fa}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {room.description}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400" dir="rtl">
                  {room.description_fa}
                </p>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                    Enter Room →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">
              No rooms available yet
            </p>
            <p className="text-slate-600 dark:text-slate-400" dir="rtl">
              هنوز اتاقی در دسترس نیست
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
              Run the database setup scripts to create default rooms
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Completely anonymous • Always supportive • Forever safe
          </p>
        </div>
      </footer>
    </div>
  )
}

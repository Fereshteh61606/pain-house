"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, MessageCircle, Mic } from "lucide-react"
import { createRoom } from "@/lib/room-creation-actions"

interface CreateRoomDialogProps {
  locale: "en" | "fa"
}

export function CreateRoomDialog({ locale }: CreateRoomDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [roomType, setRoomType] = useState<"text" | "audio">("text")
  const [formData, setFormData] = useState({
    name: "",
    name_fa: "",
    description: "",
    description_fa: "",
    capacity: 20,
  })

  async function handleCreate() {
    setIsCreating(true)

    const result = await createRoom({
      ...formData,
      room_type: roomType,
    })

    if (result.success && result.roomId) {
      setOpen(false)
      router.push(`/room/${result.roomId}`)
      router.refresh()
    } else {
      alert(result.error || "Failed to create room")
    }

    setIsCreating(false)
  }

  return (
    <Dialog open={open} onChangeChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6 py-3 text-base font-semibold shadow hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          {locale === "en" ? "Create Your Own Room" : "اتاق خود را بسازید"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100">
            {locale === "en" ? "Create Your Safe Space" : "فضای امن خود را بسازید"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Room Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {locale === "en" ? "Room Type" : "نوع اتاق"}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRoomType("text")}
                className={`flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-semibold transition-all ${
                  roomType === "text"
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-teal-500"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                {locale === "en" ? "Text Chat" : "چت متنی"}
              </button>
              <button
                onClick={() => setRoomType("audio")}
                className={`flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-semibold transition-all ${
                  roomType === "audio"
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-teal-500"
                }`}
              >
                <Mic className="w-5 h-5" />
                {locale === "en" ? "Voice Room" : "اتاق صوتی"}
              </button>
            </div>
          </div>

          {/* English Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              {locale === "en" ? "Room Name (English)" : "نام اتاق (انگلیسی)"}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Heartbreak Support"
              className="h-11 text-base rounded-lg border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-500"
            />
          </div>

          {/* Persian Name */}
          <div className="space-y-2">
            <Label htmlFor="name_fa" className="text-base font-semibold">
              {locale === "en" ? "Room Name (Persian)" : "نام اتاق (فارسی)"}
            </Label>
            <Input
              id="name_fa"
              value={formData.name_fa}
              onChange={(e) => setFormData({ ...formData, name_fa: e.target.value })}
              placeholder="مثال: حمایت از شکست عشقی"
              className="h-11 text-base rounded-lg border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-500"
              dir="rtl"
            />
          </div>

          {/* English Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              {locale === "en" ? "Description (English)" : "توضیحات (انگلیسی)"}
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A safe space for..."
              className="h-11 text-base rounded-lg border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-500"
            />
          </div>

          {/* Persian Description */}
          <div className="space-y-2">
            <Label htmlFor="description_fa" className="text-base font-semibold">
              {locale === "en" ? "Description (Persian)" : "توضیحات (فارسی)"}
            </Label>
            <Input
              id="description_fa"
              value={formData.description_fa}
              onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })}
              placeholder="فضایی امن برای..."
              className="h-11 text-base rounded-lg border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-500"
              dir="rtl"
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-base font-semibold">
              {locale === "en" ? "Room Capacity (2-50 people)" : "ظرفیت اتاق (۲-۵۰ نفر)"}
            </Label>
            <Input
              id="capacity"
              type="number"
              min={2}
              max={50}
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 20 })}
              className="h-11 text-base rounded-lg border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-500"
            />
          </div>

          {/* Info Box */}
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {locale === "en"
                ? "🔒 Your room will be a safe, anonymous space where people can share their stories and support each other."
                : "🔒 اتاق شما یک فضای امن و ناشناس خواهد بود که در آن افراد می توانند داستان های خود را به اشتراک بگذارند."}
            </p>
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={
              isCreating ||
              !formData.name.trim() ||
              !formData.name_fa.trim() ||
              !formData.description.trim() ||
              !formData.description_fa.trim()
            }
            size="lg"
            className="w-full h-12 text-base font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg transition-all"
          >
            {isCreating
              ? locale === "en"
                ? "Creating..."
                : "در حال ساخت..."
              : locale === "en"
                ? "Create Room"
                : "ساخت اتاق"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

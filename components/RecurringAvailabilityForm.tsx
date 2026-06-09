"use client"
import { useState } from "react"
import { upsertRecurringAvailability } from "@/lib/actions/recurring"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

type TimeWindow = { startTime: string; endTime: string }
type RecurringAvailability = {
  id: number
  dayOfWeek: number
  windows: TimeWindow[]
}

export default function RecurringAvailabilityForm({
  staffMemberId,
  recurring,
}: {
  staffMemberId: number
  recurring: RecurringAvailability[]
}) {
  const [selectedDay, setSelectedDay] = useState(1)
  const [windows, setWindows] = useState<TimeWindow[]>([{ startTime: "09:00", endTime: "17:00" }])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Load existing windows when day changes
  function handleDayChange(day: number) {
    setSelectedDay(day)
    const existing = recurring.find(r => r.dayOfWeek === day)
    setWindows(existing ? existing.windows : [{ startTime: "09:00", endTime: "17:00" }])
    setError("")
    setSuccess("")
  }

  function addWindow() {
    setWindows([...windows, { startTime: "09:00", endTime: "17:00" }])
  }

  function removeWindow(index: number) {
    setWindows(windows.filter((_, i) => i !== index))
  }

  function updateWindow(index: number, field: "startTime" | "endTime", value: string) {
    setWindows(windows.map((w, i) => i === index ? { ...w, [field]: value } : w))
  }

  async function handleSave() {
    setError("")
    setSuccess("")
    try {
      await upsertRecurringAvailability(staffMemberId, selectedDay, windows)
      setSuccess("Saved!")
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="border rounded-lg p-4">
      {/* Day selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {DAYS.map((day, i) => {
          const hasAvailability = recurring.some(r => r.dayOfWeek === i)
          return (
            <button
              key={i}
              onClick={() => handleDayChange(i)}
              className={`px-3 py-1 rounded text-sm border ${
                selectedDay === i
                  ? "bg-blue-600 text-white border-blue-600"
                  : hasAvailability
                  ? "bg-green-100 border-green-400 text-green-800"
                  : "bg-white border-gray-300 text-gray-600"
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Time windows */}
      <div className="space-y-2 mb-4">
        {windows.map((window, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="time"
              value={window.startTime}
              onChange={e => updateWindow(i, "startTime", e.target.value)}
              className="border rounded px-2 py-1"
            />
            <span className="text-gray-500">to</span>
            <input
              type="time"
              value={window.endTime}
              onChange={e => updateWindow(i, "endTime", e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button
              onClick={() => removeWindow(i)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={addWindow}
          className="text-sm text-blue-600 hover:underline"
        >
          + Add time window
        </button>
        <button
          onClick={handleSave}
          className="ml-auto bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
        >
          Save {DAYS[selectedDay]}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
    </div>
  )
}
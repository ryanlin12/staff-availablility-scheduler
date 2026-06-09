"use client"
import { useState } from "react"
import { getRecurringAvailability } from "@/lib/actions/recurring"
import { getOverrides } from "@/lib/actions/overrides"
import { calculateAvailability } from "@/lib/scheduling"

const DURATIONS = [15, 30, 45, 60]

type DayAvailability = {
    date: string
    source: "recurring" | "override" | "none"
    slots: string[]
}

const SOURCE_LABELS = {
    recurring: { label: "Recurring", className: "text-blue-600 text-xs" },
    override: { label: "Override", className: "text-orange-500 text-xs" },
    none: { label: "No availability", className: "text-gray-400 text-xs" },
}

function formatTime(time: string) {
    const [hours, minutes] = time.split(":").map(Number)
    const ampm = hours >= 12 ? "PM" : "AM"
    const h = hours % 12 || 12
    return `${h}:${minutes.toString().padStart(2, "0")} ${ampm}`
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

export default function SlotViewer({ staffMemberId }: { staffMemberId: number }) {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [duration, setDuration] = useState(30)
    const [results, setResults] = useState<DayAvailability[]>([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSearch() {
        setError("")
        if (!startDate || !endDate) {
            setError("Please select a start and end date")
            return
        }
        if (startDate > endDate) {
            setError("Start date must be before end date")
            return
        }
        setLoading(true)
        try {
            const recurring = await getRecurringAvailability(staffMemberId)
            const overrides = (await getOverrides(staffMemberId)).map((override) => ({
                ...override,
                type: override.type as "replace" | "unavailable" | "add",
            }))
            const slots = calculateAvailability(recurring, overrides, startDate, endDate, duration)
            setResults(slots)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="border rounded-lg p-4">
            <div className="flex flex-wrap gap-3 mb-4">
                <div>
                    <label className="text-sm font-medium block mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium block mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium block mb-1">Duration</label>
                    <select
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                        className="border rounded px-2 py-1"
                    >
                        {DURATIONS.map(d => (
                            <option key={d} value={d}>{d} minutes</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Search"}
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {results.length > 0 && (
                <div className="space-y-4 mt-4">
                    {results.map(day => (
                        <div key={day.date} className="border-t pt-3">
                            <div className="flex items-center gap-2 mb-2">
                                <p className="font-medium">{formatDate(day.date)}</p>
                                <span className={SOURCE_LABELS[day.source].className}>
                                    ({SOURCE_LABELS[day.source].label})
                                </span>
                            </div>
                            {day.slots.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {day.slots.map(slot => (
                                        <span key={slot} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                            {formatTime(slot)}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">
                                    {day.source === "override" ? "Unavailable due to override" : "No availability"}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
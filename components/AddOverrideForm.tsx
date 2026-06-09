"use client"
import { useState } from "react"
import { createOverride } from "@/lib/actions/overrides"
import { validateWindows } from "@/lib/scheduling";

type TimeWindow = { startTime: string; endTime: string }
type OverrideType = "unavailable" | "replace" | "add"

export default function AddOverrideForm({ staffMemberId }: { staffMemberId: number }) {
    const [date, setDate] = useState("")
    const [type, setType] = useState<OverrideType>("unavailable")
    const [windows, setWindows] = useState<TimeWindow[]>([{ startTime: "09:00", endTime: "17:00" }])
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    function addWindow() {
        setWindows([...windows, { startTime: "09:00", endTime: "17:00" }])
    }

    function removeWindow(index: number) {
        setWindows(windows.filter((_, i) => i !== index))
    }

    function updateWindow(index: number, field: "startTime" | "endTime", value: string) {
        setWindows(windows.map((w, i) => i === index ? { ...w, [field]: value } : w))
    }

    async function handleSubmit() {
        setError("")
        setSuccess("")
        if (!date) {
            setError("Date is required")
            return
        }

        if (type !== "unavailable") {
            const validationError = validateWindows(windows)
            if (validationError) {
                setError(validationError)
                return
            }
            if (windows.length === 0) {
                setError("At least one time window is required")
                return
            }
        }

        try {
            await createOverride(staffMemberId, date, type, type === "unavailable" ? [] : windows)
            setDate("")
            setType("unavailable")
            setWindows([{ startTime: "09:00", endTime: "17:00" }])
            setSuccess("Override added!")
        } catch (e: any) {
            setError(e.message)
        }
    }

    return (
        <div className="border rounded-lg p-4 mb-4">
            <div className="flex flex-col gap-3">
                {/* Date */}
                <div>
                    <label className="text-sm font-medium block mb-1">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="border rounded px-2 py-1"
                    />
                </div>

                {/* Type */}
                <div>
                    <label className="text-sm font-medium block mb-1">Override Type</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value as OverrideType)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="unavailable">Unavailable all day</option>
                        <option value="replace">Replace with custom hours</option>
                        <option value="add">Add extra hours</option>
                    </select>
                </div>

                {/* Windows (only for replace/add) */}
                {type !== "unavailable" && (
                    <div>
                        <label className="text-sm font-medium block mb-1">Time Windows</label>
                        <div className="space-y-2">
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
                                        className="text-red-500 text-sm hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addWindow}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                + Add window
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 self-start"
                >
                    Add Override
                </button>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">{success}</p>}
            </div>
        </div>
    )
}
"use client"
import { deleteOverride } from "@/lib/actions/overrides"

type TimeWindow = { startTime: string; endTime: string }
type Override = {
    id: number
    date: string
    type: string
    windows: TimeWindow[]
}

const TYPE_LABELS: Record<string, string> = {
    unavailable: "Unavailable all day",
    replace: "Custom hours",
    add: "Extra hours",
}

export default function OverridesList({ overrides }: { overrides: Override[] }) {
    if (overrides.length === 0) {
        return <p className="text-gray-500 text-sm">No overrides yet.</p>
    }

    return (
        <ul className="space-y-2">
            {overrides.map(override => (
                <li key={override.id} className="border rounded-lg px-4 py-3 flex items-start justify-between">
                    <div>
                        <p className="font-medium">{override.date}</p>
                        <p className="text-sm text-gray-500">{TYPE_LABELS[override.type]}</p>
                        {override.windows.length > 0 && (
                            <ul className="text-sm text-gray-600 mt-1">
                                {override.windows.map((w, i) => (
                                    <li key={i}>{w.startTime} – {w.endTime}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button
                        onClick={() => deleteOverride(override.id)}
                        className="text-red-500 hover:text-red-700 text-sm ml-4"
                    >
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    )
}
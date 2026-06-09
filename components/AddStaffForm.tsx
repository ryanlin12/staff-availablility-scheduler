"use client"
import { useState } from "react"
import { createStaff } from "@/lib/actions/staff"

export default function AddStaffForm() {
    const [name, setName] = useState("")
    const [error, setError] = useState("")

    async function handleSubmit() {
        if (!name.trim()) {
            setError("Name is required")
            return
        }
        try {
            await createStaff(name)
            setName("")
            setError("")
        } catch (e) {
            setError("Failed to create staff member")
        }
    }

    return (
        <div className="flex gap-2 mb-4">
            <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Staff member name"
                className="border rounded px-3 py-2 flex-1"
            />
            <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Add Staff
            </button>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    )
}
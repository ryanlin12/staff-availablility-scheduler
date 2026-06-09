"use client"
import { deleteStaff } from "@/lib/actions/staff"
import Link from "next/link"

type Staff = {
  id: number
  name: string
  createdAt: Date
}

export default function StaffList({ staff }: { staff: Staff[] }) {
  if (staff.length === 0) {
    return <p className="text-gray-500">No staff members yet. Add one above.</p>
  }

  return (
    <ul className="space-y-2">
      {staff.map(member => (
        <li key={member.id} className="flex items-center justify-between border rounded px-4 py-3">
          <Link href={`/staff/${member.id}`} className="text-blue-600 hover:underline font-medium">
            {member.name}
          </Link>
          <button
            onClick={() => deleteStaff(member.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
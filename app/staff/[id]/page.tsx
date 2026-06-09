import { getStaff } from "@/lib/actions/staff"
import { getRecurringAvailability } from "@/lib/actions/recurring"
import { getOverrides } from "@/lib/actions/overrides"
import RecurringAvailabilityForm from "@/components/RecurringAvailabilityForm"
import OverridesList from "@/components/OverridesList"
import AddOverrideForm from "../../../components/AddOverrideForm"
import SlotViewer from "../../../components/SlotViewer"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  
  const allStaff = await getStaff()
  const staff = allStaff.find(s => s.id === id)

  if (!staff) notFound()

  const recurring = await getRecurringAvailability(id)
  const overrides = await getOverrides(id)

  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline text-sm mb-6 block">
        ← Back to staff list
      </Link>

      <h1 className="text-3xl font-bold mb-8">{staff.name}</h1>

      {/* Recurring Availability */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Recurring Weekly Availability</h2>
        <RecurringAvailabilityForm staffMemberId={id} recurring={recurring} />
      </section>

      {/* Overrides */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Date Overrides</h2>
        <AddOverrideForm staffMemberId={id} />
        <OverridesList overrides={overrides} />
      </section>

      {/* Slot Viewer */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">View Available Slots</h2>
        <SlotViewer staffMemberId={id} />
      </section>
    </main>
  )
}
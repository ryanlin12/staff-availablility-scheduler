import { getStaff } from "@/lib/actions/staff"
import StaffList from "../components/StaffList"
import AddStaffForm from "../components/AddStaffForm"

export default async function Home() {
  const staff = await getStaff()

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Staff Availability Scheduler</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Staff Members</h2>
        <AddStaffForm />
        <StaffList staff={staff} />
      </section>
    </main>
  )
}
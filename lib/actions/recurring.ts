"use server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getRecurringAvailability(staffMemberId: number) {
  return await prisma.recurringAvailability.findMany({
    where: { staffMemberId },
    include: { windows: true },
    orderBy: { dayOfWeek: "asc" }
  })
}

export async function upsertRecurringAvailability(
  staffMemberId: number,
  dayOfWeek: number,
  windows: { startTime: string; endTime: string }[]
) {
  for (const window of windows) {
    if (window.startTime >= window.endTime) {
      throw new Error("Start time must be before end time")
    }
  }

  const existing = await prisma.recurringAvailability.findFirst({
    where: { staffMemberId, dayOfWeek }
  })

  if (existing) {
    await prisma.recurringAvailability.delete({ where: { id: existing.id } })
  }

  if (windows.length === 0) {
    revalidatePath("/")
    return
  }

  await prisma.recurringAvailability.create({
    data: {
      staffMemberId,
      dayOfWeek,
      windows: {
        create: windows.map(w => ({
          startTime: w.startTime,
          endTime: w.endTime
        }))
      }
    }
  })

  revalidatePath("/")
}
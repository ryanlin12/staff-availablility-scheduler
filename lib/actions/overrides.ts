"use server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getOverrides(staffMemberId: number) {
  return await prisma.availabilityOverride.findMany({
    where: { staffMemberId },
    include: { windows: true },
    orderBy: { date: "asc" }
  })
}

export async function createOverride(
  staffMemberId: number,
  date: string,
  type: "unavailable" | "replace" | "add",
  windows: { startTime: string; endTime: string }[]
) {
  if (type !== "unavailable" && windows.length === 0) {
    throw new Error("Windows are required for replace and add overrides")
  }

  for (const window of windows) {
    if (window.startTime >= window.endTime) {
      throw new Error("Start time must be before end time")
    }
  }

  // Only one override per staff member per date
  const existing = await prisma.availabilityOverride.findFirst({
    where: { staffMemberId, date }
  })
  if (existing) {
    await prisma.availabilityOverride.delete({ where: { id: existing.id } })
  }

  await prisma.availabilityOverride.create({
    data: {
      staffMemberId,
      date,
      type,
      windows: { create: windows }
    }
  })

  revalidatePath("/")
}

export async function deleteOverride(id: number) {
  await prisma.availabilityOverride.delete({ where: { id } })
  revalidatePath("/")
}
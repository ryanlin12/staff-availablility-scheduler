"use server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getStaff() {
  return await prisma.staffMember.findMany({
    orderBy: { createdAt: "asc" }
  })
}

export async function createStaff(name: string) {
  if (!name?.trim()) throw new Error("Name is required")
  const staff = await prisma.staffMember.create({
    data: { name: name.trim() }
  })
  revalidatePath("/")
  return staff
}

export async function deleteStaff(id: number) {
  await prisma.staffMember.delete({ where: { id } })
  revalidatePath("/")
}
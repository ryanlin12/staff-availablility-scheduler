import { PrismaClient } from "../app/generated/prisma"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({
    url: "file:./dev.db",
})

export const prisma = new PrismaClient({
    adapter,
})
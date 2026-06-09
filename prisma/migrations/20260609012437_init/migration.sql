/*
  Warnings:

  - The primary key for the `AvailabilityOverride` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `AvailabilityOverride` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `staffMemberId` on the `AvailabilityOverride` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `RecurringAvailability` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `RecurringAvailability` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `staffMemberId` on the `RecurringAvailability` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `StaffMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `StaffMember` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `TimeWindow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `TimeWindow` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `overrideId` on the `TimeWindow` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `recurringId` on the `TimeWindow` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AvailabilityOverride" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffMemberId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "AvailabilityOverride_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AvailabilityOverride" ("date", "id", "staffMemberId", "type") SELECT "date", "id", "staffMemberId", "type" FROM "AvailabilityOverride";
DROP TABLE "AvailabilityOverride";
ALTER TABLE "new_AvailabilityOverride" RENAME TO "AvailabilityOverride";
CREATE TABLE "new_RecurringAvailability" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffMemberId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    CONSTRAINT "RecurringAvailability_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecurringAvailability" ("dayOfWeek", "id", "staffMemberId") SELECT "dayOfWeek", "id", "staffMemberId" FROM "RecurringAvailability";
DROP TABLE "RecurringAvailability";
ALTER TABLE "new_RecurringAvailability" RENAME TO "RecurringAvailability";
CREATE TABLE "new_StaffMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_StaffMember" ("createdAt", "id", "name") SELECT "createdAt", "id", "name" FROM "StaffMember";
DROP TABLE "StaffMember";
ALTER TABLE "new_StaffMember" RENAME TO "StaffMember";
CREATE TABLE "new_TimeWindow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "recurringId" INTEGER,
    "overrideId" INTEGER,
    CONSTRAINT "TimeWindow_recurringId_fkey" FOREIGN KEY ("recurringId") REFERENCES "RecurringAvailability" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimeWindow_overrideId_fkey" FOREIGN KEY ("overrideId") REFERENCES "AvailabilityOverride" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TimeWindow" ("endTime", "id", "overrideId", "recurringId", "startTime") SELECT "endTime", "id", "overrideId", "recurringId", "startTime" FROM "TimeWindow";
DROP TABLE "TimeWindow";
ALTER TABLE "new_TimeWindow" RENAME TO "TimeWindow";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

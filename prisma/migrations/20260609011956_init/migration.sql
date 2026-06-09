-- CreateTable
CREATE TABLE "TimeWindow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "recurringId" TEXT,
    "overrideId" TEXT,
    CONSTRAINT "TimeWindow_recurringId_fkey" FOREIGN KEY ("recurringId") REFERENCES "RecurringAvailability" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimeWindow_overrideId_fkey" FOREIGN KEY ("overrideId") REFERENCES "AvailabilityOverride" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecurringAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffMemberId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    CONSTRAINT "RecurringAvailability_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AvailabilityOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffMemberId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "AvailabilityOverride_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

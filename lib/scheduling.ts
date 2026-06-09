export type TimeWindow = {
  startTime: string // "HH:MM"
  endTime: string   // "HH:MM"
}

export type RecurringAvailability = {
  dayOfWeek: number
  windows: TimeWindow[]
}

export type AvailabilityOverride = {
  date: string  // "YYYY-MM-DD"
  type: "unavailable" | "replace" | "add"
  windows: TimeWindow[]
}

export type DayAvailability = {
  date: string
  source: "recurring" | "override" | "none"
  slots: string[]  // ["09:00", "09:30", ...]
}

// Convert "HH:MM" to total minutes from midnight
function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

// Generate slots from a list of time windows given a duration
function generateSlotsFromWindows(windows: TimeWindow[], durationMinutes: number): string[] {
  const slots: string[] = []

  for (const window of windows) {
    let current = toMinutes(window.startTime)
    const end = toMinutes(window.endTime)

    while (current + durationMinutes <= end) {
      const hours = Math.floor(current / 60).toString().padStart(2, "0")
      const mins = (current % 60).toString().padStart(2, "0")
      slots.push(`${hours}:${mins}`)
      current += durationMinutes
    }
  }

  return slots
}

// Main function: given staff availability data + date range + duration,
// return available slots per day
export function calculateAvailability(
  recurringAvailability: RecurringAvailability[],
  overrides: AvailabilityOverride[],
  startDate: string,   // "YYYY-MM-DD"
  endDate: string,     // "YYYY-MM-DD"
  durationMinutes: number
): DayAvailability[] {
  const results: DayAvailability[] = []

  // Build a map of overrides keyed by date for quick lookup
  const overrideMap = new Map<string, AvailabilityOverride>()
  for (const override of overrides) {
    overrideMap.set(override.date, override)
  }

  // Build a map of recurring availability keyed by day of week
  const recurringMap = new Map<number, RecurringAvailability>()
  for (const recurring of recurringAvailability) {
    recurringMap.set(recurring.dayOfWeek, recurring)
  }

  // Iterate through each date in the range
  const current = new Date(startDate + "T00:00:00")
  const end = new Date(endDate + "T00:00:00")

  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0]
    const dayOfWeek = current.getDay() // 0 = Sunday

    const override = overrideMap.get(dateStr)
    const recurring = recurringMap.get(dayOfWeek)

    let slots: string[] = []
    let source: DayAvailability["source"] = "none"

    if (override) {
      if (override.type === "unavailable") {
        // Marked unavailable — no slots, source is override
        source = "override"
        slots = []
      } else if (override.type === "replace") {
        // Replace recurring with override windows
        source = "override"
        slots = generateSlotsFromWindows(override.windows, durationMinutes)
      } else if (override.type === "add") {
        // Add override windows on top of recurring
        source = "override"
        const recurringSlots = recurring
          ? generateSlotsFromWindows(recurring.windows, durationMinutes)
          : []
        const extraSlots = generateSlotsFromWindows(override.windows, durationMinutes)
        slots = [...new Set([...recurringSlots, ...extraSlots])].sort()
      }
    } else if (recurring) {
      source = "recurring"
      slots = generateSlotsFromWindows(recurring.windows, durationMinutes)
    } else {
      source = "none"
      slots = []
    }

    results.push({ date: dateStr, source, slots })

    // Advance to next day
    current.setDate(current.getDate() + 1)
  }

  return results
}
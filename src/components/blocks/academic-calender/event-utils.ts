import { type EventDetails } from "./event-details-modal"

export const getEventsForDate = (events: EventDetails[], date: Date): EventDetails[] => {
  const dateString = date.toISOString().split("T")[0]
  return events.filter((event) => event.date === dateString)
}

export const getEventTypesForDate = (events: EventDetails[], date: Date): string[] => {
  const dateEvents = getEventsForDate(events, date)
  return [...new Set(dateEvents.map((event) => event.type))]
}

export const hasEventsOnDate = (events: EventDetails[], date: Date): boolean => {
  return getEventsForDate(events, date).length > 0
}

export const getEventCountForDate = (events: EventDetails[], date: Date): number => {
  return getEventsForDate(events, date).length
}
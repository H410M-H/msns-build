export interface EventType {
  id: string
  label: string
  color: string
  bgColor: string
  borderColor: string
  description: string
}

export const EVENT_TYPES: EventType[] = [
  {
    id: "MEETING",
    label: "Meeting",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500",
    description: "Team meetings, one-on-ones, client calls",
  },
  {
    id: "WORKSHOP",
    label: "Workshop",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500",
    description: "Hands-on learning sessions and skill building",
  },
  {
    id: "CONFERENCE",
    label: "Conference",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500",
    description: "Large events, presentations, keynotes",
  },
  {
    id: "TRAINING",
    label: "Training",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500",
    description: "Educational sessions and certification courses",
  },
  {
    id: "WEBINAR",
    label: "Webinar",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500",
    description: "Online presentations and virtual events",
  },
  {
    id: "SOCIAL",
    label: "Social Event",
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500",
    description: "Team building, parties, networking events",
  },
  {
    id: "OTHER",
    label: "Other",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500",
    description: "Miscellaneous events and activities",
  },
]

export const getEventTypeById = (id: string): EventType | undefined => {
  return EVENT_TYPES.find((type) => type.id === id)
}

export const getEventTypeColor = (typeId: string): EventType => {
  const found = getEventTypeById(typeId.toUpperCase())
  return found ?? EVENT_TYPES.find((type) => type.id === "OTHER")!
}

export const getEventTypeLabel = (typeId: string): string => {
  const eventType = getEventTypeById(typeId.toUpperCase())
  return eventType ? eventType.label : "Unknown"
}
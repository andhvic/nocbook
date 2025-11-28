'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Event, Person } from '@/types'
import {
    Trash2,
    MoreVertical,
    Eye,
    Edit,
    Calendar,
    MapPin,
    Users,
    Award,
    DollarSign,
    Building,
    Star,
    ExternalLink,
    Globe,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EventCardProps {
    event: Event
    people: Person[]
    attendeesCount?: number
    materialsCount?: number
    onDelete: () => void
}

const eventTypeConfig: Record<string, { color: string; bgColor: string; label: string }> = {
    seminar: {
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        label: 'Seminar'
    },
    workshop: {
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-500/10',
        label: 'Workshop'
    },
    competition: {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
        label: 'Competition'
    },
    meetup: {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
        label: 'Meetup'
    },
    conference: {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
        label: 'Conference'
    },
}

export function EventCard({ event, people, attendeesCount = 0, materialsCount = 0, onDelete }: EventCardProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const typeColor = eventTypeConfig[event.event_type]?.color || 'text-gray-600'
    const typeBgColor = eventTypeConfig[event.event_type]?.bgColor || 'bg-gray-500/10'
    const typeLabel = eventTypeConfig[event.event_type]?. label || event.event_type

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const response = await fetch(`/events/${event.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete')
            onDelete()
        } catch (error) {
            alert('Failed to delete event')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const formatDate = (dateString?: string) => {
        if (!  dateString) return null
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatTime = (timeString?: string) => {
        if (! timeString) return null
        // timeString format: "HH:MM:SS" or "HH:MM"
        const [hours, minutes] = timeString.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ?  'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    const isPast = event.end_date
        ? new Date(event. end_date) < new Date()
        : event.start_date
            ? new Date(event.start_date) < new Date()
            : false

    return (
        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6
      hover:border-primary dark:hover:border-primary-dark transition-all duration-200 group relative">

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <Link href={`/events/${event. id}`}>
                        <h3 className="text-lg font-semibold text-text dark:text-text-dark hover:text-primary
              dark:hover:text-primary-dark transition-colors mb-2 line-clamp-2 cursor-pointer">
                            {event. name}
                            {event.is_featured && (
                                <Star className="inline-block w-4 h-4 ml-2 text-yellow-500 fill-yellow-500" />
                            )}
                        </h3>
                    </Link>
                    <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${typeBgColor} ${typeColor}`}>
              {typeLabel}
            </span>
                        {event.is_online ?  (
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Online
              </span>
                        ) : event.venue && (
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400">
                On-site
              </span>
                        )}
                        {event.cost === 0 ? (
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                Free
              </span>
                        ) : (
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                                {event.cost. toLocaleString()}
              </span>
                        )}
                        {isPast && (
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400">
                Past Event
              </span>
                        )}
                    </div>
                </div>

                {/* Menu Button */}
                <div className="relative ml-3">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-text-secondary dark:text-text-darkSecondary hover:text-text dark:hover:text-text-dark
              hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-cardBg dark:bg-cardBg-dark
                border-2 border-border dark:border-border-dark rounded-xl shadow-lg z-20 overflow-hidden">
                                <Link
                                    href={`/events/${event.id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-background-dark
                    text-text dark:text-text-dark transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span className="text-sm">View Details</span>
                                </Link>
                                <Link
                                    href={`/events/${event.id}?edit=true`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-background-dark
                    text-text dark:text-text-dark transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Edit className="w-4 h-4" />
                                    <span className="text-sm">Edit Event</span>
                                </Link>
                                {event.certificate_url && (
                                    <a
                                        href={event.certificate_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-background-dark
                      text-text dark:text-text-dark transition-colors"
                                        onClick={() => setShowMenu(false)}
                                    >
                                        <Award className="w-4 h-4" />
                                        <span className="text-sm">View Certificate</span>
                                    </a>
                                )}
                                <div className="border-t border-border dark:border-border-dark" />
                                <button
                                    onClick={() => {
                                        setShowMenu(false)
                                        setShowDeleteConfirm(true)
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-950
                    text-red-600 dark:text-red-400 transition-colors w-full"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-sm">Delete Event</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Event Info */}
            <div className="space-y-2 mb-4">
                {/* Date & Time */}
                {(event.start_date || event. end_date) && (
                    <div className="flex items-start gap-2 text-sm text-text-secondary dark:text-text-darkSecondary">
                        <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                {event.start_date && (
                                    <span>{formatDate(event.start_date)}</span>
                                )}
                                {event.start_time && (
                                    <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                                        {formatTime(event. start_time)}
                  </span>
                                )}
                            </div>
                            {event.end_date && event.end_date !== event.start_date && (
                                <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
                                    <span>to {formatDate(event.end_date)}</span>
                                    {event.end_time && (
                                        <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                                            {formatTime(event.end_time)}
                    </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Venue or Meeting URL */}
                {event.is_online ?  (
                    event.meeting_url && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-darkSecondary">
                            <Globe className="w-4 h-4 flex-shrink-0" />
                            <a
                                href={event.meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="line-clamp-1 hover:text-primary dark:hover:text-primary-dark transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Join Meeting
                            </a>
                        </div>
                    )
                ) : (
                    event.venue && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-darkSecondary">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-1">{event.venue}</span>
                        </div>
                    )
                )}

                {/* Organizer */}
                {event.organizer && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-darkSecondary">
                        <Building className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{event.organizer}</span>
                    </div>
                )}
            </div>

            {/* Insights Preview */}
            {event.important_insights && event.important_insights.length > 0 && (
                <div className="mb-4 p-3 bg-primary/5 dark:bg-primary-dark/5 rounded-lg border border-primary/10 dark:border-primary-dark/10">
                    <p className="text-xs font-medium text-primary dark:text-primary-dark mb-1">
                        Key Insights
                    </p>
                    <p className="text-sm text-text dark:text-text-dark line-clamp-2">
                        {event.important_insights[0]}
                        {event.important_insights.length > 1 && (
                            <span className="text-text-secondary dark:text-text-darkSecondary ml-1">
                +{event.important_insights.length - 1} more
              </span>
                        )}
                    </p>
                </div>
            )}

            {/* Tags */}
            {event.tags && event.tags. length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {event.tags. slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-0.5 bg-background dark:bg-background-dark rounded text-xs
                text-text-secondary dark:text-text-darkSecondary"
                        >
              {tag}
            </span>
                    ))}
                    {event. tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-text-secondary dark:text-text-darkSecondary">
              +{event.tags.length - 3}
            </span>
                    )}
                </div>
            )}

            {/* Footer Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark">
                <div className="flex items-center gap-4">
                    {/* People Met */}
                    {attendeesCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-text-secondary dark:text-text-darkSecondary">
                            <Users className="w-3 h-3" />
                            <span>{attendeesCount} {attendeesCount === 1 ? 'person' : 'people'}</span>
                        </div>
                    )}

                    {/* Materials */}
                    {materialsCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-text-secondary dark:text-text-darkSecondary">
                            <ExternalLink className="w-3 h-3" />
                            <span>{materialsCount} {materialsCount === 1 ? 'material' : 'materials'}</span>
                        </div>
                    )}
                </div>

                {/* Certificate Badge */}
                {event.certificate_url && (
                    <a
                        href={event.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1. 5 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950
              rounded-lg transition-colors"
                        title="View Certificate"
                    >
                        <Award className="w-4 h-4" />
                    </a>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
            rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                            Delete Event?
                        </h3>
                        <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
                            Are you sure you want to delete "{event.name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDelete}
                                loading={deleting}
                                disabled={deleting}
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
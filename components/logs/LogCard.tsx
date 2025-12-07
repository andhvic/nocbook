'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DailyLog, LogMood } from '@/types'
import {
    Trash2,
    MoreVertical,
    Eye,
    Edit,
    Calendar,
    Clock,
    Tag,
    Link2,
    FileText,
    Zap,
    Lightbulb,
    AlertTriangle,
    Star,
    TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface LogCardProps {
    log: DailyLog
    onDelete: () => void
}

const moodConfig: Record<LogMood, { color: string; bgColor: string; label: string }> = {
    terrible: {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
        label: 'Terrible'
    },
    bad: {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
        label: 'Bad'
    },
    neutral: {
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-500/10',
        label: 'Neutral'
    },
    good: {
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        label: 'Good'
    },
    excellent: {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
        label: 'Excellent'
    },
}

export function LogCard({ log, onDelete }: LogCardProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const moodStyle = log.mood ? moodConfig[log.mood] : null

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const response = await fetch(`/logs/${log.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete')
            onDelete()
        } catch (error) {
            alert('Failed to delete log')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatTime = (timeString?: string) => {
        if (! timeString) return null
        const [hours, minutes] = timeString. split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ?  'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
        if (hours > 0) return `${hours}h`
        return `${mins}m`
    }

    return (
        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-4
    hover:border-primary dark:hover:border-primary-dark transition-all duration-200 group relative">

    {/* Header */}
    <div className="flex items-start justify-between mb-3">
    <div className="flex-1 min-w-0">
    <Link href={`/logs/${log. id}`}>
    <h3 className="text-base font-semibold text-text dark:text-text-dark hover:text-primary
    dark:hover:text-primary-dark transition-colors line-clamp-2 cursor-pointer mb-2">
    {log.title}
    {log.is_featured && (
        <Star className="inline-block w-4 h-4 ml-2 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
    )}
    </h3>
    </Link>

    <div className="flex flex-wrap gap-2 mb-2">
        {/* Date */}
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary dark:text-primary-dark flex items-center gap-1">
    <Calendar className="w-3 h-3" />
        {formatDate(log.log_date)}
    </span>

    {/* Duration */}
    {log.duration_minutes > 0 && (
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1">
        <Clock className="w-3 h-3" />
            {formatDuration(log.duration_minutes)}
        </span>
    )}

    {/* Mood */}
    {moodStyle && (
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${moodStyle.bgColor} ${moodStyle.color}`}>
        {moodStyle.label}
        </span>
    )}

    {/* Energy Level */}
    {log.energy_level && (
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
        <Zap className="w-3 h-3" />
            {log.energy_level}/5
    </span>
    )}
    </div>
    </div>

    {/* Menu Button */}
    <div className="relative ml-3">
    <button
        onClick={() => setShowMenu(!showMenu)}
    className="p-1. 5 text-text-secondary dark:text-text-darkSecondary hover:text-text dark:hover:text-text-dark
    hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors"
    >
    <MoreVertical className="w-4 h-4" />
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
        href={`/logs/${log.id}`}
        className="flex items-center gap-3 px-4 py-2. 5 hover:bg-background dark:hover:bg-background-dark
        text-text dark:text-text-dark transition-colors text-sm"
        onClick={() => setShowMenu(false)}
    >
        <Eye className="w-4 h-4" />
            <span>View Log</span>
    </Link>
    <Link
        href={`/logs/${log.id}? edit=true`}
        className="flex items-center gap-3 px-4 py-2. 5 hover:bg-background dark:hover:bg-background-dark
        text-text dark:text-text-dark transition-colors text-sm"
        onClick={() => setShowMenu(false)}
    >
        <Edit className="w-4 h-4" />
            <span>Edit Log</span>
    </Link>
    <div className="border-t border-border dark:border-border-dark" />
    <button
        onClick={() => {
        setShowMenu(false)
        setShowDeleteConfirm(true)
    }}
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950
        text-red-600 dark:text-red-400 transition-colors w-full text-sm"
    >
    <Trash2 className="w-4 h-4" />
        <span>Delete Log</span>
    </button>
    </div>
    </>
    )}
    </div>
    </div>

    {/* Description */}
    {log.description && (
        <p className="text-sm text-text-secondary dark:text-text-darkSecondary line-clamp-2 mb-3">
            {log.description}
            </p>
    )}

    {/* Quick Info */}
    <div className="space-y-2 mb-3">
        {/* Highlights */}
    {log.highlights && (
        <div className="flex items-start gap-2 text-xs">
        <TrendingUp className="w-3. 5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <p className="text-text-secondary dark:text-text-darkSecondary line-clamp-1">
            {log.highlights}
            </p>
            </div>
    )}

    {/* Obstacles */}
    {log.obstacles && (
        <div className="flex items-start gap-2 text-xs">
        <AlertTriangle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <p className="text-text-secondary dark:text-text-darkSecondary line-clamp-1">
            {log. obstacles}
            </p>
            </div>
    )}

    {/* Insights */}
    {log.insights && (
        <div className="flex items-start gap-2 text-xs">
        <Lightbulb className="w-3.5 h-3. 5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-text-secondary dark:text-text-darkSecondary line-clamp-1">
            {log.insights}
            </p>
            </div>
    )}
    </div>

    {/* Tags */}
    {log.tags && log.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
            {log.tags. slice(0, 3).map((tag, index) => (
                    <span
                        key={index}
                className="px-2 py-0.5 bg-primary/10 text-primary dark:text-primary-dark rounded text-xs"
                    >
    #{tag}
        </span>
    ))}
        {log. tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-text-secondary dark:text-text-darkSecondary">
                +{log.tags. length - 3} more
        </span>
        )}
        </div>
    )}

    {/* Footer Info */}
    <div className="flex items-center justify-between text-xs text-text-secondary dark:text-text-darkSecondary pt-3 border-t border-border dark:border-border-dark">
    <div className="flex items-center gap-3">
        {/* Time */}
    {log.log_time && (
        <div className="flex items-center gap-1">
        <Clock className="w-3. 5 h-3.5" />
            <span>{formatTime(log.log_time)}</span>
    </div>
    )}

    {/* Linked Items */}
    {(log.task_id || log.project_id || log.skill_id || log. event_id) && (
        <div className="flex items-center gap-1">
        <Link2 className="w-3.5 h-3.5" />
            <span>Linked</span>
            </div>
    )}

    {/* Attachments */}
    {log. attachments && log.attachments.length > 0 && (
        <div className="flex items-center gap-1">
        <FileText className="w-3.5 h-3.5" />
            <span>{log.attachments.length}</span>
            </div>
    )}
    </div>
    </div>

    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
        rounded-xl p-6 max-w-md w-full">
    <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
        Delete Log?
        </h3>
        <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
            Are you sure you want to delete "{log.title}"? This action cannot be undone.
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
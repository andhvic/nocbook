'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { LogForm } from '@/components/logs/LogForm'
import { Button } from '@/components/ui/Button'
import { DailyLog, Task, Project, Skill, Event, LogMood } from '@/types'
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    Clock,
    Zap,
    TrendingUp,
    AlertTriangle,
    Lightbulb,
    Tag,
    Link2,
    FileText,
    ExternalLink,
    Star
} from 'lucide-react'
import Link from 'next/link'

const moodConfig: Record<LogMood, { color: string; bgColor: string; label: string }> = {
    terrible: { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10', label: 'Terrible' },
    bad: { color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500/10', label: 'Bad' },
    neutral: { color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-500/10', label: 'Neutral' },
    good: { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10', label: 'Good' },
    excellent: { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10', label: 'Excellent' },
}

export default function LogDetailPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const logId = params.id as string

    const [log, setLog] = useState<DailyLog | null>(null)
    const [task, setTask] = useState<Task | null>(null)
    const [project, setProject] = useState<Project | null>(null)
    const [skill, setSkill] = useState<Skill | null>(null)
    const [event, setEvent] = useState<Event | null>(null)

    const [tasks, setTasks] = useState<Task[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [skills, setSkills] = useState<Skill[]>([])
    const [events, setEvents] = useState<Event[]>([])

    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (! authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && logId) {
            fetchLog()
            fetchRelatedData()
        }
    }, [user, logId])

    // Check URL for edit parameter on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location. search)
            if (urlParams.get('edit') === 'true') {
                setEditMode(true)
            }
        }
    }, [])

    const fetchLog = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('id', logId)
                .single()

            if (error) throw error
            setLog(data)

            // Fetch related task
            if (data.task_id) {
                const { data: taskData } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('id', data. task_id)
                    .single()
                setTask(taskData)
            }

            // Fetch related project
            if (data.project_id) {
                const { data: projectData } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', data.project_id)
                    . single()
                setProject(projectData)
            }

            // Fetch related skill
            if (data.skill_id) {
                const { data: skillData } = await supabase
                    . from('skills')
                    .select('*')
                    .eq('id', data.skill_id)
                    .single()
                setSkill(skillData)
            }

            // Fetch related event
            if (data.event_id) {
                const { data: eventData } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', data. event_id)
                    .single()
                setEvent(eventData)
            }
        } catch (error) {
            console. error('Error fetching log:', error)
            router.push('/logs')
        } finally {
            setLoading(false)
        }
    }

    const fetchRelatedData = async () => {
        try {
            const { data: tasksData } = await supabase
                .from('tasks')
                .select('*')
                .order('title', { ascending: true })

            const { data: projectsData } = await supabase
                . from('projects')
                .select('*')
                .order('title', { ascending: true })

            const { data: skillsData } = await supabase
                .from('skills')
                . select('*')
                .order('name', { ascending: true })

            const { data: eventsData } = await supabase
                .from('events')
                .select('*')
                . order('name', { ascending: true })

            setTasks(tasksData || [])
            setProjects(projectsData || [])
            setSkills(skillsData || [])
            setEvents(eventsData || [])
        } catch (error) {
            console.error('Error fetching related data:', error)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const { error } = await supabase
                .from('daily_logs')
                .delete()
                . eq('id', logId)

            if (error) throw error
            router.push('/logs')
        } catch (error) {
            console.error('Error deleting log:', error)
            alert('Failed to delete log')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (timeString?: string) => {
        if (! timeString) return null
        const [hours, minutes] = timeString.split(':')
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

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading log...</p>
                </div>
            </div>
        )
    }

    if (!user || !log) return null

    const moodStyle = log.mood ? moodConfig[log.mood] : null

    if (editMode) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setEditMode(false)}
                            className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark">
                                Edit Log
                            </h1>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
                                Update your daily log entry
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                    <LogForm
                        log={log}
                        tasks={tasks}
                        projects={projects}
                        skills={skills}
                        events={events}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    <Link
                        href="/logs"
                        className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-3">
                            {log.title}
                            {log.is_featured && (
                                <Star className="inline-block w-6 h-6 ml-2 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                            )}
                        </h1>
                        <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-lg text-sm font-medium bg-primary/10 text-primary dark:text-primary-dark flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                  {formatDate(log.log_date)}
              </span>
                            {log.log_time && (
                                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                                    {formatTime(log.log_time)}
                </span>
                            )}
                            {log.duration_minutes > 0 && (
                                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                                    {formatDuration(log.duration_minutes)}
                </span>
                            )}
                            {moodStyle && (
                                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${moodStyle.bgColor} ${moodStyle.color}`}>
                  {moodStyle.label}
                </span>
                            )}
                            {log.energy_level && (
                                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Energy: {log.energy_level}/5
                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    {log.description && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3">
                                Description
                            </h2>
                            <p className="text-text-secondary dark:text-text-darkSecondary whitespace-pre-wrap">
                                {log.description}
                            </p>
                        </div>
                    )}

                    {/* Highlights */}
                    {log.highlights && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                Highlights
                            </h2>
                            <p className="text-text-secondary dark:text-text-darkSecondary whitespace-pre-wrap">
                                {log.highlights}
                            </p>
                        </div>
                    )}

                    {/* Obstacles */}
                    {log.obstacles && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                Obstacles
                            </h2>
                            <p className="text-text-secondary dark:text-text-darkSecondary whitespace-pre-wrap">
                                {log.obstacles}
                            </p>
                        </div>
                    )}

                    {/* Insights */}
                    {log.insights && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                Insights
                            </h2>
                            <p className="text-text-secondary dark:text-text-darkSecondary whitespace-pre-wrap">
                                {log.insights}
                            </p>
                        </div>
                    )}

                    {/* Linked Resources */}
                    {(task || project || skill || event) && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <Link2 className="w-5 h-5" />
                                Linked Activities
                            </h2>
                            <div className="space-y-3">
                                {task && (
                                    <Link
                                        href={`/tasks/${task.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">✅</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">Task</p>
                                            <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {task. title}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </Link>
                                )}

                                {project && (
                                    <Link
                                        href={`/projects/${project.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">📦</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">Project</p>
                                            <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {project.title}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </Link>
                                )}

                                {skill && (
                                    <Link
                                        href={`/skills/${skill.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">🎯</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">Skill</p>
                                            <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {skill. name}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </Link>
                                )}

                                {event && (
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">📅</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">Event</p>
                                            <p className="font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark transition-colors truncate">
                                                {event.name}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {log. attachments && log.attachments.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Attachments ({log.attachments.length})
                            </h2>
                            <div className="space-y-2">
                                {log.attachments.map((url, index) => (
                                    <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 border border-border dark:border-border-dark
                      hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all group"
                                    >
                                        <FileText className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                        <p className="flex-1 text-sm text-primary dark:text-primary-dark group-hover:underline truncate">
                                            {url}
                                        </p>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {log.tags && log.tags.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {log. tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1. 5 bg-primary/10 text-primary dark:text-primary-dark rounded-full text-sm font-medium"
                                    >
                    #{tag}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Quick Info */}
                <div className="space-y-6">
                    {/* Log Details */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
                            Log Details
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Duration</p>
                                <p className="text-sm font-medium text-text dark:text-text-dark">
                                    {log.duration_minutes > 0 ? formatDuration(log.duration_minutes) : 'Not tracked'}
                                </p>
                            </div>
                            {log.mood && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Mood</p>
                                    <p className={`text-sm font-medium ${moodStyle?. color}`}>
                                        {moodStyle?.label}
                                    </p>
                                </div>
                            )}
                            {log.energy_level && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Energy Level</p>
                                    <p className="text-sm font-medium text-text dark:text-text-dark">
                                        {log.energy_level}/5
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
                            Timeline
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Created
                                </p>
                                <p className="text-sm text-text dark:text-text-dark font-medium">
                                    {new Date(log.created_at). toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            {log.updated_at !== log.created_at && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Last Updated
                                    </p>
                                    <p className="text-sm text-text dark:text-text-dark font-medium">
                                        {new Date(log.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
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
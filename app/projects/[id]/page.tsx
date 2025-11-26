'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Button } from '@/components/ui/Button'
import { Project, Person } from '@/types'
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    Clock,
    Users,
    Tag,
    Code,
    Github,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    Pause,
    XCircle,
    FileText
} from 'lucide-react'
import Link from 'next/link'

const statusConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
    idea: {
        icon: Lightbulb,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-500/10',
        label: 'Idea'
    },
    planning: {
        icon: Clock,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        label: 'Planning'
    },
    'in-progress': {
        icon: AlertCircle,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        label: 'In Progress'
    },
    'on-hold': {
        icon: Pause,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
        label: 'On Hold'
    },
    completed: {
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
        label: 'Completed'
    },
    cancelled: {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
        label: 'Cancelled'
    },
}

const categoryColors: Record<string, string> = {
    school: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    competition: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    personal: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    client: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    startup: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    web: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    iot: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    ai: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    mobile: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    api: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
}

const priorityColors: Record<string, string> = {
    low: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    urgent: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
}

export default function ProjectDetailPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const projectId = params.id as string

    const [project, setProject] = useState<Project | null>(null)
    const [people, setPeople] = useState<Person[]>([])
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
        if (user && projectId) {
            fetchProject()
            fetchPeople()
        }
    }, [user, projectId])

    const fetchProject = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single()

            if (error) throw error
            setProject(data)
        } catch (error) {
            console.error('Error fetching project:', error)
            router.push('/projects')
        } finally {
            setLoading(false)
        }
    }

    const fetchPeople = async () => {
        try {
            const { data, error } = await supabase
                .from('people')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setPeople(data || [])
        } catch (error) {
            console.error('Error fetching people:', error)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId)

            if (error) throw error
            router.push('/projects')
        } catch (error) {
            console.error('Error deleting project:', error)
            alert('Failed to delete project')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading project...</p>
                </div>
            </div>
        )
    }

    if (!user || !project) return null

    const StatusIcon = statusConfig[project.status]?. icon || AlertCircle
    const statusColor = statusConfig[project.status]?.color || 'text-gray-500'
    const statusBgColor = statusConfig[project.status]?.bgColor || 'bg-gray-500/10'
    const statusLabel = statusConfig[project.status]?.label || project.status

    const teamMembers = people.filter(p => project.team_members?. includes(p.id))
    const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed'

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
                                Edit Project
                            </h1>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
                                Update your project details
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                    <ProjectForm project={project} people={people} />
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
                        href="/projects"
                        className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-3">
                            {project.title}
                        </h1>
                        <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${categoryColors[project.category]}`}>
                {project.category}
              </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${priorityColors[project.priority]}`}>
                {project.priority} priority
              </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 ${statusBgColor} ${statusColor}`}>
                <StatusIcon className="w-4 h-4" />
                                {statusLabel}
              </span>
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
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    {project.description && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Description
                            </h2>
                            <p className="text-text-secondary dark:text-text-darkSecondary whitespace-pre-wrap">
                                {project.description}
                            </p>
                        </div>
                    )}

                    {/* Progress */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                Progress
                            </h2>
                            <span className="text-2xl font-bold text-text dark:text-text-dark">
                {project.progress}%
              </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div
                                className="bg-primary dark:bg-primary-dark h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                                style={{ width: `${project.progress}%` }}
                            >
                                {project.progress > 10 && (
                                    <span className="text-xs font-semibold text-white">
                    {project.progress}%
                  </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <Code className="w-5 h-5" />
                                Tech Stack
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {project.tech_stack. map((tech, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1. 5 bg-background dark:bg-background-dark rounded-lg text-sm
                      text-text dark:text-text-dark border border-border dark:border-border-dark"
                                    >
                    {tech}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {project.tags. map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1. 5 bg-primary/10 text-primary dark:text-primary-dark rounded-full text-sm font-medium"
                                    >
                    {tag}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {project.notes && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Notes
                            </h2>
                            <p className="text-text-secondary dark:text-text-darkSecondary whitespace-pre-wrap">
                                {project.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column - Metadata */}
                <div className="space-y-6">
                    {/* Dates */}
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Timeline
                        </h2>
                        <div className="space-y-3">
                            {project.start_date && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Start Date</p>
                                    <p className="text-sm text-text dark:text-text-dark font-medium">
                                        {new Date(project.start_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                            {project. deadline && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Deadline</p>
                                    <p className={`text-sm font-medium ${
                                        isOverdue ? 'text-red-600 dark:text-red-400' : 'text-text dark:text-text-dark'
                                    }`}>
                                        {new Date(project.deadline). toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        {isOverdue && (
                                            <span className="ml-2 text-xs">(Overdue)</span>
                                        )}
                                    </p>
                                </div>
                            )}
                            {project.completed_at && (
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Completed</p>
                                    <p className="text-sm text-text dark:text-text-dark font-medium">
                                        {new Date(project.completed_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1">Created</p>
                                <p className="text-sm text-text dark:text-text-dark font-medium">
                                    {new Date(project.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    {(project.github_url || project.demo_url) && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <ExternalLink className="w-5 h-5" />
                                Links
                            </h2>
                            <div className="space-y-2">
                                {project.github_url && (
                                    <a
                                        href={project.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 transition-colors group"
                                    >
                                        <Github className="w-5 h-5 text-text-secondary dark:text-text-darkSecondary group-hover:text-primary dark:group-hover:text-primary-dark" />
                                        <span className="text-sm text-text dark:text-text-dark group-hover:text-primary dark:group-hover:text-primary-dark flex-1 truncate">
                      GitHub Repository
                    </span>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary" />
                                    </a>
                                )}
                                {project.demo_url && (
                                    <a
                                        href={project.demo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 transition-colors group"
                                    >
                                        <ExternalLink className="w-5 h-5 text-text-secondary dark:text-text-darkSecondary group-hover:text-primary dark:group-hover:text-primary-dark" />
                                        <span className="text-sm text-text dark:text-text-dark group-hover:text-primary dark:group-hover:text-primary-dark flex-1 truncate">
                      Live Demo
                    </span>
                                        <ExternalLink className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Team Members */}
                    {teamMembers.length > 0 && (
                        <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Team ({teamMembers.length})
                            </h2>
                            <div className="space-y-2">
                                {teamMembers. map(person => (
                                    <Link
                                        key={person.id}
                                        href={`/people/${person.id}`}
                                        className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                      hover:bg-primary/5 dark:hover:bg-primary-dark/5 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary dark:text-primary-dark">
                        {person.name.charAt(0). toUpperCase()}
                      </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text dark:text-text-dark group-hover:text-primary
                        dark:group-hover:text-primary-dark truncate">
                                                {person. name}
                                            </p>
                                            {person.profession && (
                                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary truncate">
                                                    {person. profession}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
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
                            Delete Project?
                        </h3>
                        <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
                            Are you sure you want to delete "{project.title}"? This action cannot be undone.
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
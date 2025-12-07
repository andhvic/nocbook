'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DailyLog, LogMood, Task, Project, Skill, Event } from '@/types'
import { Button } from '@/components/ui/Button'
import { X, Plus, Trash2, Link2, FileText, Calendar, Clock, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface LogFormProps {
    log?: DailyLog
    tasks?: Task[]
    projects?: Project[]
    skills?: Skill[]
    events?: Event[]
}

const moods: { value: LogMood; label: string }[] = [
    { value: 'terrible', label: 'Terrible' },
    { value: 'bad', label: 'Bad' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'good', label: 'Good' },
    { value: 'excellent', label: 'Excellent' },
]

export function LogForm({ log, tasks = [], projects = [], skills = [], events = [] }: LogFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Form state
    const [title, setTitle] = useState(log?. title || '')
    const [description, setDescription] = useState(log?.description || '')
    const [logDate, setLogDate] = useState(
        log?.log_date ? log.log_date.split('T')[0] : new Date().toISOString().split('T')[0]
    )
    const [logTime, setLogTime] = useState(log?.log_time || '')

    // Duration (hours and minutes)
    const [durationHours, setDurationHours] = useState(log?.duration_minutes ?  Math.floor(log.duration_minutes / 60) : 0)
    const [durationMinutes, setDurationMinutes] = useState(log?.duration_minutes ?  log.duration_minutes % 60 : 0)

    // Mood & Energy
    const [mood, setMood] = useState<LogMood | ''>(log?.mood || '')
    const [energyLevel, setEnergyLevel] = useState(log?.energy_level || 3)

    // Content
    const [highlights, setHighlights] = useState(log?. highlights || '')
    const [obstacles, setObstacles] = useState(log?.obstacles || '')
    const [insights, setInsights] = useState(log?.insights || '')

    // Relations
    const [taskId, setTaskId] = useState(log?.task_id || '')
    const [projectId, setProjectId] = useState(log?.project_id || '')
    const [skillId, setSkillId] = useState(log?.skill_id || '')
    const [eventId, setEventId] = useState(log?.event_id || '')

    // Arrays
    const [tags, setTags] = useState<string[]>(log?.tags || [])
    const [tagInput, setTagInput] = useState('')

    const [attachments, setAttachments] = useState<string[]>(log?. attachments || [])
    const [attachmentInput, setAttachmentInput] = useState('')

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleAddAttachment = () => {
        if (attachmentInput.trim() && !attachments.includes(attachmentInput. trim())) {
            setAttachments([...attachments, attachmentInput.trim()])
            setAttachmentInput('')
        }
    }

    const handleRemoveAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const totalMinutes = (durationHours * 60) + durationMinutes

            const logData = {
                user_id: user.id,
                title,
                description: description || null,
                log_date: logDate,
                log_time: logTime || null,
                duration_minutes: totalMinutes,
                mood: mood || null,
                energy_level: energyLevel,
                highlights: highlights || null,
                obstacles: obstacles || null,
                insights: insights || null,
                task_id: taskId || null,
                project_id: projectId || null,
                skill_id: skillId || null,
                event_id: eventId || null,
                tags: tags.length > 0 ? tags : null,
                attachments: attachments.length > 0 ? attachments : null,
                is_featured: log?.is_featured || false,
                updated_at: new Date().toISOString(),
            }

            if (log) {
                // Update existing log
                const { error } = await supabase
                    .from('daily_logs')
                    .update(logData)
                    .eq('id', log. id)

                if (error) throw error
            } else {
                // Create new log
                const { error } = await supabase
                    .from('daily_logs')
                    .insert(logData)

                if (error) throw error
            }

            router.push('/logs')
            router.refresh()
        } catch (error: any) {
            console.error('Error saving log:', error)
            alert(error.message || 'Failed to save log')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
    {/* Title */}
    <div>
    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
        Log Title *
    </label>
    <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    required
    placeholder="e.g., Finished UKK Chapter 2 - IoT Architecture"
    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
    placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
    />
    </div>

    {/* Date & Time */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2 flex items-center gap-2">
    <Calendar className="w-4 h-4" />
        Date *
        </label>
        <input
    type="date"
    value={logDate}
    onChange={(e) => setLogDate(e.target.value)}
    required
    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
    />
    </div>

    <div>
    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2 flex items-center gap-2">
    <Clock className="w-4 h-4" />
        Time
        </label>
        <input
    type="time"
    value={logTime}
    onChange={(e) => setLogTime(e.target.value)}
    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
    />
    </div>
    </div>

    {/* Duration */}
    <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
        Duration
        </label>
        <div className="grid grid-cols-2 gap-4">
    <div>
        <input
            type="number"
    min="0"
    value={durationHours}
    onChange={(e) => setDurationHours(parseInt(e.target.value) || 0)}
    placeholder="Hours"
    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
    />
    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mt-1">Hours</p>
    </div>
    <div>
    <input
        type="number"
    min="0"
    max="59"
    value={durationMinutes}
    onChange={(e) => setDurationMinutes(Math.min(59, parseInt(e.target.value) || 0))}
    placeholder="Minutes"
    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
    />
    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mt-1">Minutes</p>
        </div>
        </div>
        </div>

    {/* Mood & Energy */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
        Mood
        </label>
        <select
    value={mood}
    onChange={(e) => setMood(e.target.value as LogMood)}
    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
    >
    <option value="">Not specified</option>
    {moods.map(m => (
        <option key={m.value} value={m.value}>{m.label}</option>
    ))}
    </select>
    </div>

    <div>
    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2 flex items-center gap-2">
    <Zap className="w-4 h-4" />
        Energy Level: {energyLevel}/5
    </label>
    <input
    type="range"
    min="1"
    max="5"
    value={energyLevel}
    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
    className="w-full"
    />
    <div className="flex justify-between text-xs text-text-secondary dark:text-text-darkSecondary mt-1">
        <span>Low</span>
        <span>High</span>
        </div>
        </div>
        </div>

    {/* Description */}
    <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
        Description
        </label>
        <textarea
    value={description}
    onChange={(e) => setDescription(e. target.value)}
    rows={3}
    placeholder="What did you do today?"
    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
    placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary resize-none"
    />
    </div>

    {/* Highlights, Obstacles, Insights */}
    <div className="space-y-4">
    <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
        Highlights (What went well)
    </label>
    <textarea
    value={highlights}
    onChange={(e) => setHighlights(e.target.value)}
    rows={2}
    placeholder="e.g., Successfully understood MQTT protocol"
    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
    placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary resize-none"
    />
    </div>

    <div>
    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
        Obstacles (What was difficult)
    </label>
    <textarea
    value={obstacles}
    onChange={(e) => setObstacles(e.target. value)}
    rows={2}
    placeholder="e.g., WiFi connection unstable, debugging took longer than expected"
    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
    placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary resize-none"
    />
    </div>

    <div>
    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
        Insights (What you learned)
    </label>
    <textarea
    value={insights}
    onChange={(e) => setInsights(e.target.value)}
    rows={2}
    placeholder="e.g., MQTT is more efficient than HTTP for IoT sensors"
    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
    placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary resize-none"
    />
    </div>
    </div>

    {/* Link to Resources */}
    <div className="space-y-4 p-4 bg-background dark:bg-background-dark rounded-lg border-2 border-border dark:border-border-dark">
    <h3 className="text-sm font-semibold text-text dark:text-text-dark flex items-center gap-2">
    <Link2 className="w-4 h-4" />
        Link to Activities (Optional)
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
        Task
        </label>
        <select
    value={taskId}
    onChange={(e) => setTaskId(e.target.value)}
    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
    >
    <option value="">None</option>
    {tasks. map(task => (
        <option key={task.id} value={task.id}>{task. title}</option>
    ))}
    </select>
    </div>

    <div>
    <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
        Project
        </label>
        <select
    value={projectId}
    onChange={(e) => setProjectId(e.target. value)}
    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
    >
    <option value="">None</option>
    {projects.map(project => (
        <option key={project.id} value={project.id}>{project.title}</option>
    ))}
    </select>
    </div>

    <div>
    <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
        Skill
        </label>
        <select
    value={skillId}
    onChange={(e) => setSkillId(e. target.value)}
    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
    >
    <option value="">None</option>
    {skills.map(skill => (
        <option key={skill.id} value={skill.id}>{skill.name}</option>
    ))}
    </select>
    </div>

    <div>
    <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
        Event
        </label>
        <select
    value={eventId}
    onChange={(e) => setEventId(e.target.value)}
    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
    >
    <option value="">None</option>
    {events.map(event => (
        <option key={event.id} value={event.id}>{event.name}</option>
    ))}
    </select>
    </div>
    </div>
    </div>

    {/* Tags */}
    <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
        Tags
        </label>
        <div className="flex gap-2 mb-2">
    <input
        type="text"
    value={tagInput}
    onChange={(e) => setTagInput(e.target.value)}
    onKeyPress={(e) => e. key === 'Enter' && (e.preventDefault(), handleAddTag())}
    placeholder="Add tag and press Enter"
    className="flex-1 px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
    placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
    />
    <Button type="button" onClick={handleAddTag} variant="outline">
        Add
        </Button>
        </div>
    {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
                    <span
                        key={tag}
                className="px-3 py-1 bg-primary/10 text-primary dark:text-primary-dark rounded-full
                text-sm flex items-center gap-2"
            >
    #{tag}
        <button
            type="button"
        onClick={() => handleRemoveTag(tag)}
        className="hover:text-red-600 dark:hover:text-red-400"
        >
        <X className="w-3 h-3" />
            </button>
            </span>
    ))}
        </div>
    )}
    </div>

    {/* Attachments */}
    <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
        Attachments (Screenshots, Photos, Links)
        </label>
        <div className="flex gap-2 mb-3">
    <input
        type="url"
    value={attachmentInput}
    onChange={(e) => setAttachmentInput(e. target.value)}
    onKeyPress={(e) => e. key === 'Enter' && (e.preventDefault(), handleAddAttachment())}
    placeholder="Add URL and press Enter"
    className="flex-1 px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
    bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
    placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
    />
    <Button type="button" onClick={handleAddAttachment} variant="outline">
        Add
        </Button>
        </div>
    {attachments.length > 0 && (
        <div className="space-y-2">
        {attachments.map((url, index) => (
                <div
                    key={index}
            className="flex items-center gap-2 p-2 bg-background dark:bg-background-dark rounded-lg
            border border-border dark:border-border-dark"
        >
        <FileText className="w-4 h-4 text-text-secondary dark:text-text-darkSecondary flex-shrink-0" />
        <a
            href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-sm text-primary dark:text-primary-dark hover:underline truncate"
            >
            {url}
            </a>
            <button
        type="button"
        onClick={() => handleRemoveAttachment(index)}
        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950
        rounded transition-colors flex-shrink-0"
    >
    <Trash2 className="w-4 h-4" />
        </button>
        </div>
    ))}
        </div>
    )}
    </div>

    {/* Submit Buttons */}
    <div className="flex gap-3 justify-end pt-6 border-t border-border dark:border-border-dark">
    <Button
        type="button"
    variant="outline"
    onClick={() => router.back()}
    disabled={loading}
        >
        Cancel
        </Button>
        <Button
    type="submit"
    variant="primary"
    loading={loading}
    disabled={loading}
        >
        {log ?  'Update Log' : 'Create Log'}
        </Button>
        </div>
        </form>
)
}
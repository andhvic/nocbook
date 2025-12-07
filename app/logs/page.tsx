'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { LogCard } from '@/components/logs/LogCard'
import { Button } from '@/components/ui/Button'
import { DailyLog } from '@/types'
import {
    Plus,
    Search,
    Filter,
    X,
    BookOpen,
    Calendar,
    Clock,
    TrendingUp,
    Zap,
    BarChart3
} from 'lucide-react'
import Link from 'next/link'

type TimelineFilter = 'all' | 'today' | 'week' | 'month' | 'year'

export default function LogsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [logs, setLogs] = useState<DailyLog[]>([])
    const [filteredLogs, setFilteredLogs] = useState<DailyLog[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedMood, setSelectedMood] = useState('')
    const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all')
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (!  authLoading && ! user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchLogs()
        }
    }, [user])

    useEffect(() => {
        filterLogs()
    }, [logs, searchTerm, selectedMood, timelineFilter])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('daily_logs')
                .select('*')
                .order('log_date', { ascending: false })
                .order('log_time', { ascending: false })

            if (error) throw error
            setLogs(data || [])
        } catch (error) {
            console.error('Error fetching logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const getTimelineRange = (filter: TimelineFilter) => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (filter) {
            case 'today':
                return {
                    start: today,
                    end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
                }
            case 'week':
                const weekStart = new Date(today)
                weekStart.setDate(today.getDate() - today.getDay())
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekStart.getDate() + 7)
                return { start: weekStart, end: weekEnd }
            case 'month':
                const monthStart = new Date(now. getFullYear(), now.getMonth(), 1)
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
                return { start: monthStart, end: monthEnd }
            case 'year':
                const yearStart = new Date(now.getFullYear(), 0, 1)
                const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
                return { start: yearStart, end: yearEnd }
            default:
                return null
        }
    }

    const filterLogs = () => {
        let filtered = [... logs]

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(log =>
                log.title.toLowerCase(). includes(term) ||
                log.description?. toLowerCase().includes(term) ||
                log.highlights?.toLowerCase().includes(term) ||
                log.obstacles?.toLowerCase(). includes(term) ||
                log.insights?.toLowerCase().includes(term) ||
                log.tags?.some(tag => tag.toLowerCase().includes(term))
            )
        }

        // Mood filter
        if (selectedMood) {
            filtered = filtered.filter(log => log.mood === selectedMood)
        }

        // Timeline filter
        if (timelineFilter !== 'all') {
            const range = getTimelineRange(timelineFilter)
            if (range) {
                filtered = filtered.filter(log => {
                    const logDate = new Date(log.log_date)
                    return logDate >= range.start && logDate <= range.end
                })
            }
        }

        setFilteredLogs(filtered)
    }

    const handleLogDeleted = () => {
        fetchLogs()
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedMood('')
        setTimelineFilter('all')
        setShowMobileFilters(false)
    }

    // Statistics
    const stats = {
        total: logs.length,
        thisWeek: logs.filter(log => {
            const weekRange = getTimelineRange('week')
            if (!weekRange) return false
            const logDate = new Date(log. log_date)
            return logDate >= weekRange.start && logDate <= weekRange.end
        }).length,
        thisMonth: logs.filter(log => {
            const monthRange = getTimelineRange('month')
            if (! monthRange) return false
            const logDate = new Date(log. log_date)
            return logDate >= monthRange.start && logDate <= monthRange.end
        }).length,
        totalHours: Math.floor(logs.reduce((sum, log) => sum + log.duration_minutes, 0) / 60),
        avgMood: logs.filter(l => l.mood). length > 0 ?
            logs.reduce((sum, log) => {
                const moodValue = log.mood ?
                    { terrible: 1, bad: 2, neutral: 3, good: 4, excellent: 5 }[log. mood] : 0
                return sum + moodValue
            }, 0) / logs.filter(l => l.mood).length : 0,
    }

    const moods = ['terrible', 'bad', 'neutral', 'good', 'excellent']

    const hasActiveFilters = searchTerm || selectedMood || timelineFilter !== 'all'
    const activeFilterCount = [searchTerm, selectedMood, timelineFilter !== 'all'].filter(Boolean). length

    const timelineOptions: { value: TimelineFilter; label: string }[] = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
    ]

    const getMoodLabel = (mood: string) => {
        return mood.charAt(0).toUpperCase() + mood.slice(1)
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading logs...</p>
                </div>
            </div>
        )
    }

    if (! user) return null

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-1">
                            Daily Logs
                        </h1>
                        <p className="text-text-secondary dark:text-text-darkSecondary text-sm">
                            {logs.length} {logs.length === 1 ?   'entry' : 'entries'} • {stats.totalHours}h tracked
                        </p>
                    </div>
                    <Link href="/logs/new" className="flex-shrink-0">
                        <Button variant="primary" size="sm" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Log</span>
                        </Button>
                    </Link>
                </div>

                {/* Mobile: Compact Search + Filter Button */}
                <div className="lg:hidden flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-darkSecondary" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e. target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
                placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                        />
                    </div>
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="relative px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              hover:border-primary dark:hover:border-primary-dark transition-colors flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary dark:bg-primary-dark
                text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
                        )}
                    </button>
                </div>

                {/* Mobile: Filter Dropdown */}
                {showMobileFilters && (
                    <div className="lg:hidden bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
            rounded-xl p-4 space-y-3 animate-in slide-in-from-top duration-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-text dark:text-text-dark text-sm">Filters</h3>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-primary dark:text-primary-dark hover:underline flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Timeline Filter - Mobile */}
                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Timeline
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {timelineOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setTimelineFilter(option.value)}
                                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                                            timelineFilter === option.value
                                                ? 'bg-primary dark:bg-primary-dark text-white'
                                                : 'bg-background dark:bg-background-dark text-text dark:text-text-dark border border-border dark:border-border-dark'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">
                                Mood
                            </label>
                            <select
                                value={selectedMood}
                                onChange={(e) => setSelectedMood(e.target. value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-background dark:bg-background-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                            >
                                <option value="">All Moods</option>
                                {moods.map(mood => (
                                    <option key={mood} value={mood}>{getMoodLabel(mood)}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="w-full py-2 bg-primary dark:bg-primary-dark text-white rounded-lg text-sm font-medium
                hover:opacity-90 transition-opacity"
                        >
                            Apply Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-2 md:pb-0 snap-x snap-mandatory scrollbar-hide">
                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1. 5 bg-blue-500/10 rounded-lg">
                                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Total</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.total}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-green-500/10 rounded-lg">
                                <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">This Week</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.thisWeek}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">This Month</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.thisMonth}</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1. 5 bg-orange-500/10 rounded-lg">
                                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Total Hours</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">{stats.totalHours}h</p>
                    </div>

                    <div className="flex-shrink-0 w-32 md:w-auto snap-start bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                                <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-xs">Avg Mood</p>
                        </div>
                        <p className="text-xl font-bold text-text dark:text-text-dark">
                            {stats.avgMood > 0 ? stats.avgMood. toFixed(1) : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid lg:grid-cols-4 gap-6">
                {/* Desktop Filter Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
            rounded-xl p-6 sticky top-24">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark">
                                Filter & Search
                            </h3>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-text-secondary dark:text-text-darkSecondary hover:text-primary
                    dark:hover:text-primary-dark transition-colors flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-darkSecondary" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.  target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
                    placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                                />
                            </div>

                            {/* Timeline Filter - Desktop */}
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Timeline
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {timelineOptions.map(option => (
                                        <button
                                            key={option.  value}
                                            onClick={() => setTimelineFilter(option. value)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                timelineFilter === option.value
                                                    ? 'bg-primary dark:bg-primary-dark text-white'
                                                    : 'bg-background dark:bg-background-dark text-text dark:text-text-dark hover:bg-primary/10 dark:hover:bg-primary-dark/10'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Mood
                                </label>
                                <select
                                    value={selectedMood}
                                    onChange={(e) => setSelectedMood(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                    bg-background dark:bg-background-dark text-text dark:text-text-dark
                    focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                                >
                                    <option value="">All Moods</option>
                                    {moods.map(mood => (
                                        <option key={mood} value={mood}>{getMoodLabel(mood)}</option>
                                    ))}
                                </select>
                            </div>

                            {hasActiveFilters && (
                                <div className="pt-3 border-t border-border dark:border-border-dark">
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary">
                                        {activeFilterCount} active filter(s)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Logs Grid */}
                <div className="lg:col-span-3">
                    {filteredLogs.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                    {filteredLogs.  length} of {logs.length} logs
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                                {filteredLogs.map(log => (
                                    <LogCard
                                        key={log.id}
                                        log={log}
                                        onDelete={handleLogDeleted}
                                    />
                                ))}
                            </div>
                        </>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/10
                flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-primary dark:text-primary-dark" />
                            </div>
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                                No logs yet
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary mb-6 text-sm px-4">
                                Start tracking your daily activities and progress
                            </p>
                            <Link href="/logs/new">
                                <Button variant="primary" className="inline-flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Create Your First Log
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-cardBg dark:bg-cardBg-dark border-2 border-dashed
              border-border dark:border-border-dark rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/10
                flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-text-secondary dark:text-text-darkSecondary" />
                            </div>
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
                                No results found
                            </h3>
                            <p className="text-text-secondary dark:text-text-darkSecondary text-sm px-4 mb-4">
                                Try adjusting your filters or search term
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
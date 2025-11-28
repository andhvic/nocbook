'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Event, EventType, MaterialType, Person } from '@/types'
import { Button } from '@/components/ui/Button'
import { X, Plus, Trash2, Search, Globe, Link as LinkIcon, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface EventFormProps {
    event?: Event
    people: Person[]
}

const eventTypes: { value: EventType; label: string }[] = [
    { value: 'seminar', label: 'Seminar' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'competition', label: 'Competition' },
    { value: 'meetup', label: 'Meetup' },
    { value: 'conference', label: 'Conference' },
]

const materialTypes: { value: MaterialType; label: string }[] = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'slides', label: 'Presentation Slides' },
    { value: 'video', label: 'Video Recording' },
    { value: 'notes', label: 'Notes' },
    { value: 'link', label: 'Link/URL' },
]

export function EventForm({ event, people }: EventFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Form state
    const [name, setName] = useState(event?. name || '')
    const [eventType, setEventType] = useState<EventType>(event?.event_type || 'seminar')
    const [venue, setVenue] = useState(event?.venue || '')
    const [organizer, setOrganizer] = useState(event?.organizer || '')
    const [cost, setCost] = useState(event?.cost || 0)
    const [certificateUrl, setCertificateUrl] = useState(event?.certificate_url || '')
    const [startDate, setStartDate] = useState(
        event?.start_date ? event.start_date.split('T')[0] : ''
    )
    const [endDate, setEndDate] = useState(
        event?.end_date ?  event.end_date.split('T')[0] : ''
    )
    const [startTime, setStartTime] = useState(event?.start_time || '')
    const [endTime, setEndTime] = useState(event?.end_time || '')
    const [isOnline, setIsOnline] = useState(event?.is_online || false)
    const [meetingUrl, setMeetingUrl] = useState(event?.meeting_url || '')
    const [registrationUrl, setRegistrationUrl] = useState(event?.registration_url || '')
    const [eventInfoUrl, setEventInfoUrl] = useState(event?.event_info_url || '')
    const [notes, setNotes] = useState(event?.notes || '')
    const [isFeatured, setIsFeatured] = useState(event?.is_featured || false)

    // Arrays
    const [tags, setTags] = useState<string[]>(event?.tags || [])
    const [tagInput, setTagInput] = useState('')

    const [insights, setInsights] = useState<string[]>(event?.important_insights || [])
    const [insightInput, setInsightInput] = useState('')

    // People Met - with search
    const [selectedPeople, setSelectedPeople] = useState<string[]>([])
    const [showPeopleSelect, setShowPeopleSelect] = useState(false)
    const [peopleSearch, setPeopleSearch] = useState('')

    // Materials
    const [materials, setMaterials] = useState<Array<{
        title: string
        url: string
        type: MaterialType
    }>>([])
    const [showMaterialForm, setShowMaterialForm] = useState(false)
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        url: '',
        type: 'link' as MaterialType
    })

    // Fetch existing event people and materials if editing
    useEffect(() => {
        if (event) {
            fetchEventPeople()
            fetchEventMaterials()
        }
    }, [event])

    const fetchEventPeople = async () => {
        if (!event) return
        try {
            const { data, error } = await supabase
                . from('event_people')
                .select('person_id')
                .eq('event_id', event.id)

            if (error) throw error
            setSelectedPeople(data?. map(ep => ep.person_id) || [])
        } catch (error) {
            console.error('Error fetching event people:', error)
        }
    }

    const fetchEventMaterials = async () => {
        if (!event) return
        try {
            const { data, error } = await supabase
                .from('event_materials')
                .select('*')
                .eq('event_id', event.id)

            if (error) throw error
            setMaterials(data?. map(m => ({ title: m.title, url: m.url || '', type: m.type })) || [])
        } catch (error) {
            console.error('Error fetching event materials:', error)
        }
    }

    const handleAddTag = () => {
        if (tagInput. trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleAddInsight = () => {
        if (insightInput.trim()) {
            setInsights([... insights, insightInput.trim()])
            setInsightInput('')
        }
    }

    const handleRemoveInsight = (index: number) => {
        setInsights(insights.filter((_, i) => i !== index))
    }

    const handleTogglePerson = (personId: string) => {
        if (selectedPeople.includes(personId)) {
            setSelectedPeople(selectedPeople.filter(id => id !== personId))
        } else {
            setSelectedPeople([...selectedPeople, personId])
        }
    }

    const handleAddMaterial = () => {
        if (newMaterial.title.trim()) {
            setMaterials([...materials, { ... newMaterial }])
            setNewMaterial({ title: '', url: '', type: 'link' })
            setShowMaterialForm(false)
        }
    }

    const handleRemoveMaterial = (index: number) => {
        setMaterials(materials.filter((_, i) => i !== index))
    }

    // Filter people based on search
    const filteredPeople = people.filter(person =>
        person.name.toLowerCase(). includes(peopleSearch.toLowerCase()) ||
        person.profession?. toLowerCase().includes(peopleSearch. toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const eventData = {
                user_id: user.id,
                name,
                event_type: eventType,
                venue: venue || null,
                organizer: organizer || null,
                cost,
                certificate_url: certificateUrl || null,
                start_date: startDate || null,
                end_date: endDate || null,
                start_time: startTime || null,
                end_time: endTime || null,
                is_online: isOnline,
                meeting_url: meetingUrl || null,
                registration_url: registrationUrl || null,
                event_info_url: eventInfoUrl || null,
                important_insights: insights. length > 0 ? insights : null,
                tags: tags.length > 0 ?  tags : null,
                notes: notes || null,
                is_featured: isFeatured,
                updated_at: new Date().toISOString(),
            }

            let eventId = event?.id

            if (event) {
                // Update existing event
                const { error } = await supabase
                    .from('events')
                    .update(eventData)
                    .eq('id', event.id)

                if (error) throw error
            } else {
                // Create new event
                const { data, error } = await supabase
                    .from('events')
                    .insert(eventData)
                    .select()
                    .single()

                if (error) throw error
                eventId = data.id
            }

            // Update event_people
            if (eventId) {
                // Delete existing relationships
                await supabase
                    .from('event_people')
                    .delete()
                    .eq('event_id', eventId)

                // Insert new relationships
                if (selectedPeople.length > 0) {
                    const eventPeopleData = selectedPeople.map(personId => ({
                        event_id: eventId,
                        person_id: personId
                    }))

                    const { error: peopleError } = await supabase
                        . from('event_people')
                        .insert(eventPeopleData)

                    if (peopleError) throw peopleError
                }

                // Update event_materials
                // Delete existing materials
                await supabase
                    .from('event_materials')
                    .delete()
                    .eq('event_id', eventId)

                // Insert new materials
                if (materials.length > 0) {
                    const materialsData = materials.map(material => ({
                        event_id: eventId,
                        title: material.title,
                        url: material.url || null,
                        type: material. type
                    }))

                    const { error: materialsError } = await supabase
                        .from('event_materials')
                        . insert(materialsData)

                    if (materialsError) throw materialsError
                }
            }

            router.push('/events')
            router.refresh()
        } catch (error: any) {
            console.error('Error saving event:', error)
            alert(error.message || 'Failed to save event')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Event Name *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., DevFest Surabaya 2024"
                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
            bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
            focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
            placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                />
            </div>

            {/* Event Type & Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Event Type *
                    </label>
                    <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as EventType)}
                        required
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    >
                        {eventTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Cost (0 for free)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={cost}
                        onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                    />
                </div>
            </div>

            {/* Online/Offline Toggle */}
            <div className="flex items-center gap-3 p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
                <input
                    type="checkbox"
                    id="is_online"
                    checked={isOnline}
                    onChange={(e) => setIsOnline(e.target.checked)}
                    className="w-4 h-4"
                />
                <label htmlFor="is_online" className="text-sm text-text dark:text-text-dark cursor-pointer flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    This is an online event (via Zoom, Google Meet, etc.)
                </label>
            </div>

            {/* Venue OR Meeting URL */}
            {isOnline ?  (
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Meeting URL (Zoom, Google Meet, etc.)
                    </label>
                    <input
                        type="url"
                        value={meetingUrl}
                        onChange={(e) => setMeetingUrl(e.target.value)}
                        placeholder="https://zoom.us/j/..."
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Venue
                    </label>
                    <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="e.g., Grand City Convention Center"
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                </div>
            )}

            {/* Organizer */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Organizer
                </label>
                <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g., Google Developer Group"
                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
            bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
            focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
            placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                />
            </div>

            {/* Dates & Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        Start Date & Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        />
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                        End Date & Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        />
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Event URLs */}
            <div className="space-y-4 p-4 bg-background dark:bg-background-dark rounded-lg border-2 border-border dark:border-border-dark">
                <h3 className="text-sm font-semibold text-text dark:text-text-dark flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Event Links
                </h3>

                <div>
                    <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                        Registration URL
                    </label>
                    <input
                        type="url"
                        value={registrationUrl}
                        onChange={(e) => setRegistrationUrl(e.target.value)}
                        placeholder="https://eventbrite.com/..."
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                        Event Info URL
                    </label>
                    <input
                        type="url"
                        value={eventInfoUrl}
                        onChange={(e) => setEventInfoUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-text-secondary dark:text-text-darkSecondary mb-1">
                        Certificate URL
                    </label>
                    <input
                        type="url"
                        value={certificateUrl}
                        onChange={(e) => setCertificateUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                </div>
            </div>

            {/* Important Insights */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Key Insights
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={insightInput}
                        onChange={(e) => setInsightInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInsight())}
                        placeholder="Add important insight and press Enter"
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
              bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
              focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
              placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                    />
                    <Button type="button" onClick={handleAddInsight} variant="outline">
                        Add
                    </Button>
                </div>
                {insights.length > 0 && (
                    <div className="space-y-2">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-2 p-3 bg-background dark:bg-background-dark rounded-lg
                  border border-border dark:border-border-dark"
                            >
                <span className="text-sm text-primary dark:text-primary-dark font-semibold min-w-[20px]">
                  {index + 1}.
                </span>
                                <p className="flex-1 text-sm text-text dark:text-text-dark">{insight}</p>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveInsight(index)}
                                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950
                    rounded transition-colors flex-shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* People Met - IMPROVED UI */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-text dark:text-text-dark">
                        People Met
                    </label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPeopleSelect(!showPeopleSelect)}
                        className="flex items-center gap-1. 5"
                    >
                        {showPeopleSelect ? (
                            <>
                                <X className="w-4 h-4" />
                                <span>Close</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                <span>Add People</span>
                            </>
                        )}
                    </Button>
                </div>

                {showPeopleSelect && (
                    <div className="mb-4 p-4 bg-background dark:bg-background-dark rounded-lg border-2 border-border dark:border-border-dark space-y-3">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-darkSecondary" />
                            <input
                                type="text"
                                value={peopleSearch}
                                onChange={(e) => setPeopleSearch(e.target.value)}
                                placeholder="Search by name or profession..."
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                  bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
                  placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                            />
                            {peopleSearch && (
                                <button
                                    type="button"
                                    onClick={() => setPeopleSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary dark:text-text-darkSecondary
                    hover:text-text dark:hover:text-text-dark transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Results Count */}
                        {filteredPeople.length > 0 && (
                            <p className="text-xs text-text-secondary dark:text-text-darkSecondary">
                                {filteredPeople. length} {filteredPeople.length === 1 ? 'person' : 'people'} found
                                {selectedPeople.length > 0 && ` • ${selectedPeople.length} selected`}
                            </p>
                        )}

                        {/* People List with Custom Scrollbar */}
                        <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
                            {filteredPeople. length === 0 ? (
                                <div className="text-center py-8">
                                    {peopleSearch ? (
                                        <>
                                            <Search className="w-12 h-12 text-text-secondary dark:text-text-darkSecondary mx-auto mb-3 opacity-50" />
                                            <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
                                                No people found matching "{peopleSearch}"
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Users className="w-12 h-12 text-text-secondary dark:text-text-darkSecondary mx-auto mb-3 opacity-50" />
                                            <p className="text-sm text-text-secondary dark:text-text-darkSecondary mb-2">
                                                No people in your contacts yet
                                            </p>
                                            <Link href="/people/new" className="text-xs text-primary dark:text-primary-dark hover:underline">
                                                Add your first contact
                                            </Link>
                                        </>
                                    )}
                                </div>
                            ) : (
                                filteredPeople. map(person => (
                                    <label
                                        key={person.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                            selectedPeople.includes(person.id)
                                                ? 'bg-primary/10 border-2 border-primary/30 dark:border-primary-dark/30'
                                                : 'bg-cardBg dark:bg-cardBg-dark border-2 border-transparent hover:border-border dark:hover:border-border-dark'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPeople.includes(person.id)}
                                            onChange={() => handleTogglePerson(person.id)}
                                            className="w-4 h-4 text-primary focus:ring-primary rounded"
                                        />
                                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary-dark/10
                      flex items-center justify-center text-primary dark:text-primary-dark font-semibold text-sm flex-shrink-0">
                                            {person.name.charAt(0). toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text dark:text-text-dark truncate">
                                                {person.name}
                                            </p>
                                            {person.profession && (
                                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary truncate">
                                                    {person.profession}
                                                </p>
                                            )}
                                        </div>
                                        {selectedPeople.includes(person. id) && (
                                            <div className="w-5 h-5 bg-primary dark:bg-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Selected People Tags */}
                {selectedPeople.length > 0 && (
                    <div>
                        <p className="text-xs text-text-secondary dark:text-text-darkSecondary mb-2">
                            Selected ({selectedPeople.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {selectedPeople. map(personId => {
                                const person = people.find(p => p.id === personId)
                                if (!person) return null
                                return (
                                    <span
                                        key={personId}
                                        className="inline-flex items-center gap-2 px-3 py-1. 5 bg-primary/10 text-primary dark:text-primary-dark
                      rounded-full text-sm font-medium border border-primary/20 dark:border-primary-dark/20"
                                    >
                    <span className="w-5 h-5 rounded-full bg-primary/20 dark:bg-primary-dark/20
                      flex items-center justify-center text-xs font-bold">
                      {person.name. charAt(0).toUpperCase()}
                    </span>
                    <span>{person.name}</span>
                    <button
                        type="button"
                        onClick={() => handleTogglePerson(personId)}
                        className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <X className="w-3. 5 h-3.5" />
                    </button>
                  </span>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Materials */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-text dark:text-text-dark">
                        Materials ({materials.length})
                    </label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMaterialForm(!showMaterialForm)}
                        className="flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Material</span>
                    </Button>
                </div>

                {/* Add Material Form */}
                {showMaterialForm && (
                    <div className="mb-4 p-4 bg-background dark:bg-background-dark rounded-lg border-2 border-border dark:border-border-dark space-y-3">
                        <input
                            type="text"
                            value={newMaterial. title}
                            onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                            placeholder="Material title"
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        />
                        <input
                            type="url"
                            value={newMaterial.url}
                            onChange={(e) => setNewMaterial({ ... newMaterial, url: e. target.value })}
                            placeholder="https://...  (optional)"
                            className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                        />
                        <div className="flex gap-2">
                            <select
                                value={newMaterial. type}
                                onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as MaterialType })}
                                className="flex-1 px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                  bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                  focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors"
                            >
                                {materialTypes.map(type => (
                                    <option key={type. value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <Button type="button" onClick={handleAddMaterial} variant="primary" size="sm">
                                Add
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setShowMaterialForm(false)}
                                variant="outline"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Materials List */}
                {materials.length > 0 && (
                    <div className="space-y-2">
                        {materials.map((material, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-background dark:bg-background-dark rounded-lg
                  border border-border dark:border-border-dark"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text dark:text-text-dark truncate">
                                        {material.title}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {material.url && (
                                            <a
                                                href={material.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary dark:text-primary-dark hover:underline truncate"
                                            >
                                                {material.url}
                                            </a>
                                        )}
                                        <span className="text-xs text-text-secondary dark:text-text-darkSecondary">
                      • {material.type}
                    </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveMaterial(index)}
                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950
                    rounded-lg transition-colors flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
                {tag}
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

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                    Notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Additional notes about this event..."
                    className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
            bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
            focus:outline-none focus:border-primary dark:focus:border-primary-dark transition-colors
            placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary resize-none"
                />
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3 p-4 bg-yellow-500/5 border-2 border-yellow-500/20 rounded-lg">
                <input
                    type="checkbox"
                    id="featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm text-text dark:text-text-dark cursor-pointer">
                    Mark as featured event (highlight important events)
                </label>
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
                    {event ?  'Update Event' : 'Create Event'}
                </Button>
            </div>
        </form>
    )
}
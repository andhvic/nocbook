<nocbook-mcp-guidelines>
=== foundation rules ===

# NocBook MCP Guidelines

The NocBook guidelines are specifically curated for this Next.js productivity application. These guidelines should be followed closely to maintain code quality, consistency, and enhance user satisfaction when building and extending NocBook features.

## Foundational Context
This application is a Next.js 16 application built with TypeScript and Supabase. You are an expert with all these technologies.  Ensure you abide by these specific packages & versions.

**Core Stack:**
- next - 16.0.3
- react - 19.2.0
- react-dom - 19.2. 0
- typescript - ^5
- @supabase/supabase-js - ^2.84.0
- @supabase/ssr - ^0.7.0
- @supabase/auth-helpers-nextjs - ^0.10.0
- tailwindcss - ^3.4.1
- lucide-react - ^0.554.0
- papaparse - ^5.5.3
- xlsx - ^0.18.5

## Application Purpose
NocBook is a comprehensive personal productivity and network management application. It serves as a centralized hub for:
- **People Management**: Track contacts, skills, and professional networks
- **Project Tracking**: Monitor project progress, status, and team members
- **Skill Development**: Log learning progress and skill proficiency
- **Task Management**: Organize tasks with subtasks, priorities, and deadlines
- **Note Taking**: Create and organize knowledge with version control
- **Event Logging**: Record workshops, seminars, and networking events

## Conventions
- You must follow all existing code conventions used in this application.  When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `fetchProjectsWithTeamMembers`, not `getProj()`.
- Check for existing components in `/components/ui/` and feature-specific folders before writing a new one.
- Follow the established pattern: feature folders contain `[FeatureName]Card.tsx` and `[FeatureName]Form.tsx` components.

## Application Structure & Architecture
- Stick to existing directory structure - don't create new base folders without approval.
- Do not change the application's dependencies without approval.
- All pages must use Next.js 13+ App Router conventions (`app/` directory).
- Feature-specific components go in `components/[feature]/` (e.g., `components/people/`, `components/projects/`).

## Data Architecture
- All data is stored in Supabase PostgreSQL database with Row Level Security (RLS) enabled.
- Every table includes: `id` (UUID), `user_id` (FK to auth.users), `created_at`, `updated_at`.
- Use the type definitions from `types/index.ts` - never create duplicate interfaces.

## Replies
- Be concise in your explanations - focus on what's important rather than explaining obvious details.
- When suggesting code changes, provide complete, working examples that follow existing patterns.

## Documentation Files
- You must only create documentation files if explicitly requested by the user.


=== nextjs/v16 rules ===

## Next.js 16 & React 19

- This application uses Next.js 16 with the App Router architecture.
- All pages are in the `app/` directory using the file-based routing convention.
- Use `'use client'` directive for components that need client-side interactivity (state, effects, event handlers).
- Server Components are the default - only add `'use client'` when necessary.

### Routing
- Use `useRouter()` from `'next/navigation'` for client-side navigation, not from `'next/router'`.
- Use `useParams()` from `'next/navigation'` to access dynamic route parameters.
- Use `useSearchParams()` from `'next/navigation'` for URL query parameters.

### Navigation
- Use the `<Link>` component from `'next/link'` for internal navigation.
- Prefer named routes when possible: `<Link href="/people">People</Link>`.
- Use `router.push()` for programmatic navigation after form submissions.

### Data Fetching Pattern
- All data fetching uses Supabase client-side queries within `useEffect` hooks.
- Always check for user authentication before fetching data.
- Handle loading states explicitly with local state.

<code-snippet name="Standard Data Fetching Pattern" lang="tsx">
const [data, setData] = useState<DataType[]>([])
const [loading, setLoading] = useState(true)
const supabase = createClient()

useEffect(() => {
if (user) {
fetchData()
}
}, [user])

const fetchData = async () => {
try {
setLoading(true)
const { data, error } = await supabase
.from('table_name')
.select('*')
.order('created_at', { ascending: false })

    if (error) throw error
    setData(data || [])
} catch (error) {
console.error('Error:', error)
} finally {
setLoading(false)
}
}
</code-snippet>

### Loading States
- Every page must show a loading spinner while `authLoading` or data is loading.
- Use the standardized loading component pattern:

<code-snippet name="Standard Loading State" lang="tsx">
if (authLoading || loading) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
        <p className="text-text-secondary dark:text-text-darkSecondary">Loading...</p>
      </div>
    </div>
  )
}
</code-snippet>


=== typescript rules ===

## TypeScript

- Always use explicit type declarations - never use `any`.
- All interfaces are defined in `types/index.ts` - import from there, never redefine.
- Use type inference for simple cases, but prefer explicit types for function returns and component props.

### Type Declarations
- Always use explicit return type declarations for functions and async functions.
- Use appropriate TypeScript type hints for function parameters.
- Import types using the `import type` syntax when only importing types.

<code-snippet name="Explicit Types" lang="tsx">
import type { Person, PersonFormData } from '@/types'

const fetchPerson = async (id: string): Promise<Person | null> => {
// implementation
}

interface PersonCardProps {
person: Person
onDelete: (id: string) => void
}
</code-snippet>

### React Component Props
- Always define explicit interface for component props.
- Use `React. ReactNode` for children props.
- Use optional properties with `?` for non-required props.

<code-snippet name="Component Props Interface" lang="tsx">
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}
</code-snippet>

### Enums & Union Types
- Prefer string literal union types over enums (already established in types/index.ts).
- Examples: `TaskStatus`, `ProjectCategory`, `SkillLevel`, `NoteType`.


=== supabase rules ===

## Supabase Integration

- Supabase is the backend providing PostgreSQL database, authentication, and real-time features.
- Never use `DB::` or raw SQL - always use Supabase client methods.

### Client Initialization
- Use `createClient()` from `@/lib/supabase` for client-side operations.
- Import as: `import { createClient } from '@/lib/supabase'`.
- Initialize in component: `const supabase = createClient()`.

<code-snippet name="Supabase Client Usage" lang="tsx">
'use client'

import { createClient } from '@/lib/supabase'

export default function SomePage() {
const supabase = createClient()

const fetchData = async () => {
const { data, error } = await supabase
.from('people')
.select('*')
.order('created_at', { ascending: false })

    if (error) throw error
    return data
}
}
</code-snippet>

### Database Operations
- **Select**: Always use `. select('*')` or specify exact columns.
- **Insert**: Use `.insert([{ ...  }])` with array, then chain `.select()` to get created record.
- **Update**: Use `. update({ ... })` with `. eq()` filter.
- **Delete**: Use `. delete()` with `.eq()` filter.
- **Order**: Use `.order('column', { ascending: true/false })`.

<code-snippet name="Common Supabase Patterns" lang="tsx">
// Insert
const { data, error } = await supabase
  .from('projects')
  .insert([{
    user_id: user.id,
    title: formData.title,
    status: 'planning'
  }])
  .select()

// Update
const { error } = await supabase
. from('projects')
.update({ status: 'completed' })
.eq('id', projectId)

// Delete
const { error } = await supabase
.from('projects')
.delete()
.eq('id', projectId)

// Query with filters
const { data } = await supabase
.from('tasks')
.select('*')
.eq('status', 'done')
. gte('due_date', '2024-01-01')
.order('created_at', { ascending: false })
</code-snippet>

### Row Level Security (RLS)
- All database operations automatically filter by authenticated user's `user_id`.
- Never manually filter by `user_id` in queries - RLS handles this.
- Always ensure user is authenticated before database operations.

### Error Handling
- Always check for `error` in Supabase responses.
- Use try-catch blocks for async Supabase operations.
- Log errors to console for debugging.


=== authentication rules ===

## Authentication & Authorization

- Authentication is handled by Supabase Auth with middleware protection.
- Use the `useAuth` hook to access current user state.

### useAuth Hook Pattern
- Import: `import { useAuth } from '@/hooks/useAuth'`.
- Destructure: `const { user, loading: authLoading } = useAuth()`.
- Always check `authLoading` before redirecting unauthenticated users.

<code-snippet name="Standard Auth Check Pattern" lang="tsx">
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
const { user, loading: authLoading } = useAuth()
const router = useRouter()

useEffect(() => {
if (!authLoading && !user) {
router. push('/login')
}
}, [user, authLoading, router])

if (authLoading) {
return <LoadingSpinner />
}

if (!user) return null

return <div>Protected Content</div>
}
</code-snippet>

### Protected Routes
- Middleware automatically protects: `/dashboard`, `/people`, `/projects`, `/skills`, `/events`, `/tasks`, `/notes`, `/logs`.
- Redirects to `/login` if user is not authenticated.
- Redirects to `/dashboard` if authenticated user tries to access `/login` or `/register`.

### User Context
- Current user accessible via `user` object from `useAuth()`.
- User ID accessible via `user.id` for database operations.
- User email accessible via `user.email` for display purposes.


=== ui/component rules ===

## UI Components & Design System

- All reusable UI components are in `components/ui/`.
- Feature-specific components are in `components/[feature]/`.
- Use existing components before creating new ones.

### Available UI Components
- **Button** (`components/ui/Button.tsx`): Primary, secondary, outline, ghost, danger variants
- **Input** (`components/ui/Input.tsx`): Text inputs with label and error support
- **Textarea** (`components/ui/Textarea.tsx`): Multi-line text inputs
- **TagInput** (`components/ui/TagInput.tsx`): Dynamic tag management
- **DropdownMenu** (`components/ui/DropdownMenu.tsx`): Dropdown menu with items
- **ThemeToggle** (`components/ui/ThemeToggle.tsx`): Dark mode toggle

### Button Component Usage

<code-snippet name="Button Component" lang="tsx">
import { Button } from '@/components/ui/Button'

<Button variant="primary" size="md" loading={loading}>
  Save Changes
</Button>

<Button variant="outline" size="sm" onClick={handleCancel}>
  Cancel
</Button>

<Button variant="ghost" size="lg">
  <Plus className="w-5 h-5" />
  Add New
</Button>
</code-snippet>

### Input Component Usage

<code-snippet name="Input Component" lang="tsx">
import { Input } from '@/components/ui/Input'

<Input
label="Name"
name="name"
value={formData.name}
onChange={handleChange}
placeholder="John Doe"
required
error={errors.name}
/>
</code-snippet>

### Feature Component Pattern
- Each feature has a `[Feature]Card` component for display (e.g., `PersonCard`, `ProjectCard`).
- Each feature has a `[Feature]Form` component for create/edit (e.g., `PersonForm`, `ProjectForm`).
- Cards include action buttons (Edit, Delete, View) using DropdownMenu.

<code-snippet name="Feature Card Pattern" lang="tsx">
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu'
import { Edit, Trash2, Eye } from 'lucide-react'

<DropdownMenu>
  <DropdownItem
    icon={<Eye className="w-4 h-4" />}
    label="View Details"
    onClick={() => router.push(`/projects/${project.id}`)}
  />
  <DropdownItem
    icon={<Edit className="w-4 h-4" />}
    label="Edit"
    onClick={() => setEditMode(true)}
  />
  <DropdownItem
    icon={<Trash2 className="w-4 h-4" />}
    label="Delete"
    onClick={() => setShowDeleteConfirm(true)}
    variant="danger"
  />
</DropdownMenu>
</code-snippet>

### Icons
- Use Lucide React icons exclusively: `import { IconName } from 'lucide-react'`.
- Common icons: Users, FolderKanban, Award, Calendar, Plus, Search, Filter, Edit, Trash2, Eye, etc.
- Icon size: `className="w-5 h-5"` for normal, `w-4 h-4` for small, `w-6 h-6` for large.


=== styling rules ===

## Tailwind CSS & Dark Mode

- Use Tailwind utility classes exclusively - no custom CSS files.
- Full dark mode support is implemented and mandatory for all new components.
- Follow existing color patterns from `tailwind.config.ts`.

### Dark Mode Pattern
- Every component must support both light and dark modes.
- Use `dark:` prefix for dark mode variants.
- Follow existing color conventions strictly.

<code-snippet name="Dark Mode Class Pattern" lang="tsx">
<div className="bg-cardBg dark:bg-cardBg-dark 
                border-2 border-border dark:border-border-dark 
                text-text dark:text-text-dark">
  <p className="text-text-secondary dark:text-text-darkSecondary">
    Secondary text
  </p>
</div>
</code-snippet>

### Standard Color Classes
- **Background**: `bg-background dark:bg-background-dark`
- **Card Background**: `bg-cardBg dark:bg-cardBg-dark`
- **Text**: `text-text dark:text-text-dark`
- **Secondary Text**: `text-text-secondary dark:text-text-darkSecondary`
- **Border**: `border-border dark:border-border-dark`
- **Primary**: `text-primary dark:text-primary-dark` or `bg-primary dark:bg-primary-dark`
- **Accent**: `text-accent dark:text-accent-dark`

### Status Colors
- **Success/Green**: `text-green-600 dark:text-green-400`, `bg-green-500/10`
- **Warning/Yellow**: `text-yellow-600 dark:text-yellow-400`, `bg-yellow-500/10`
- **Error/Red**: `text-red-600 dark:text-red-400`, `bg-red-500/10`
- **Info/Blue**: `text-blue-600 dark:text-blue-400`, `bg-blue-500/10`

### Responsive Design
- Mobile-first approach: Base styles for mobile, then use breakpoints.
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.
- Common pattern: `text-sm md:text-base lg:text-lg`.
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

### Common Layout Patterns

<code-snippet name="Card Container" lang="tsx">
<div className="bg-cardBg dark:bg-cardBg-dark 
                border-2 border-border dark:border-border-dark 
                rounded-xl p-6
                hover:border-primary dark:hover:border-primary-dark
                transition-all duration-200">
  {/* Content */}
</div>
</code-snippet>

<code-snippet name="Page Header" lang="tsx">
<div className="flex items-start justify-between gap-3 mb-6">
  <div className="flex-1 min-w-0">
    <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark mb-1">
      Page Title
    </h1>
    <p className="text-text-secondary dark:text-text-darkSecondary text-sm">
      Page description
    </p>
  </div>
  <Link href="/feature/new">
    <Button variant="primary" size="sm">
      <Plus className="w-4 h-4" />
      Add New
    </Button>
  </Link>
</div>
</code-snippet>


=== form rules ===

## Form Handling & Validation

- Use controlled components with React state for all forms.
- Validate data before submission to Supabase.
- Show loading state during submission.
- Display error messages clearly.
- Redirect after successful submission.

### Form State Pattern

<code-snippet name="Standard Form Pattern" lang="tsx">
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [formData, setFormData] = useState<FormDataType>({
  // initial values
})

const handleInputChange = (e: React. ChangeEvent<HTMLInputElement>) => {
const { name, value } = e.target
setFormData(prev => ({ ...prev, [name]: value }))
}

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault()

if (!user) {
setError('You must be logged in')
return
}

// Validation
if (!formData.title. trim()) {
setError('Title is required')
return
}

setLoading(true)
setError('')

try {
const { data, error: insertError } = await supabase
.from('table_name')
.insert([{
user_id: user. id,
... formData
}])
.select()

    if (insertError) throw insertError
    
    router.push('/feature')
    router.refresh()
} catch (err: any) {
console.error('Error:', err)
setError(err.message || 'Failed to save')
} finally {
setLoading(false)
}
}
</code-snippet>

### Form Validation
- Validate required fields before submission.
- Trim string inputs before saving.
- Convert empty strings to `null` for optional database fields.
- Check for user authentication at form submission start.

### Select Dropdowns
- Use native `<select>` elements with Tailwind styling.
- Provide clear default option: `<option value="">Select... </option>`.
- Style consistently with other inputs.

<code-snippet name="Select Dropdown" lang="tsx">
<select
  value={selectedValue}
  onChange={(e) => setSelectedValue(e.target. value)}
  className="w-full px-4 py-2 rounded-lg border-2 
             border-border dark:border-border-dark
             bg-background dark:bg-background-dark 
             text-text dark:text-text-dark
             focus:outline-none 
             focus:border-primary dark:focus:border-primary-dark 
             transition-colors"
>
  <option value="">Select category...</option>
  {categories.map(cat => (
    <option key={cat} value={cat}>{cat}</option>
  ))}
</select>
</code-snippet>


=== page rules ===

## Page Structure & Patterns

- Every feature follows consistent page structure.
- Pages include: List view, Detail view, New/Create view, Edit view (usually inline).

### Standard Page Structure

<code-snippet name="List Page Pattern" lang="tsx">
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'

export default function FeaturePage() {
const { user, loading: authLoading } = useAuth()
const router = useRouter()
const [items, setItems] = useState<ItemType[]>([])
const [loading, setLoading] = useState(true)
const supabase = createClient()

// Auth check
useEffect(() => {
if (!authLoading && !user) {
router. push('/login')
}
}, [user, authLoading, router])

// Fetch data
useEffect(() => {
if (user) {
fetchItems()
}
}, [user])

const fetchItems = async () => {
try {
setLoading(true)
const { data, error } = await supabase
.from('items')
.select('*')
.order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
}

// Loading states
if (authLoading || loading) {
return <LoadingState />
}

if (!user) return null

return (
<div className="space-y-6">
{/* Header */}
{/* Filters */}
{/* Stats */}
{/* Grid/List of items */}
</div>
)
}
</code-snippet>

### Detail Page Pattern

<code-snippet name="Detail Page Pattern" lang="tsx">
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function FeatureDetailPage() {
const params = useParams()
const itemId = params.id as string
const [item, setItem] = useState<ItemType | null>(null)
const [editMode, setEditMode] = useState(false)
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

// Check URL for edit parameter
useEffect(() => {
if (typeof window !== 'undefined') {
const urlParams = new URLSearchParams(window.location. search)
if (urlParams.get('edit') === 'true') {
setEditMode(true)
}
}
}, [])

// Fetch item by ID
// Handle edit mode toggle
// Handle delete
}
</code-snippet>

### New/Create Page Pattern
- Use consistent back button with ArrowLeft icon.
- Display form in card with proper styling.
- Fetch related data (e.g., people for project team members).

<code-snippet name="Create Page Pattern" lang="tsx">
export default function NewFeaturePage() {
  // ... auth and data fetching

return (
<div className="max-w-4xl mx-auto space-y-6">
<div className="flex items-center gap-4">
<Link
href="/feature"
className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark
rounded-lg transition-colors"
>
<ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
</Link>
<div>
<h1 className="text-2xl md:text-3xl font-bold
text-text dark:text-text-dark">
Create New Item
</h1>
<p className="text-text-secondary dark:text-text-darkSecondary
text-sm mt-1">
Fill in the details below
</p>
</div>
</div>

      <div className="bg-cardBg dark:bg-cardBg-dark 
                      border-2 border-border dark:border-border-dark 
                      rounded-xl p-6 md:p-8">
        <FeatureForm />
      </div>
    </div>
)
}
</code-snippet>


=== data/type rules ===

## Data Models & Types

- All type definitions are in `types/index.ts`.
- Never redefine or duplicate types - always import from types file.
- Follow existing type patterns when adding new features.

### Core Data Models

**Person**: Contacts and network management
- Fields: name, profession, role, skills[], tags[], contacts{}, notes
- Contacts include: instagram, whatsapp, linkedin, github, discord, email, phone, twitter, telegram, website

**Project**: Project tracking and management
- Category: school | competition | personal | client | startup | web | iot | ai | mobile | api
- Status: idea | planning | in-progress | on-hold | completed | cancelled
- Priority: low | medium | high | urgent
- Fields: title, description, progress (0-100), deadline, team_members[], tech_stack[], github_url, demo_url

**Skill**: Learning progress tracking
- Category: web | mobile | iot | ai | devops | data | embedded | design | soft-skill
- Type: language | framework | library | tool | platform | hardware | soft-skill
- Level: beginner | intermediate | advanced | expert
- Difficulty: easy | medium | hard | insane
- Fields: name, progress, practice_hours, resources[], projects_count

**Task**: To-do and task management
- Category: school | content | project | personal | learning | work | health | other
- Priority: low | medium | high | urgent
- Status: not-started | in-progress | done | blocked | cancelled
- Fields: title, description, due_date, due_time, estimated_time, progress, is_recurring
- Relations: skill_id, project_id, event_id
- Subtasks: Separate table with task_id foreign key

**Note**: Knowledge management with versioning
- Type: formula | tutorial | concept | troubleshooting | reference | code-snippet | other
- Fields: title, content, excerpt, category, tags[], is_pinned, is_favorite, view_count, version
- Relations: skill_id, project_id, event_id, task_id
- Features: Version history, backlinks, linked notes

**Event**: Workshop and activity logging
- Type: seminar | workshop | competition | meetup | conference
- Fields: name, venue, start_date, end_date, start_time, end_time, is_online, meeting_url, organizer, cost
- Materials: Separate table with event_id foreign key

### Array Fields
- Skills, tags, tech_stack, team_members are stored as PostgreSQL arrays.
- In TypeScript: `string[]` or `string[] | undefined`.
- Check for null/undefined before mapping: `skill?. tags?.map()` or `tags ??  []`.

### Optional vs Required
- Use `?` for optional fields in interfaces.
- Required fields: id, user_id, created_at, updated_at, and primary field (name/title).
- Most descriptive fields are optional (description, notes, etc.).


=== feature rules ===

## Feature Implementation Guidelines

When implementing a new feature or modifying existing ones, follow these patterns:

### 1. Database Schema
- Create Supabase table with RLS policies enabled
- Include standard fields: id, user_id, created_at, updated_at
- Add feature-specific fields following naming conventions

### 2. Type Definitions
- Add interfaces to `types/index.ts`
- Define union types for categories, statuses, priorities
- Include form data interfaces if different from main interface

### 3. Page Structure
- Create folder in `app/[feature]/`
- Files: `page.tsx` (list), `new/page.tsx` (create), `[id]/page.tsx` (detail)
- Follow existing auth and data fetching patterns

### 4. Components
- Create `components/[feature]/` folder
- Create `[Feature]Card.tsx` for item display
- Create `[Feature]Form.tsx` for create/edit
- Use existing UI components from `components/ui/`

### 5. Features Checklist
- [ ] Search and filter functionality
- [ ] Export to CSV/Excel (if applicable)
- [ ] Mobile-responsive design
- [ ] Dark mode support
- [ ] Loading and error states
- [ ] Delete confirmation modals
- [ ] Statistics/summary cards
- [ ] Proper TypeScript types

### Common Feature Patterns

**Statistics Cards**: Display counts and metrics at top of list pages
**Filter Sidebar**: Desktop sidebar with mobile dropdown for filters
**Empty States**: Show helpful message when no data exists
**Action Buttons**: Use DropdownMenu for Edit/Delete/View actions
**Form Sections**: Group related fields in cards with section headers
**Tag Management**: Use TagInput component for dynamic tag arrays


=== import/export rules ===

## Data Import/Export

- People feature supports CSV import/export using PapaParse.
- Export functionality uses both CSV (PapaParse) and Excel (XLSX) formats.

### CSV Export Pattern

<code-snippet name="CSV Export with PapaParse" lang="tsx">
import Papa from 'papaparse'

const exportToCSV = () => {
const csvData = items.map(item => ({
Name: item.name,
Email: item.email,
// ...  other fields
}))

const csv = Papa.unparse(csvData)
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
const link = document.createElement('a')
link.href = URL.createObjectURL(blob)
link.download = `items_${new Date().toISOString()}.csv`
link. click()
}
</code-snippet>

### Excel Export Pattern

<code-snippet name="Excel Export with XLSX" lang="tsx">
import * as XLSX from 'xlsx'

const exportToExcel = () => {
const excelData = items.map(item => ({
Name: item. name,
Email: item. email,
// ... other fields
}))

const worksheet = XLSX.utils. json_to_sheet(excelData)
const workbook = XLSX.utils.book_new()
XLSX.utils. book_append_sheet(workbook, worksheet, 'Items')
XLSX.writeFile(workbook, `items_${new Date().toISOString()}.xlsx`)
}
</code-snippet>

### CSV Import Pattern
- Use file input with `accept=". csv"`
- Parse with PapaParse
- Validate required fields
- Show preview before import
- Bulk insert to Supabase


=== error/loading rules ===

## Error Handling & Loading States

- Always implement proper error handling and loading states.
- Show user-friendly error messages.
- Log errors to console for debugging.

### Error Display Pattern

<code-snippet name="Error Message Display" lang="tsx">
{error && (
  <div className="p-4 rounded-lg bg-red-500/10 
                  border border-red-500 dark:border-red-400
                  text-red-500 dark:text-red-400 text-sm">
    {error}
  </div>
)}
</code-snippet>

### Loading State Pattern
- Global page loading: Full-screen centered spinner
- Component loading: Inline skeleton or spinner
- Button loading: Show spinner in button with `loading` prop

### Delete Confirmation Pattern

<code-snippet name="Delete Confirmation Modal" lang="tsx">
{showDeleteConfirm && (
  <div className="fixed inset-0 bg-black/50 flex items-center 
                  justify-center z-50 p-4">
    <div className="bg-cardBg dark:bg-cardBg-dark rounded-xl p-6 
                    max-w-md w-full border-2 border-border 
                    dark:border-border-dark">
      <h3 className="text-lg font-semibold text-text 
                     dark:text-text-dark mb-2">
        Confirm Delete
      </h3>
      <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
        Are you sure you want to delete this item? 
        This action cannot be undone. 
      </p>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleDelete}
          loading={deleting}
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
)}
</code-snippet>


=== routing/navigation rules ===

## Routing & Navigation Patterns

### URL Patterns
- List: `/feature`
- Create: `/feature/new`
- Detail: `/feature/[id]`
- Edit: `/feature/[id]? edit=true` (usually inline toggle)

### Navigation After Actions
- After create: `router.push('/feature')` then `router.refresh()`
- After update: Stay on detail page or return to list
- After delete: `router.push('/feature')` then `router.refresh()`

### Back Navigation
- Use Link component with ArrowLeft icon
- Consistent positioning and styling across all pages

<code-snippet name="Standard Back Button" lang="tsx">
<Link
  href="/feature"
  className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark 
             rounded-lg transition-colors"
>
  <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
</Link>
</code-snippet>


=== relationship rules ===

## Data Relationships

- **People → Projects**: Many-to-many via `team_members` array (stores Person IDs)
- **Projects → Tasks**: One-to-many via `project_id` foreign key
- **Skills → Notes**: Many-to-many via `skill_id` field in notes
- **Tasks → Subtasks**: One-to-many via `task_id` foreign key in subtasks table
- **Notes → NoteVersions**: One-to-many via `note_id` foreign key

### Fetching Related Data

<code-snippet name="Fetch with Related Data" lang="tsx">
// Fetch project with team member details
const { data: project } = await supabase
  .from('projects')
  .select('*')
  .eq('id', projectId)
  .single()

// Separately fetch people for team members
if (project.team_members?. length > 0) {
const { data: people } = await supabase
.from('people')
.select('id, name')
.in('id', project.team_members)

// Map to get names
const teamMemberNames = people?. map(p => p.name). join(', ')
}
</code-snippet>

### Linking Entities
- Use dropdowns to select related entities when creating/editing
- Show related entity names in detail views (fetch by ID)
- Support unlinking by clearing the foreign key field


=== mobile/responsive rules ===

## Mobile & Responsive Design

- Mobile-first approach: Base styles for mobile, scale up for desktop
- Test all features on mobile viewport
- Use horizontal scrolling for stats cards on mobile

### Responsive Patterns

<code-snippet name="Responsive Grid" lang="tsx">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Items */}
</div>
</code-snippet>

<code-snippet name="Mobile Header" lang="tsx">
<div className="flex flex-col md:flex-row items-start md:items-center 
                justify-between gap-3 md:gap-4">
  <h1 className="text-2xl md:text-3xl font-bold">Title</h1>
  <Button size="sm" className="md:size-md">Action</Button>
</div>
</code-snippet>

<code-snippet name="Mobile Filters" lang="tsx">
{/* Desktop: Sidebar */}
<div className="hidden lg:block">
  <FilterSidebar />
</div>

{/* Mobile: Toggle button + dropdown */}
<div className="lg:hidden">
  <button onClick={() => setShowFilters(!showFilters)}>
    <Filter className="w-4 h-4" />
  </button>
  {showFilters && <FilterDropdown />}
</div>
</code-snippet>

### Touch Targets
- Minimum touch target: 44x44px (use `p-3` or similar)
- Adequate spacing between clickable elements
- Larger buttons on mobile when appropriate


=== performance rules ===

## Performance & Optimization

### Database Queries
- Fetch only required columns when possible: `. select('id, name, email')`
- Use pagination for large datasets (implement when needed)
- Order results consistently for predictable UI

### Component Optimization
- Use React.memo() for expensive components (if needed)
- Avoid unnecessary re-renders with proper useEffect dependencies
- Minimize state updates in tight loops

### Loading Strategy
- Show loading states immediately when action starts
- Don't block UI for non-critical operations
- Use optimistic UI updates when appropriate


=== testing rules ===

## Testing & Quality Assurance

### Manual Testing Checklist
Before finalizing any feature, test:
- [ ] Create operation works correctly
- [ ] Read/list operation displays data properly
- [ ] Update operation saves changes
- [ ] Delete operation removes data
- [ ] Dark mode works correctly
- [ ] Mobile responsive layout works
- [ ] Loading states display properly
- [ ] Error states show user-friendly messages
- [ ] Form validation works
- [ ] Auth protection works (logout and try to access page)

### Common Issues to Check
- Null/undefined values in arrays (use optional chaining)
- Missing dark mode classes
- Incorrect type imports
- Forgot to add `'use client'` directive
- Missing auth checks
- No loading states
- Uncaught promise rejections


=== code-style rules ===

## Code Style & Conventions

### Naming Conventions
- **Components**: PascalCase (e. g., `ProjectCard`, `TaskForm`)
- **Functions**: camelCase (e.g., `fetchProjects`, `handleSubmit`)
- **Files**: Component files use PascalCase, others use camelCase
- **Types**: PascalCase for interfaces, Union types start with type name

### Import Order
1. React & Next.js imports
2. Third-party libraries
3. Local components
4. Local utilities & hooks
5. Types
6. Styles (if any)

<code-snippet name="Import Order Example" lang="tsx">
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/projects/ProjectCard'
import type { Project, Person } from '@/types'
import { Plus, Search, Filter } from 'lucide-react'
</code-snippet>

### Code Organization
- Group related state declarations together
- Place hooks at top of component
- Define event handlers before JSX
- Keep components focused and single-responsibility
- Extract complex logic to helper functions

### Comments
- Add comments for complex logic only
- Prefer self-documenting code with clear variable names
- Use JSDoc for public functions if needed


=== security rules ===

## Security Best Practices

### Authentication
- Always check `user` exists before database operations
- Never trust client-side data alone
- Rely on RLS policies for data security

### Input Sanitization
- Trim user inputs before saving: `value.trim()`
- Validate required fields client-side
- Supabase handles SQL injection protection

### Sensitive Data
- Never log sensitive information
- Don't expose API keys in client code
- Use environment variables for configuration


=== conclusion ===

## Summary

These guidelines ensure consistency, quality, and maintainability across the NocBook application. When in doubt:

1. **Check existing code** for similar patterns
2. **Follow the type definitions** in `types/index.ts`
3. **Maintain dark mode support** in all components
4. **Implement auth checks** on all protected pages
5. **Use existing UI components** before creating new ones
6. **Test on mobile** viewport
7. **Handle loading and error states** properly

Always prioritize user experience, code consistency, and type safety.

</nocbook-mcp-guidelines>
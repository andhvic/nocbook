import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies })

        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const format = searchParams.get('format') || 'xlsx'
        const role = searchParams.get('role')
        const tag = searchParams.get('tag')
        const skill = searchParams.get('skill')

        // Build query dengan filters
        let query = supabase
            .from('people')
            .select('*')
            .order('name', { ascending: true })

        if (role) {
            query = query.eq('role', role)
        }

        if (tag) {
            query = query.contains('tags', [tag])
        }

        if (skill) {
            query = query.contains('skills', [skill])
        }

        const { data: people, error } = await query

        if (error) throw error

        if (!people || people.length === 0) {
            return NextResponse.json({ error: 'No data to export' }, { status: 404 })
        }

        // Transform data untuk export
        const exportData = people.map(person => ({
            name: person.name,
            profession: person.profession || '',
            role: person.role || '',
            skills: person.skills ? person.skills.join(', ') : '',
            tags: person.tags ? person.tags.join(', ') : '',
            instagram: person.contacts?.instagram || '',
            whatsapp: person.contacts?.whatsapp || '',
            linkedin: person.contacts?.linkedin || '',
            github: person.contacts?.github || '',
            discord: person.contacts?.discord || '',
            email: person.contacts?.email || '',
            phone: person.contacts?.phone || '',
            twitter: person.contacts?.twitter || '',
            telegram: person.contacts?.telegram || '',
            website: person.contacts?.website || '',
            notes: person.notes || '',
            created_at: new Date(person.created_at).toLocaleDateString()
        }))

        if (format === 'csv') {
            // Export CSV
            const csv = Papa.unparse(exportData)

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="nocbook-people-${Date.now()}.csv"`
                }
            })
        } else {
            // Export Excel
            const ws = XLSX.utils.json_to_sheet(exportData)

            // Set column widths
            ws['!cols'] = [
                { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 30 }, { wch: 25 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 },
                { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
                { wch: 30 }, { wch: 12 }
            ]

            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'People')

            const buffer = XLSX.write(wb, {
                type: 'buffer',
                bookType: format === 'xls' ? 'xls' : 'xlsx'
            })

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="nocbook-people-${Date.now()}.${format}"`
                }
            })
        }
    } catch (error: any) {
        console.error('Export error:', error)
        return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 })
    }
}
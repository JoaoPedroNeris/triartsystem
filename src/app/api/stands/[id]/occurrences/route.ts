import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { queryD1 } from '@/lib/cloudflare/d1'
import { getAuthFromCookies } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const auth = await getAuthFromCookies(cookieStore)

    if (!auth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const allStands = request.nextUrl.searchParams.get('all') === 'true'

    let occurrences
    if (allStands) {
      // Dashboard mode: get ALL occurrences across all stands
      occurrences = await queryD1<{ id: number; stand_id: number; title: string; description: string; priority: string; status: string; created_at: string; created_by: string; resolved_at: string | null; resolved_by: string | null }>(
        'SELECT id, stand_id, title, description, priority, status, created_at, created_by, resolved_at, resolved_by FROM occurrences ORDER BY created_at DESC'
      )
    } else {
      occurrences = await queryD1<{ id: number; stand_id: number; title: string; description: string; priority: string; status: string; created_at: string; created_by: string; resolved_at: string | null; resolved_by: string | null }>(
        'SELECT id, stand_id, title, description, priority, status, created_at, created_by, resolved_at, resolved_by FROM occurrences WHERE stand_id = ? ORDER BY created_at DESC',
        [id]
      )
    }

    return Response.json({
      occurrences: occurrences.map((o) => ({
        id: o.id,
        standId: o.stand_id,
        title: o.title,
        description: o.description,
        priority: o.priority,
        status: o.status,
        createdAt: o.created_at,
        createdBy: o.created_by,
        resolvedAt: o.resolved_at,
        resolvedBy: o.resolved_by,
      })),
    })
  } catch (error) {
    console.error('Occurrences GET error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const auth = await getAuthFromCookies(cookieStore)

    if (!auth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, priority } = body

    if (!title || !description || !priority) {
      return Response.json(
        { error: 'title, description e priority sao obrigatorios' },
        { status: 400 }
      )
    }

    const validPriorities = ['leve', 'media', 'extrema']
    if (!validPriorities.includes(priority)) {
      return Response.json(
        { error: 'priority deve ser "leve", "media" ou "extrema"' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    await queryD1(
      'INSERT INTO occurrences (stand_id, title, description, priority, status, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, priority, 'aberta', now, auth.email]
    )

    // Return the newly created occurrence
    const rows = await queryD1<{ id: number; stand_id: number; title: string; description: string; priority: string; status: string; created_at: string; created_by: string; resolved_at: string | null; resolved_by: string | null }>(
      'SELECT id, stand_id, title, description, priority, status, created_at, created_by, resolved_at, resolved_by FROM occurrences WHERE stand_id = ? ORDER BY id DESC LIMIT 1',
      [id]
    )

    const occurrence = rows[0]

    return Response.json({
      occurrence: {
        id: occurrence.id,
        standId: occurrence.stand_id,
        title: occurrence.title,
        description: occurrence.description,
        priority: occurrence.priority,
        status: occurrence.status,
        createdAt: occurrence.created_at,
        createdBy: occurrence.created_by,
        resolvedAt: occurrence.resolved_at,
        resolvedBy: occurrence.resolved_by,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Occurrences POST error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const auth = await getAuthFromCookies(cookieStore)

    if (!auth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { occurrenceId, resolved } = body

    if (occurrenceId === undefined || resolved === undefined) {
      return Response.json(
        { error: 'occurrenceId e resolved sao obrigatorios' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    if (resolved) {
      await queryD1(
        'UPDATE occurrences SET status = ?, resolved_at = ?, resolved_by = ? WHERE id = ? AND stand_id = ?',
        ['resolvida', now, auth.email, String(occurrenceId), id]
      )
    } else {
      await queryD1(
        'UPDATE occurrences SET status = ?, resolved_at = NULL, resolved_by = NULL WHERE id = ? AND stand_id = ?',
        ['aberta', String(occurrenceId), id]
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Occurrences PUT error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

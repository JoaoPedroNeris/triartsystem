import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { queryD1 } from '@/lib/cloudflare/d1'
import { getAuthFromCookies } from '@/lib/auth'
import { DEFAULT_CHECKLIST_ITEMS } from '@/data/defaultChecklist'

type ChecklistRow = { id: number; category: string; label: string; checked: number; checked_at: string | null; checked_by: string | null }

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
    const standId = id

    const stands = await queryD1<{ id: number; label: string; notes: string; updated_at: string; updated_by: string }>(
      'SELECT id, label, notes, updated_at, updated_by FROM stands WHERE id = ?',
      [standId]
    )

    if (stands.length === 0) {
      return Response.json({ error: 'Stand nao encontrado' }, { status: 404 })
    }

    const stand = stands[0]

    // Fetch checklist with lazy initialization
    let checklistItems = await queryD1<ChecklistRow>(
      'SELECT id, category, label, checked, checked_at, checked_by FROM checklist_items WHERE stand_id = ? ORDER BY id',
      [standId]
    )

    if (checklistItems.length === 0) {
      try {
        const rows: string[][] = []
        const placeholders: string[] = []
        for (const [category, labels] of Object.entries(DEFAULT_CHECKLIST_ITEMS)) {
          for (const label of labels) {
            placeholders.push('(?, ?, ?, 0)')
            rows.push([standId, category, label])
          }
        }
        const params = rows.flat()
        await queryD1(
          `INSERT INTO checklist_items (stand_id, category, label, checked) VALUES ${placeholders.join(', ')}`,
          params
        )

        checklistItems = await queryD1<ChecklistRow>(
          'SELECT id, category, label, checked, checked_at, checked_by FROM checklist_items WHERE stand_id = ? ORDER BY id',
          [standId]
        )
      } catch (e) {
        console.error('Checklist lazy-init error:', e)
      }
    }

    // Fetch remaining data in parallel
    const [materials, teamMembers, occurrences, photos, files, driveLinks] =
      await Promise.all([
        queryD1<{ id: number; name: string; quantity: number; confirmed: number; confirmed_at: string | null; confirmed_by: string | null }>(
          'SELECT id, name, quantity, confirmed, confirmed_at, confirmed_by FROM materials WHERE stand_id = ? ORDER BY id',
          [standId]
        ),
        queryD1<{ id: number; team: string; name: string }>(
          'SELECT id, team, name FROM team_members WHERE stand_id = ? ORDER BY id',
          [standId]
        ),
        queryD1<{ id: number; stand_id: number; title: string; description: string; priority: string; resolved: number; created_at: string; created_by: string; resolved_at: string | null; resolved_by: string | null }>(
          'SELECT id, stand_id, title, description, priority, resolved, created_at, created_by, resolved_at, resolved_by FROM occurrences WHERE stand_id = ? ORDER BY created_at DESC',
          [standId]
        ),
        queryD1<{ id: number; url: string; storage_path: string; caption: string | null; uploaded_at: string; uploaded_by: string }>(
          'SELECT id, url, storage_path, caption, uploaded_at, uploaded_by FROM photos WHERE stand_id = ? ORDER BY uploaded_at DESC',
          [standId]
        ),
        queryD1<{ id: number; filename: string; url: string; size: number; uploaded_at: string; uploaded_by: string }>(
          'SELECT id, filename, url, size, uploaded_at, uploaded_by FROM files WHERE stand_id = ? ORDER BY uploaded_at DESC',
          [standId]
        ),
        queryD1<{ id: number; title: string; url: string; added_at: string; added_by: string }>(
          'SELECT id, title, url, added_at, added_by FROM drive_links WHERE stand_id = ? ORDER BY added_at DESC',
          [standId]
        ),
      ])

    // Group checklist by category
    const checklist: Record<string, any[]> = {
      eletrica: [],
      marcenaria: [],
      tapecaria: [],
      comunicacaoVisual: [],
    }
    for (const item of checklistItems) {
      if (checklist[item.category]) {
        checklist[item.category].push({
          id: item.id,
          label: item.label,
          checked: Boolean(item.checked),
          checkedAt: item.checked_at,
          checkedBy: item.checked_by,
        })
      }
    }

    // Group team by type
    const team: Record<string, string[]> = {
      marcenaria: [],
      producao: [],
    }
    for (const member of teamMembers) {
      if (team[member.team]) {
        team[member.team].push(member.name)
      }
    }

    return Response.json({
      stand: {
        id: stand.id,
        label: stand.label || '',
        notes: stand.notes || '',
        updatedAt: stand.updated_at,
        updatedBy: stand.updated_by,
        checklist,
        materials: materials.map((m) => ({
          id: m.id,
          name: m.name,
          quantity: m.quantity,
          confirmed: Boolean(m.confirmed),
          confirmedAt: m.confirmed_at,
          confirmedBy: m.confirmed_by,
        })),
        team,
        teamMembers: teamMembers.map((m) => ({
          id: m.id,
          team: m.team,
          name: m.name,
        })),
        occurrences: occurrences.map((o) => ({
          id: o.id,
          standId: o.stand_id,
          title: o.title,
          description: o.description,
          priority: o.priority,
          status: o.resolved ? 'resolvida' : 'aberta',
          createdAt: o.created_at,
          createdBy: o.created_by,
          resolvedAt: o.resolved_at,
          resolvedBy: o.resolved_by,
        })),
        photos: photos.map((p) => ({
          id: p.id,
          url: p.url,
          storagePath: p.storage_path,
          caption: p.caption,
          uploadedAt: p.uploaded_at,
          uploadedBy: p.uploaded_by,
        })),
        files: files.map((f) => ({
          id: f.id,
          name: f.filename,
          url: f.url,
          storagePath: '',
          size: f.size,
          uploadedAt: f.uploaded_at,
          uploadedBy: f.uploaded_by,
        })),
        driveLinks: driveLinks.map((d) => ({
          id: d.id,
          title: d.title,
          url: d.url,
          addedAt: d.added_at,
          addedBy: d.added_by,
        })),
      },
    })
  } catch (error) {
    console.error('Stand GET error:', error)
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
    const standId = id
    const body = await request.json()
    const { label, notes } = body

    const setClauses: string[] = []
    const values: string[] = []

    if (label !== undefined) {
      setClauses.push('label = ?')
      values.push(label)
    }
    if (notes !== undefined) {
      setClauses.push('notes = ?')
      values.push(notes)
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      )
    }

    setClauses.push('updated_at = ?')
    values.push(new Date().toISOString())
    setClauses.push('updated_by = ?')
    values.push(auth.email)
    values.push(standId)

    await queryD1(
      `UPDATE stands SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    )

    return Response.json({ success: true })
  } catch (error) {
    console.error('Stand PUT error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const auth = await getAuthFromCookies(cookieStore)

    if (!auth || auth.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const now = new Date().toISOString()

    await Promise.all([
      queryD1('DELETE FROM checklist_items WHERE stand_id = ?', [id]),
      queryD1('DELETE FROM materials WHERE stand_id = ?', [id]),
      queryD1('DELETE FROM team_members WHERE stand_id = ?', [id]),
      queryD1('DELETE FROM occurrences WHERE stand_id = ?', [id]),
      queryD1('DELETE FROM photos WHERE stand_id = ?', [id]),
      queryD1('DELETE FROM files WHERE stand_id = ?', [id]),
      queryD1('DELETE FROM drive_links WHERE stand_id = ?', [id]),
    ])
    await queryD1(
      "UPDATE stands SET label = '', notes = '', updated_at = ?, updated_by = ? WHERE id = ?",
      [now, auth.email, id]
    )

    return Response.json({ success: true })
  } catch (error) {
    console.error('Stand DELETE error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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

    const members = await queryD1<{ id: number; team: string; name: string }>(
      'SELECT id, team, name FROM team_members WHERE stand_id = ? ORDER BY id',
      [id]
    )

    // Group by team type
    const team: Record<string, string[]> = {
      marcenaria: [],
      producao: [],
    }
    for (const member of members) {
      if (team[member.team]) {
        team[member.team].push(member.name)
      }
    }

    return Response.json({
      team,
      members: members.map((m) => ({
        id: m.id,
        team: m.team,
        name: m.name,
      })),
    })
  } catch (error) {
    console.error('Team GET error:', error)
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
    const { team, name } = body

    if (!team || !name) {
      return Response.json(
        { error: 'team e name sao obrigatorios' },
        { status: 400 }
      )
    }

    if (team !== 'marcenaria' && team !== 'producao') {
      return Response.json(
        { error: 'team deve ser "marcenaria" ou "producao"' },
        { status: 400 }
      )
    }

    await queryD1(
      'INSERT INTO team_members (stand_id, team, name) VALUES (?, ?, ?)',
      [id, team, name]
    )

    // Return the newly created member
    const rows = await queryD1<{ id: number; team: string; name: string }>(
      'SELECT id, team, name FROM team_members WHERE stand_id = ? ORDER BY id DESC LIMIT 1',
      [id]
    )

    return Response.json({ member: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Team POST error:', error)
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

    if (!auth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { memberId } = body

    if (!memberId) {
      return Response.json(
        { error: 'memberId e obrigatorio' },
        { status: 400 }
      )
    }

    await queryD1(
      'DELETE FROM team_members WHERE id = ? AND stand_id = ?',
      [String(memberId), id]
    )

    return Response.json({ success: true })
  } catch (error) {
    console.error('Team DELETE error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

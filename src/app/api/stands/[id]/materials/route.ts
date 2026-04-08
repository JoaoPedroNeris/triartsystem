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

    const materials = await queryD1<{ id: number; name: string; quantity: number; confirmed: number; confirmed_at: string | null; confirmed_by: string | null }>(
      'SELECT id, name, quantity, confirmed, confirmed_at, confirmed_by FROM materials WHERE stand_id = ? ORDER BY id',
      [id]
    )

    return Response.json({
      materials: materials.map((m) => ({
        id: m.id,
        name: m.name,
        quantity: m.quantity,
        confirmed: Boolean(m.confirmed),
        confirmedAt: m.confirmed_at,
        confirmedBy: m.confirmed_by,
      })),
    })
  } catch (error) {
    console.error('Materials GET error:', error)
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
    const { name, quantity } = body

    if (!name || quantity === undefined) {
      return Response.json(
        { error: 'name e quantity sao obrigatorios' },
        { status: 400 }
      )
    }

    await queryD1(
      'INSERT INTO materials (stand_id, name, quantity, confirmed) VALUES (?, ?, ?, 0)',
      [id, name, String(quantity)]
    )

    // Return the newly created material
    const rows = await queryD1<{ id: number; name: string; quantity: number; confirmed: number; confirmed_at: string | null; confirmed_by: string | null }>(
      'SELECT id, name, quantity, confirmed, confirmed_at, confirmed_by FROM materials WHERE stand_id = ? ORDER BY id DESC LIMIT 1',
      [id]
    )

    const material = rows[0]

    return Response.json({
      material: {
        id: material.id,
        name: material.name,
        quantity: material.quantity,
        confirmed: Boolean(material.confirmed),
        confirmedAt: material.confirmed_at,
        confirmedBy: material.confirmed_by,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Materials POST error:', error)
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
    const { materialId, confirmed } = body

    if (materialId === undefined || confirmed === undefined) {
      return Response.json(
        { error: 'materialId e confirmed sao obrigatorios' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    if (confirmed) {
      await queryD1(
        'UPDATE materials SET confirmed = 1, confirmed_at = ?, confirmed_by = ? WHERE id = ? AND stand_id = ?',
        [now, auth.email, String(materialId), id]
      )
    } else {
      await queryD1(
        'UPDATE materials SET confirmed = 0, confirmed_at = NULL, confirmed_by = NULL WHERE id = ? AND stand_id = ?',
        [String(materialId), id]
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Materials PUT error:', error)
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
    const { materialId } = body

    if (!materialId) {
      return Response.json(
        { error: 'materialId e obrigatorio' },
        { status: 400 }
      )
    }

    await queryD1(
      'DELETE FROM materials WHERE id = ? AND stand_id = ?',
      [String(materialId), id]
    )

    return Response.json({ success: true })
  } catch (error) {
    console.error('Materials DELETE error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

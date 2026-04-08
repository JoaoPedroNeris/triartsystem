import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { queryD1, queryD1Batch } from '@/lib/cloudflare/d1'
import { getAuthFromCookies } from '@/lib/auth'

const DEFAULT_ITEMS: Record<string, string[]> = {
  eletrica: [
    'Passagem de cabos',
    'Instalacao de tomadas',
    'Instalacao de iluminacao',
    'Quadro eletrico',
    'Teste de carga',
    'Aterramento',
  ],
  marcenaria: [
    'Montagem da estrutura',
    'Paineis e divisorias',
    'Balcoes e vitrines',
    'Prateleiras',
    'Acabamento e pintura',
    'Instalacao de portas',
  ],
  tapecaria: [
    'Forramento de paredes',
    'Forramento de balcoes',
    'Carpete / piso',
    'Cortinas e tecidos',
    'Acabamento final',
  ],
  comunicacaoVisual: [
    'Testeira / fachada',
    'Adesivos e plotagens',
    'Banners e paineis',
    'Sinalizacao interna',
    'Totem / display',
    'Iluminacao decorativa',
  ],
}

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

    let items = await queryD1<{ id: number; category: string; label: string; checked: number; checked_at: string | null; checked_by: string | null }>(
      'SELECT id, category, label, checked, checked_at, checked_by FROM checklist_items WHERE stand_id = ? ORDER BY id',
      [standId]
    )

    // Lazy init: if no items exist, insert defaults
    if (items.length === 0) {
      const statements: { sql: string; params: string[] }[] = []

      for (const [category, labels] of Object.entries(DEFAULT_ITEMS)) {
        for (const label of labels) {
          statements.push({
            sql: 'INSERT INTO checklist_items (stand_id, category, label, checked) VALUES (?, ?, ?, 0)',
            params: [standId, category, label],
          })
        }
      }

      await queryD1Batch(statements)

      // Re-fetch after insert
      items = await queryD1<{ id: number; category: string; label: string; checked: number; checked_at: string | null; checked_by: string | null }>(
        'SELECT id, category, label, checked, checked_at, checked_by FROM checklist_items WHERE stand_id = ? ORDER BY id',
        [standId]
      )
    }

    // Group by category
    const checklist: Record<string, any[]> = {
      eletrica: [],
      marcenaria: [],
      tapecaria: [],
      comunicacaoVisual: [],
    }

    for (const item of items) {
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

    return Response.json({ checklist })
  } catch (error) {
    console.error('Checklist GET error:', error)
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
    const { itemId, checked } = body

    if (itemId === undefined || checked === undefined) {
      return Response.json(
        { error: 'itemId e checked sao obrigatorios' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    if (checked) {
      await queryD1(
        'UPDATE checklist_items SET checked = 1, checked_at = ?, checked_by = ? WHERE id = ? AND stand_id = ?',
        [now, auth.email, String(itemId), id]
      )
    } else {
      await queryD1(
        'UPDATE checklist_items SET checked = 0, checked_at = NULL, checked_by = NULL WHERE id = ? AND stand_id = ?',
        [String(itemId), id]
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Checklist PUT error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

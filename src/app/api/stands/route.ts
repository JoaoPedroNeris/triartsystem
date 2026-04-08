import { cookies } from 'next/headers'
import { queryD1 } from '@/lib/cloudflare/d1'
import { getAuthFromCookies } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const auth = await getAuthFromCookies(cookieStore)

    if (!auth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stands = await queryD1<{ id: number; label: string; notes: string }>(
      'SELECT id, label, notes FROM stands ORDER BY id'
    )

    const checklistItems = await queryD1<{ stand_id: number; category: string; checked: number }>(
      'SELECT stand_id, category, checked FROM checklist_items'
    )

    // Group checklist items by stand_id
    const itemsByStand = new Map<number, { category: string; checked: boolean }[]>()
    for (const item of checklistItems) {
      const list = itemsByStand.get(item.stand_id) || []
      list.push({ category: item.category, checked: Boolean(item.checked) })
      itemsByStand.set(item.stand_id, list)
    }

    const standsWithProgress = stands.map((stand) => {
      const items = itemsByStand.get(stand.id) || []
      const categories = ['eletrica', 'marcenaria', 'tapecaria', 'comunicacaoVisual'] as const

      const progress: Record<string, number> = {}
      let totalChecked = 0
      let totalItems = 0

      for (const cat of categories) {
        const catItems = items.filter((i) => i.category === cat)
        const checked = catItems.filter((i) => i.checked).length
        const total = catItems.length
        progress[cat] = total > 0 ? Math.round((checked / total) * 100) : 0
        totalChecked += checked
        totalItems += total
      }

      progress.overall = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0

      return {
        id: stand.id,
        label: stand.label || '',
        notes: stand.notes || '',
        progress,
      }
    })

    return Response.json({ stands: standsWithProgress })
  } catch (error) {
    console.error('Stands GET error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

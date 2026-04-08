import { cookies } from 'next/headers'
import { queryD1 } from '@/lib/cloudflare/d1'
import { getAuthFromCookies } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const auth = await getAuthFromCookies(cookieStore)

    if (!auth) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const rows = await queryD1<{ id: number; email: string; name: string; role: string }>(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [String(auth.userId)]
    )

    if (rows.length === 0) {
      return Response.json(
        { error: 'Usuario nao encontrado' },
        { status: 404 }
      )
    }

    const user = rows[0]

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

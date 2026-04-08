import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { queryD1 } from '@/lib/cloudflare/d1'
import { verifyPassword, createToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json(
        { error: 'Email e senha sao obrigatorios' },
        { status: 400 }
      )
    }

    const rows = await queryD1<{ id: number; email: string; name: string; role: string; password_hash: string }>(
      'SELECT id, email, name, role, password_hash FROM users WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      return Response.json(
        { error: 'Credenciais invalidas' },
        { status: 401 }
      )
    }

    const user = rows[0]
    const valid = await verifyPassword(password, user.password_hash)

    if (!valid) {
      return Response.json(
        { error: 'Credenciais invalidas' },
        { status: 401 }
      )
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

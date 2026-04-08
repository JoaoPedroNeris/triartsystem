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

    const photos = await queryD1<{ id: number; url: string; storage_path: string; caption: string | null; uploaded_at: string; uploaded_by: string }>(
      'SELECT id, url, storage_path, caption, uploaded_at, uploaded_by FROM photos WHERE stand_id = ? ORDER BY uploaded_at DESC',
      [id]
    )

    return Response.json({
      photos: photos.map((p) => ({
        id: p.id,
        url: p.url,
        storagePath: p.storage_path,
        caption: p.caption,
        uploadedAt: p.uploaded_at,
        uploadedBy: p.uploaded_by,
      })),
    })
  } catch (error) {
    console.error('Photos GET error:', error)
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
    const { photoId } = body

    if (!photoId) {
      return Response.json(
        { error: 'photoId e obrigatorio' },
        { status: 400 }
      )
    }

    // Note: actual R2 file deletion will be handled separately when R2 integration is added
    await queryD1(
      'DELETE FROM photos WHERE id = ? AND stand_id = ?',
      [String(photoId), id]
    )

    return Response.json({ success: true })
  } catch (error) {
    console.error('Photos DELETE error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

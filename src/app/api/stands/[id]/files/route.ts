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

    const [files, driveLinks] = await Promise.all([
      queryD1<{ id: number; name: string; url: string; storage_path: string; size: number; uploaded_at: string; uploaded_by: string }>(
        'SELECT id, name, url, storage_path, size, uploaded_at, uploaded_by FROM files WHERE stand_id = ? ORDER BY uploaded_at DESC',
        [id]
      ),
      queryD1<{ id: number; title: string; url: string; added_at: string; added_by: string }>(
        'SELECT id, title, url, added_at, added_by FROM drive_links WHERE stand_id = ? ORDER BY added_at DESC',
        [id]
      ),
    ])

    return Response.json({
      files: files.map((f) => ({
        id: f.id,
        name: f.name,
        url: f.url,
        storagePath: f.storage_path,
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
    })
  } catch (error) {
    console.error('Files GET error:', error)
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
    const { title, url } = body

    if (!title || !url) {
      return Response.json(
        { error: 'title e url sao obrigatorios' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    await queryD1(
      'INSERT INTO drive_links (stand_id, title, url, added_at, added_by) VALUES (?, ?, ?, ?, ?)',
      [id, title, url, now, auth.email]
    )

    // Return the newly created drive link
    const rows = await queryD1<{ id: number; title: string; url: string; added_at: string; added_by: string }>(
      'SELECT id, title, url, added_at, added_by FROM drive_links WHERE stand_id = ? ORDER BY id DESC LIMIT 1',
      [id]
    )

    const driveLink = rows[0]

    return Response.json({
      driveLink: {
        id: driveLink.id,
        title: driveLink.title,
        url: driveLink.url,
        addedAt: driveLink.added_at,
        addedBy: driveLink.added_by,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Files POST error:', error)
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
    const { fileId, driveLinkId } = body

    if (!fileId && !driveLinkId) {
      return Response.json(
        { error: 'fileId ou driveLinkId e obrigatorio' },
        { status: 400 }
      )
    }

    if (fileId) {
      await queryD1(
        'DELETE FROM files WHERE id = ? AND stand_id = ?',
        [String(fileId), id]
      )
    }

    if (driveLinkId) {
      await queryD1(
        'DELETE FROM drive_links WHERE id = ? AND stand_id = ?',
        [String(driveLinkId), id]
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Files DELETE error:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

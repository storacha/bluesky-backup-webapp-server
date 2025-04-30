import { getStorageContext } from '@/lib/server/db'

import { isCronjobAuthed } from '@/lib/server/auth'

export async function POST(request: Request) {
  const { db } = getStorageContext()
  if (!isCronjobAuthed(request)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { results: backups } = await db.findScheduledBackups()
  // this will always be set if the basic auth check above succeeds
  const authHeader = request.headers.get('authorization') as string
  for (const backup of backups) {
    void fetch(
      `${process.env.NEXT_PUBLIC_APP_URI}/api/backups/${backup.id}/snapshots`,
      {
        method: 'POST',
        headers: {
          authorization: authHeader,
        },
      }
    )
  }
  return Response.json({})
}

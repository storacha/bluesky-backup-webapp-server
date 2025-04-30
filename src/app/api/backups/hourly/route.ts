import { getStorageContext } from '@/lib/server/db'

import { isBasicAuthed } from "@/lib/server/auth"

export async function POST (request: Request) {
  const { db } = getStorageContext()
  if (!isBasicAuthed(request)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { results: backups } = await db.findScheduledBackups()
  for (const backup of backups) {
    fetch(`${process.env.NEXT_PUBLIC_BLUESKY_CLIENT_URI}/api/backups/${backup.id}/snapshots`, {
      method: 'POST',
      headers: {
        authorization: 'Basic ' + Buffer.from("user:" + process.env.BACKUP_PASSWORD).toString('base64')
      }
    })

    return Response.json({})
  }
}
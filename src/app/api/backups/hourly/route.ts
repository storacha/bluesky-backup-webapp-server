import { logAndCaptureError } from '@/lib/sentry'
import { isCronjobAuthed } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'

const PREFIX = 'hourly: '

export async function POST(request: Request) {
  console.log(`${PREFIX}Starting hourly snapshotting process...`)
  if (!isCronjobAuthed(request)) {
    console.error(`${PREFIX}Hourly snapshot auth not found.`)
    return new Response('Unauthorized', { status: 401 })
  }

  console.log(`${PREFIX}Finding backups for snapshots`)
  const { db } = getStorageContext()
  const { results: backups } = await db.findScheduledBackups()

  console.log(`${PREFIX}Found ${backups.length} backups, starting snapshots...`)
  // this will always be set if the basic auth check above succeeds
  const authHeader = request.headers.get('authorization') as string
  for (const backup of backups) {
    try {
      console.log(`${PREFIX}Snapshotting ${backup.id}`)
      void fetch(
        `${process.env.NEXT_PUBLIC_APP_URI}/api/backups/${backup.id}/snapshots`,
        {
          method: 'POST',
          headers: {
            authorization: authHeader,
          },
        }
      )
    } catch (e) {
      console.error(`${PREFIX}Error snapshotting backup ${backup.id}`, e)
      logAndCaptureError(e)
    }
  }
  console.log(
    `${PREFIX}Hourly snapshotting process started ${backups.length} jobs`
  )
  return Response.json({})
}

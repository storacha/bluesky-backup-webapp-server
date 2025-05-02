'use client'

import { Sidebar } from '@/app/Sidebar'
import { useSWR } from '@/app/swr'
import {
  DetailName,
  DetailValue,
} from '@/components/SnapshotScreen/SnapshotDetail'
import { Box, Stack } from '@/components/ui'
import { GATEWAY_HOSTNAME } from '@/lib/constants'

export default function RepoPage({ id }: { id: string }) {
  const { data: snapshot, error } = useSWR(['api', `/api/snapshots/${id}`])
  if (error) throw error
  if (!snapshot) return null
  const url = `https://${snapshot.repositoryCid}.${GATEWAY_HOSTNAME}`
  return (
    <>
      <Sidebar selectedBackupId={null} />
      <Box $padding="2rem">
        <Stack>
          <DetailName>Gateway URL</DetailName>
          <DetailValue>
            <a target="_blank" href={url}>
              {url}
            </a>
          </DetailValue>
        </Stack>
      </Box>
    </>
  )
}

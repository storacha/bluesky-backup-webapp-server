import Image from 'next/image'
import { useState } from 'react'
import { Lightbox } from 'yet-another-react-lightbox'

import 'yet-another-react-lightbox/styles.css'

import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { cidUrl } from '@/lib/storacha'
import { Fetchable, useSWR } from '@/lib/swr'
import { shortenCID } from '@/lib/ui'
import { ATBlob } from '@/types'

import { BackButton } from './BackButton'
import { Loader } from './Loader'
import { Box, Center, Heading, Stack, Text } from './ui'

interface BlobProps {
  /** the backup or snapshot id */
  id: string
  /** the type of blobs to get. defaults to 'snapshots' if it is not provided. */
  type?: 'snapshots' | 'backup'
}

export const Blobs = ({ type = 'snapshots', id }: BlobProps) => {
  const { isMobile } = useMobileScreens()
  const key =
    type === 'backup'
      ? (['api', `/api/backups/${id}/blobs`] satisfies Fetchable[0])
      : (['api', `/api/snapshots/${id}/blobs`] satisfies Fetchable[0])
  const { data: blobsData, error, isLoading: loading } = useSWR(key)
  const blobs = blobsData as ATBlob[]

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (error) throw error
  if (!blobs) return null

  const slides = blobs.map((blob) => ({
    src: cidUrl(blob.cid),
    alt: `Blob backed up on ${blob.createdAt}`,
  }))

  return (
    <Box $padding={isMobile ? '1rem' : '2rem'} $height="100%">
      {loading ? (
        <Center $height="88vh">
          <Loader />
        </Center>
      ) : (
        <Stack $gap="1rem">
          <Stack $direction="row" $gap="1rem">
            <BackButton
              path={`/${type === 'backup' ? 'backups' : 'snapshots'}/${id}`}
            />
            <Heading>
              Blobs in this {type === 'snapshots' ? 'Snapshot' : 'Backup'}
            </Heading>
          </Stack>
          <Stack
            $direction="row"
            $gap={isMobile ? '1.4rem' : '.8rem'}
            $wrap="wrap"
          >
            {blobs.map((blob, index) => (
              <Stack
                key={blob.cid}
                $gap=".4rem"
                style={{ cursor: 'pointer' }}
                onClick={() => setOpenIndex(index)}
              >
                <Image
                  height={110}
                  width={isMobile ? 180 : 160}
                  objectFit="cover"
                  src={cidUrl(blob.cid)}
                  style={{ borderRadius: '0.75rem' }}
                  alt={`Blob created on ${blob.createdAt}`}
                />
                <Stack $gap=".2rem">
                  <Stack $direction="row">
                    <Text
                      $fontSize="0.625rem"
                      $fontWeight="700"
                      $color="var(--color-black)"
                    >
                      {shortenCID(blob.cid)}
                    </Text>
                  </Stack>
                  <Text $fontSize="0.6235rem">{blob.createdAt}</Text>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
      {openIndex !== null && (
        <Lightbox
          open={openIndex !== null}
          close={() => setOpenIndex(null)}
          index={openIndex}
          slides={slides}
        />
      )}
    </Box>
  )
}

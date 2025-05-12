'use client'

import Image from 'next/image'
import { useState } from 'react'
/* eslint-disable import/no-named-as-default */
import Lightbox from 'yet-another-react-lightbox'

import { Sidebar } from '@/app/Sidebar'
import { BackButton } from '@/components/BackButton'
import { Loader } from '@/components/Loader'
import { Box, Center, Stack, Text } from '@/components/ui'
import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { cidUrl } from '@/lib/storacha'
import { useSWR } from '@/lib/swr'
import { shortenCID } from '@/lib/ui'
import { ATBlob } from '@/types'

import 'yet-another-react-lightbox/styles.css'

export default function BlobsPage({ id }: { id: string }) {
  const { isMobile } = useMobileScreens()
  const {
    data: blobsData,
    error,
    isLoading: loading,
  } = useSWR(['api', `/api/snapshots/${id}/blobs`])
  const blobs = blobsData as ATBlob[]

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (error) throw error
  if (!blobs) return null

  const slides = blobs?.map((blob) => ({
    src: cidUrl(blob.cid),
    alt: `Blob backed up on ${blob.createdAt}`,
  }))

  return (
    <>
      <Sidebar selectedBackupId={null} />
      <Box $padding={isMobile ? '1rem' : '2rem'} $height="100%">
        {loading ? (
          <Center $height="88vh">
            <Loader />
          </Center>
        ) : (
          <Stack $gap="1rem">
            <BackButton />
            <Stack
              $direction="row"
              $gap={isMobile ? '1.4rem' : '.8rem'}
              $wrap="wrap"
            >
              {blobs?.map((blob, index) => (
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
    </>
  )
}

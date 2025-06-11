import Image from 'next/image'
import { useState } from 'react'
import { Lightbox } from 'yet-another-react-lightbox'

import 'yet-another-react-lightbox/styles.css'

import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { cidUrl } from '@/lib/storacha'
import { shortenCID } from '@/lib/ui'
import { ATBlob } from '@/types'

import { BackButton } from './BackButton'
import { InlineCopyButton } from './CopyButton'
import { Loader } from './Loader'
import { Box, Heading, Stack, Text } from './ui'

interface BlobProps {
  blobs: ATBlob[]
  backPath: string
  loading: boolean
  /** where is this blob from */
  location: 'Snapshot' | 'Backup'
}

export const Blobs = ({ blobs, backPath, loading, location }: BlobProps) => {
  const { isMobile } = useMobileScreens()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  if (!blobs) return null

  const slides = blobs.map((blob) => ({
    src: cidUrl(blob.cid),
    alt: `Blob backed up on ${blob.createdAt}`,
  }))

  return (
    <Box $padding={isMobile ? '1rem' : '2rem'} $height="fit-content">
      {loading ? (
        <Loader />
      ) : (
        <Stack $gap="1rem">
          <Stack $direction="row" $gap="1rem">
            <BackButton path={backPath} />
            <Heading>Media in this {location}</Heading>
          </Stack>
          <Stack
            $direction="row"
            $gap={isMobile ? '1.4rem' : '.8rem'}
            $wrap="wrap"
          >
            {blobs.map((blob, index) => (
              <Stack
                key={`${blob.cid}-${crypto.randomUUID()}`}
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
                      <InlineCopyButton text={blob.cid} />
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

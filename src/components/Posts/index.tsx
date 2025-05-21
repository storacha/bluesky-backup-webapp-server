import { Did } from '@atproto/api'

import { useProfile } from '@/hooks/use-profile'
import { cidUrl } from '@/lib/storacha'
import { formatDate } from '@/lib/ui'
import { ExtendedRepoEntry } from '@/types'

import { Loader } from '../Loader'
import { Box, Center, Stack, Text } from '../ui'

export interface PostsProps {
  repositoryDid?: string
  posts: ExtendedRepoEntry[]
}

export const Posts = ({ posts, repositoryDid }: PostsProps) => {
  const { data: profile, isLoading } = useProfile(repositoryDid as Did)
  return (
    <>
      {isLoading ? (
        <Center $height="80vh">
          <Loader />
        </Center>
      ) : (
        <Box
          $display="flex"
          $flexDirection="column"
          $gap="1em"
          $height="100%"
          $padding="0"
        >
          {posts.map((post, index) => {
            try {
              const record = post.record
              const author = post.isRepost
                ? {
                    handle: post.author.handle,
                    displayName: post.author?.displayName,
                  }
                : {
                    handle: profile?.handle,
                    displayName: profile?.displayName || profile?.handle,
                  }

              const formattedDate = record.createdAt
                ? formatDate(record.createdAt)
                : ''
              const displayAuthor = author

              return (
                <Box
                  $padding=".6rem .8rem"
                  $gap=".4rem"
                  $alignItems="normal"
                  $height="fit-content"
                  $borderStyle="solid"
                  $background="white"
                  key={`post-${index}-${record.createdAt || crypto.randomUUID()}`}
                >
                  {post.isRepost && (
                    <Text $fontSize="0.7rem" $color="var(--color-black-50)">
                      Reposted by you
                    </Text>
                  )}

                  <Stack $direction="row" $gap=".7rem" $alignItems="center">
                    <Stack $direction="row" $gap=".2rem" $width="fit-content">
                      <Text $fontWeight="700" $color="var(--color-black)">
                        {displayAuthor.displayName}
                      </Text>
                      <Text $fontWeight="400" $color="var(--color-black-50)">
                        @{displayAuthor.handle}
                      </Text>
                    </Stack>
                    <Text $fontWeight="400" color="var(--color-black-50)">
                      {formattedDate}
                    </Text>
                  </Stack>
                  <Text $color="var(--color-black-50)">{record.text}</Text>

                  {record.embed &&
                    record?.embed.$type === 'app.bsky.embed.external' &&
                    'external' in record.embed && (
                      <Stack
                        $gap=".4rem"
                        $borderRadius="0.25rem"
                        $border="1px solid var(--color-light-gray)"
                      >
                        <Stack>
                          {/* eslint-disable @next/next/no-img-element  */}
                          <img
                            key={index}
                            src={cidUrl(record.embed.external.thumb.ref.$link)}
                            alt={record.embed.external.title}
                            style={{
                              width: '100%',
                              height: 'auto',
                              borderRadius: '0.5rem',
                              objectFit: 'cover',
                            }}
                          />
                        </Stack>
                        <Text $fontWeight="700" $textAlign="left">
                          {record.embed.external?.title || ''}
                        </Text>
                        <Text $fontSize="0.9rem">
                          {record.embed.external?.description || ''}
                        </Text>
                      </Stack>
                    )}

                  {record.embed &&
                    record.embed.$type === 'app.bsky.embed.images' &&
                    'images' in record.embed && (
                      <Stack $direction="row" $gap="0.6rem">
                        {record.embed.images.map((image, index) => {
                          return (
                            // next/image is pretty annoying to style
                            /* eslint-disable @next/next/no-img-element */
                            <img
                              key={index}
                              src={cidUrl(image.image.ref.$link)}
                              alt={image.alt || 'Post image'}
                              style={{
                                width: '100%',
                                maxWidth: '48%',
                                height: 'auto',
                                borderRadius: '0.5rem',
                                objectFit: 'cover',
                              }}
                            />
                          )
                        })}
                      </Stack>
                    )}
                </Box>
              )
            } catch (error) {
              console.error(error)
            }
          })}
        </Box>
      )}
    </>
  )
}

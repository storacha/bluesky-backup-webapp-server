import { RepoEntry } from '@atcute/car'
import { Did } from '@atproto/api'
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'

import { useProfile } from '@/hooks/use-profile'
import { formatDate } from '@/lib/ui'
import { Post } from '@/types'

import { Loader } from '../Loader'
import { Box, Center, Stack, Text } from '../ui'

export interface PostsProps {
  repositoryDid?: string
  posts: RepoEntry[] | FeedViewPost[]
}

export const Posts = ({ posts, repositoryDid }: PostsProps) => {
  const { data: profile, isLoading } = useProfile(repositoryDid as Did)
  return (
    <>
      {isLoading ? (
        <Center $height="100vh">
          <Loader />
        </Center>
      ) : (
        <Box
          $display="flex"
          $flexDirection="column"
          $gap="1em"
          $height="100%"
          $padding="0"
          $borderStyle="solid"
        >
          {posts.map((post, index) => {
            try {
              let record: Post
              let author = { displayName: '', handle: '' }
              if ('post' in post) {
                const feedViewPost = post as FeedViewPost
                record = {
                  text: String(feedViewPost.post.record.text),
                  $type: String(feedViewPost.post.record.$type),
                  embed: feedViewPost.post.embed as Post['embed'],
                  createdAt: String(feedViewPost.post.record.createdAt),
                }
                author = {
                  handle: feedViewPost.post.author.handle,
                  displayName:
                    feedViewPost.post.author.displayName ||
                    feedViewPost.post.author.handle,
                }
              } else {
                record = post.record as Post
                if (profile) {
                  author = {
                    handle: profile.handle,
                    displayName: profile.displayName || profile.handle,
                  }
                }
              }
              const formattedDate = record.createdAt
                ? formatDate(record.createdAt)
                : ''

              return (
                <Box
                  $padding=".2rem 0"
                  $gap=".4rem"
                  $alignItems="normal"
                  $height="fit-content"
                  $borderStyle="solid"
                  $borderBottom="1px solid var(--color-light-gray)"
                  key={`post-${index}-${record.createdAt || crypto.randomUUID()}`}
                >
                  <Stack $direction="row" $gap="1rem" $alignItems="center">
                    <Stack $direction="row" $gap=".2rem">
                      <Text $fontWeight="700" $color="var(--color-black)">
                        {author.displayName}
                      </Text>
                      <Text $fontWeight="400" $color="var(--color-black-50)">
                        @{author.handle}
                      </Text>
                    </Stack>
                    <Text $fontWeight="400" color="var(--color-black-50)">
                      {formattedDate}
                    </Text>
                  </Stack>
                  <Text $color="var(--color-black-50)">{record.text}</Text>
                </Box>
              )
            } catch (error) {
              return (
                <Box $borderStyle="none">
                  <Text>Error: {`${(error as Error).message}`}</Text>
                </Box>
              )
            }
          })}
        </Box>
      )}
    </>
  )
}

import { RepoEntry } from '@atcute/car'
import { Did } from '@atproto/api'
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'

import { useProfile } from '@/hooks/use-profile'
import { formatDate } from '@/lib/ui'
import { Post } from '@/types'

import { Box, Stack, Text } from '../ui'

export const Posts = ({
  posts,
  repositoryDid,
}: {
  posts: RepoEntry[] | FeedViewPost[]
  repositoryDid?: string
}) => {
  const { profile } = useProfile(repositoryDid as Did)
  return (
    <Stack $gap="1rem">
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
                // @ts-expect-error investigate this later
                handle: profile.handle,
                // @ts-expect-error // same here
                displayName: profile.displayName || profile.handle,
              }
            }
          }
          const formattedDate = record.createdAt
            ? formatDate(record.createdAt)
            : ''

          return (
            <Stack
              $gap=".6rem"
              $borderStyle="none"
              $borderWidth="1px"
              $alignItems="normal"
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
              <Text>{record.text}</Text>
            </Stack>
          )
        } catch (error) {
          return (
            <Box $borderStyle="none">
              <Text>Error: {`${(error as Error).message}`}</Text>
            </Box>
          )
        }
      })}
    </Stack>
  )
}

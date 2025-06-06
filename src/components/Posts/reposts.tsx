import { useRecord } from '@/hooks/use-records'
import { normalizePostView } from '@/lib/ui'

import { Box, Center } from '../ui'

import { PostItem, PostsProps } from '.'

const RepostItem = ({ uri }: { uri: string }) => {
  const { record } = useRecord(uri)

  if (!record) {
    return null
  }

  const normalizedPost = {
    ...normalizePostView(record),
    isRepost: true,
  }

  return <PostItem post={normalizedPost} />
}

export const RepostsTab = ({ posts }: PostsProps) => {
  const reposts = posts.filter(
    (post) => post.collection === 'app.bsky.feed.repost'
  )

  const repostUris = reposts
    .map((repost) => repost.record.subject?.uri)
    .filter(Boolean) as string[]

  if (repostUris.length === 0) {
    return (
      <Center $height="80vh">
        <Box>No reposts found</Box>
      </Center>
    )
  }

  return (
    <Box
      $display="flex"
      $flexDirection="column"
      $gap="1em"
      $height="100%"
      $padding="0"
    >
      {repostUris.map((uri) => (
        <RepostItem key={uri} uri={uri} />
      ))}
    </Box>
  )
}

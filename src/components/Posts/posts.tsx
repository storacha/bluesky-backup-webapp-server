import { Did } from '@atproto/api'

import { useProfile } from '@/hooks/use-profile'
import { normalizeRepoEntry } from '@/lib/ui'

import { Loader } from '../Loader'
import { Box, Center } from '../ui'

import { PostItem, PostsProps } from '.'

export const PostsTab = ({ posts, repositoryDid }: PostsProps) => {
  const { data: profile, isLoading } = useProfile(repositoryDid as Did)

  if (isLoading) {
    return (
      <Center $height="80vh">
        <Loader />
      </Center>
    )
  }

  const normalizedPosts = posts
    .filter((post) => post.collection === 'app.bsky.feed.post')
    .map((post) => normalizeRepoEntry(post, profile))

  return (
    <Box
      $display="flex"
      $flexDirection="column"
      $gap="1em"
      $height="100%"
      $padding="0"
    >
      {normalizedPosts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </Box>
  )
}

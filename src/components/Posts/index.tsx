import { styled } from 'next-yak'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'

import { cidUrl } from '@/lib/storacha'
import { formatDate } from '@/lib/ui'
import { ExtendedRepoEntry, NormalizedPost } from '@/types'

import { Box, Stack, Text } from '../ui'

import { PostsTab } from './posts'
import { RepostsTab } from './reposts'

export interface PostsProps {
  repositoryDid?: string
  posts: ExtendedRepoEntry[]
}

interface PostItemProps {
  post: NormalizedPost
}

const TabItem = styled(Tab)`
  cursor: pointer;
  font-size: 0.875rem;
  border-radius: 8px;
  padding: 0.2rem 0.6rem;

  &[data-selected] {
    background: #fdfdfd;
  }
`

const TabListWrapper = styled(TabList)`
  display: flex;
  gap: 0.6rem;
  margin: 0 0 1rem 0;
`

export const PostsTabContainer = ({ posts, repositoryDid }: PostsProps) => {
  const postCount = posts.filter(
    (p) => p.collection === 'app.bsky.feed.post'
  ).length
  const repostCount = posts.filter(
    (p) => p.collection === 'app.bsky.feed.repost'
  ).length

  return (
    <Tabs defaultSelectedKey="posts" className="w-full">
      <TabListWrapper>
        <TabItem id="posts">Posts ({postCount})</TabItem>
        <TabItem id="reposts">Reposts ({repostCount})</TabItem>
      </TabListWrapper>

      <TabPanel id="posts">
        <PostsTab repositoryDid={repositoryDid} posts={posts} />
      </TabPanel>

      <TabPanel id="reposts">
        <RepostsTab repositoryDid={repositoryDid} posts={posts} />
      </TabPanel>
    </Tabs>
  )
}

export const PostItem = ({ post }: PostItemProps) => {
  const formattedDate = formatDate(post.createdAt)
  return (
    <Box
      $padding=".6rem .8rem"
      $gap=".4rem"
      $alignItems="normal"
      $height="fit-content"
      $borderStyle="solid"
      $background="white"
    >
      {post.isRepost && (
        <Text $fontSize="0.7rem" $color="var(--color-black-50)">
          Reposted by you
        </Text>
      )}

      <Stack
        $direction="row"
        $gap=".7rem"
        $alignItems="center"
        $justifyContent="space-between"
      >
        <Stack $direction="row" $gap=".2rem" $width="fit-content">
          <Text $fontWeight="700" $color="var(--color-black)">
            {post.author.displayName}
          </Text>
          <Text $fontWeight="400" $color="var(--color-black-50)">
            @{post.author.handle}
          </Text>
        </Stack>
        <Text $fontWeight="400" color="var(--color-black-50)">
          {formattedDate}
        </Text>
      </Stack>

      <Text $color="var(--color-black-50)">{post.text}</Text>

      {post.embed &&
        post.embed.$type === 'app.bsky.embed.external' &&
        'external' in post.embed && (
          <Stack
            $gap=".4rem"
            $borderRadius="0.25rem"
            $border="1px solid var(--color-light-gray)"
          >
            <Stack>
              {/* eslint-disable @next/next/no-img-element  */}
              <img
                src={cidUrl(post.embed.external.thumb.ref.$link)}
                alt={post.embed.external.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  objectFit: 'cover',
                }}
              />
            </Stack>
            <Text $fontWeight="700" $textAlign="left">
              {post.embed.external?.title || ''}
            </Text>
            <Text $fontSize="0.9rem">
              {post.embed.external?.description || ''}
            </Text>
          </Stack>
        )}

      {post.embed &&
        post.embed.$type === 'app.bsky.embed.images' &&
        'images' in post.embed && (
          <Stack $direction="row" $gap="0.6rem">
            {post.embed.images.map((image, index) => (
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
            ))}
          </Stack>
        )}
    </Box>
  )
}

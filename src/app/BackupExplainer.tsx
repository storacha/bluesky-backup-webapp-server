'use client'
import { Explainer, ExText } from '@/components/ui'

export const BackupExplainer = () => (
  <Explainer>
    <ExText>
      Connect and select a Bluesky account you&apos;d like to start backing up,
      and then create a Storacha space you&apos;d like to start saving data to.
    </ExText>
    <ExText $fontSize="0.875em" $fontWeight="600">
      Once you create a backup, we&apos;ll make a snapshot of your publicly
      available Bluesky data - posts, images, videos, follows and followers,
      blocks, and more - every hour. Thanks to Storacha&apos;s content-addressed
      storage, we we&apos;ll only ever store new data - look ma, no dupes!
    </ExText>
  </Explainer>
)

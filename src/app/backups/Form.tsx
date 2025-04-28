/** @jsxImportSource next-yak */

import { useId } from 'react'
import { css, styled } from 'next-yak'
import { Stack } from '@/components/ui'
import { Button } from '@/components/ui'
import { BlueskyAccountSelect } from '../../components/Backup/BlueskyAccountSelect'
import { StorachaSpaceSelect } from '../../components/Backup/StorachaSpaceSelect'
import { Box } from './Box'
import { Backup } from '../types'
import { useStorachaAccount } from '@/hooks/use-plan'

let action: typeof import('./new/action').action

if (process.env.STORYBOOK) {
  action = () => {
    throw new Error('Server Functions are not available in Storybook')
  }
} else {
  action = (await import('./new/action')).action
}

// TODO: Deal with unauthenticated
export const Form = ({ backup }: { backup?: Backup }) => {
  const account = useStorachaAccount()
  if (!account) return null

  return (
    <form action={action}>
      <h1>
        {/* TODO: Provide a better default name */}
        {backup ? (
          backup.name
        ) : (
          <input type="text" name="name" defaultValue="New Backup" />
        )}
      </h1>
      {/* We may not need to send the account as a form field once we have real auth. */}
      <input type="hidden" name="account" value={account.did()} />
      <h2>Accounts</h2>
      <Grid>
        {backup ? (
          <>
            <BlueskyAccountSelect
              name="atproto_account"
              disabled
              value={backup.atprotoAccount}
            />
            <StorachaSpaceSelect
              name="storacha_space"
              disabled
              value={backup.storachaSpace}
            />
          </>
        ) : (
          <>
            <BlueskyAccountSelect name="atproto_account" />
            <StorachaSpaceSelect name="storacha_space" />
          </>
        )}
      </Grid>
      <h2>Data</h2>
      <Grid>
        {backup ? (
          <>
            <Checkbox
              label="Repository"
              name="include_repository"
              disabled
              checked={backup.includeRepository}
            />
            <Checkbox
              label="Blobs"
              name="include_blobs"
              disabled
              checked={backup.includeBlobs}
            />
            <Checkbox
              label="Preferences"
              name="include_preferences"
              disabled
              checked={backup.includePreferences}
            />
          </>
        ) : (
          <>
            <Checkbox
              label="Repository"
              name="include_repository"
              defaultChecked
            />
            <Checkbox label="Blobs" name="include_blobs" defaultChecked />
            <Checkbox
              label="Preferences"
              name="include_preferences"
              defaultChecked
            />
          </>
        )}
      </Grid>
      {!backup && <Button type="submit">Create Backup</Button>}
    </form>
  )
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  > * {
    flex: 1 1 0;
  }
`

const Checkbox = ({
  label,
  ...checkboxProps
}: {
  label: string
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const id = useId()
  return (
    <Box>
      <Stack
        $direction="row"
        $gap="0.5rem"
        // Style hack for now to override the CSS reset. Soon, we'll make this a
        // slider switch anyhow.
        css={css`
          & > input {
            appearance: auto;
          }
        `}
      >
        <label htmlFor={id}>{label}</label>
        <input id={id} type="checkbox" value="on" {...checkboxProps} />
      </Stack>
    </Box>
  )
}

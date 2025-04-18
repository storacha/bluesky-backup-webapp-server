/** @jsxImportSource next-yak */

import { useId } from 'react'
import { css, styled } from 'next-yak'
import { useAuthenticator } from '@storacha/ui-react'
import { Stack } from '@/components/ui'
import { Button } from '@/components/ui'
import { BlueskyAccountSelect } from './BlueskyAccountSelect'
import { StorachaSpaceSelect } from './StorachaSpaceSelect'
import { action } from './new/action'
import { Box } from './Box'
import { BackupConfig } from '../types'

// TODO: Deal with unauthenticated
export const Form = ({ config }: { config?: BackupConfig }) => {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]

  if (!account) return null

  return (
    <form action={action}>
      <h1>
        {/* TODO: Provide a better default name */}
        {config ? (
          config.name
        ) : (
          <input type="text" name="name" defaultValue="New Config" />
        )}
      </h1>
      {/* We may not need to send the account as a form field once we have real auth. */}
      <input type="hidden" name="account" value={account.did()} />
      <h2>Accounts</h2>
      <Grid>
        {config ? (
          <>
            <BlueskyAccountSelect
              name="atproto_account"
              disabled
              value={config.atproto_account}
            />
            <StorachaSpaceSelect
              name="storacha_space"
              disabled
              value={config.storacha_space}
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
        {config ? (
          <>
            <Checkbox
              label="Repository"
              name="include_repository"
              disabled
              checked={config.include_repository}
            />
            <Checkbox
              label="Blobs"
              name="include_blobs"
              disabled
              checked={config.include_blobs}
            />
            <Checkbox
              label="Preferences"
              name="include_preferences"
              disabled
              checked={config.include_preferences}
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
      {!config && <Button type="submit">Create Config</Button>}
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

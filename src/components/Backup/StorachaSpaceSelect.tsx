'use client'

import { shortenDID } from '@/lib/ui'
import { useAuthenticator } from '@storacha/ui-react'
import { LocationSelect } from '../../app/backups/LocationSelect'
import { AccountLogo, Box } from './Backup'
import { Stack } from '../ui'
import Image from 'next/image'
import { useRef } from 'react'
import { CaretDown } from '@phosphor-icons/react'

export const StorachaSpaceSelect = (
  props: Omit<React.ComponentProps<typeof LocationSelect>, 'label'>
) => {
  const [{ spaces, accounts }] = useAuthenticator()

  const account = accounts[0]
  const selectElement = useRef<HTMLSelectElement>(null)
  const hasValue = Boolean(selectElement.current?.value)
  return (
    <Box
      $background={hasValue ? 'var(--color-white)' : ''}
      $width="fit-content"
      $display="flex"
    >
      <Stack $gap=".8rem" $direction="row" $alignItems="center">
        <AccountLogo $type="original" $hasAccount={hasValue}>
          <Image
            src="/storacha-red.png"
            alt="Storacha Logo"
            width={18}
            height={18}
          />
        </AccountLogo>
        <LocationSelect label="Storacha Space" {...props} ref={selectElement}>
          <optgroup label={account?.toEmail()}>
            {spaces.map((space) => (
              <option key={space.did()} value={space.did()}>
                {space.name}
                {/* Em space */}
                {' '}({shortenDID(space.did())})
              </option>
            ))}
          </optgroup>
        </LocationSelect>
      </Stack>
      <CaretDown size="16" color="var(--color-gray-1)" />
    </Box>
  )
}

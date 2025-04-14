'use client'

import { shortenDID } from '@/lib/ui'
import { useAuthenticator } from '@storacha/ui-react'
import { LocationSelect } from './LocationSelect'

export const StorachaSpaceSelect = (
  props: Omit<React.ComponentProps<typeof LocationSelect>, 'label'>
) => {
  const [{ spaces, accounts }] = useAuthenticator()

  const account = accounts[0]

  return (
    <LocationSelect label="Storacha" {...props}>
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
  )
}

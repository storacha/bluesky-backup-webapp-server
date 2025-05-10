'use server'

import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'
import { RotationKeyClientInput } from '@/types'

export const recordKey = async (input: RotationKeyClientInput) => {
  const { did: account } = await getSession()
  if (!account) {
    throw new Error('Not authorized')
  }

  const { db } = getStorageContext()
  return db.addRotationKey({
    ...input,
    storachaAccount: account,
  })
}

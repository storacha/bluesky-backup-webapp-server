import { check } from '@atproto/common-web'

import * as plc from '@/lib/crypto/plc'
import {
  ATAlsoKnownAs,
  ATRotationKeys,
  ATServices,
  ATVerificationMethods,
  ProfileData,
  RotationKey,
} from '@/types'

export const newClient = () => new plc.Client('https://plc.directory')

interface PlcUpdateInput {
  rotationKeys?: ATRotationKeys
  alsoKnownAs?: ATAlsoKnownAs
  services?: ATServices
  verificationMethods?: ATVerificationMethods
}

// adapted from https://github.com/bluesky-social/atproto/blob/81fb69ac6571a90241d9d82acdb6a7248c9ce314/packages/pds/src/api/com/atproto/identity/signPlcOperation.ts#L10
export async function createPlcUpdateOp(
  profile: ProfileData,
  rotationKey: RotationKey,
  update: PlcUpdateInput
) {
  if (!rotationKey.keypair) {
    throw new Error('keypair is undefined')
  }
  const client = newClient()
  const lastOp = await client.getLastOp(profile.did)
  if (check.is(lastOp, plc.def.tombstone)) {
    throw new Error('Did is tombstoned')
  }
  return await plc.createUpdateOp(lastOp, rotationKey.keypair, (lastOp) => ({
    ...lastOp,
    rotationKeys: update.rotationKeys ?? lastOp.rotationKeys,
    alsoKnownAs: update.alsoKnownAs ?? lastOp.alsoKnownAs,
    verificationMethods:
      update.verificationMethods ?? lastOp.verificationMethods,
    services: update.services ?? lastOp.services,
  }))
}

import { Secp256k1Keypair } from '@atproto/crypto'

export async function generateNewRotationKey(): Promise<Secp256k1Keypair> {
  return await Secp256k1Keypair.create({ exportable: true })
}

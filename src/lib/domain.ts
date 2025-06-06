import { ProfileData, RotationKey } from '@/types'

export function isCurrentRotationKey(
  rotationKey: RotationKey,
  profile: ProfileData
): boolean {
  return profile.rotationKeys.includes(rotationKey.id)
}

// button components that we can pass into either of our Select components
// mostly suited for the StorachaSpaceSelect though
import { ActionButton as ActionButtonWrapper } from './BackupScreen/Select'

interface ActionButtonProps {
  /** The label for an action to place at the bottom of the options */
  actionLabel: string
  /** Handler called when the action button is pressed. */
  actionOnPress: () => void
}

export const ActionButton = ({
  actionLabel,
  actionOnPress,
}: ActionButtonProps) => {
  return (
    <ActionButtonWrapper onPress={actionOnPress}>
      {actionLabel}
    </ActionButtonWrapper>
  )
}

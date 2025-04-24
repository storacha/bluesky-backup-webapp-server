import { styled } from 'next-yak'
import { useRef } from 'react'
import { useSwitch, useFocusRing, VisuallyHidden } from 'react-aria'
import { useToggleState } from 'react-stately'

interface SwitchProps {
  value: boolean
  name: string
  onClick: (value: boolean) => void
  label?: string
  isDisabled?: boolean
  children?: React.ReactNode
}

interface AriaSwitchProps extends Omit<SwitchProps, 'value' | 'onClick'> {
  isSelected: boolean
  onChange: (isSelected: boolean) => void
}

const SWITCH_WIDTH = 30
const NOB_DIAMETER = 16
const SWITCH_OFFSET = 1.5

const SwitchContainer = styled.div<{
  $isSelected: boolean
  $isDisabled?: boolean
  $isFocusVisible?: boolean
}>`
  background: ${({ $isSelected, $isDisabled }) =>
    $isDisabled
      ? 'var(--color-gray-light)'
      : $isSelected
        ? 'var(--color-dark-blue)'
        : 'var(--color-gray-medium-light)'};
  height: 19px;
  width: ${SWITCH_WIDTH}px;
  border-radius: 11px;
  position: relative;
  cursor: ${({ $isDisabled }) => ($isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease-in;
  outline: ${({ $isFocusVisible }) =>
    $isFocusVisible ? '2px solid var(--color-focus, #4c9aff)' : 'none'};
  outline-offset: 2px;
`

const SwitchNob = styled.div<{ $isSelected: boolean; $isDisabled?: boolean }>`
  background: ${({ $isSelected, $isDisabled }) =>
    $isDisabled
      ? 'var(--color-gray-medium)'
      : $isSelected
        ? 'var(--color-white)'
        : 'var(--color-gray)'};
  height: ${NOB_DIAMETER}px;
  width: ${NOB_DIAMETER}px;
  border-radius: 100%;
  position: absolute;
  top: ${SWITCH_OFFSET}px;
  transition: all 0.3s ease-in;
  left: ${({ $isSelected }) =>
    $isSelected
      ? SWITCH_WIDTH - NOB_DIAMETER - SWITCH_OFFSET
      : SWITCH_OFFSET}px;
`

const SwitchWrapper = styled.label<{ $isDisabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.4 : 1)};
`

const LabelText = styled.span`
  margin-left: 8px;
`

const AriaSwitch = (props: AriaSwitchProps) => {
  const ref = useRef<HTMLInputElement>(null)
  const state = useToggleState(props)
  const { inputProps } = useSwitch(props, state, ref)
  const { isFocusVisible, focusProps } = useFocusRing()

  return (
    <SwitchWrapper $isDisabled={props.isDisabled}>
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>
      <SwitchContainer
        $isSelected={state.isSelected}
        $isDisabled={props.isDisabled}
        $isFocusVisible={isFocusVisible}
        aria-hidden="true"
      >
        <SwitchNob
          $isSelected={state.isSelected}
          $isDisabled={props.isDisabled}
        />
      </SwitchContainer>
      {props.label && <LabelText>{props.label}</LabelText>}
      {props.children}
    </SwitchWrapper>
  )
}

export const Switch = ({ value, onClick, ...otherProps }: SwitchProps) => {
  const ariaProps: AriaSwitchProps = {
    isSelected: value,
    onChange: onClick,
    ...otherProps,
  }

  return <AriaSwitch {...ariaProps} />
}

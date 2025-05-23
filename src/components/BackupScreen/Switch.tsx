import { css, styled } from 'next-yak'
import { forwardRef, useRef } from 'react'
import {
  AriaSwitchProps,
  useFocusRing,
  useSwitch,
  VisuallyHidden,
} from 'react-aria'
import { mergeRefs } from 'react-merge-refs'
import { ToggleProps, useToggleState } from 'react-stately'

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
      ? $isSelected
        ? 'var(--color-dark-blue-light)'
        : 'var(--color-gray-light)'
      : $isSelected
        ? 'var(--color-dark-blue)'
        : 'var(--color-gray-medium-light)'};
  height: 19px;
  width: ${SWITCH_WIDTH}px;
  border-radius: 11px;
  position: relative;
  ${({ $isDisabled }) =>
    $isDisabled &&
    css`
      cursor: not-allowed;
    `};
  transition: all 0.3s ease-in;
  outline: ${({ $isFocusVisible }) =>
    $isFocusVisible ? '2px solid var(--color-focus, #4c9aff)' : 'none'};
  outline-offset: 2px;
`

const SwitchNob = styled.div<{ $isSelected: boolean; $isDisabled?: boolean }>`
  background: ${({ $isSelected, $isDisabled }) =>
    $isDisabled
      ? $isSelected
        ? 'var(--color-white)'
        : 'var(--color-gray-medium)'
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

const SwitchWrapper = styled.div<{ $isDisabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.4 : 1)};
`

export type SwitchProps = ToggleProps & AriaSwitchProps

export const Switch = forwardRef<HTMLInputElement>(function Switch(
  props: SwitchProps,
  externalRef
) {
  const internalRef = useRef<HTMLInputElement>(null)
  const state = useToggleState(props)
  const { inputProps } = useSwitch(props, state, internalRef)
  const { isFocusVisible, focusProps } = useFocusRing()

  return (
    <SwitchWrapper $isDisabled={props.isDisabled}>
      <VisuallyHidden>
        <input
          {...inputProps}
          {...focusProps}
          ref={mergeRefs([internalRef, externalRef])}
        />
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
    </SwitchWrapper>
  )
})

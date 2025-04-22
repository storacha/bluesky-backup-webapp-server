import { styled } from 'next-yak'

interface SwitchProps {
  name: string
  value: boolean
  onClick: (value: boolean) => void
}

const SWITCH_WIDTH = 30
const NOB_DIAMETER = 16
const SWITCH_OFFSET = 1.5

const SwitchContainer = styled.div<{ $value: boolean }>`
  background: ${({ $value }) =>
    $value ? 'var(--color-dark-blue)' : 'var(--color-gray-medium-light)'};
  height: 19px;
  width: ${SWITCH_WIDTH}px;
  border-radius: 11px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease-in;
`

const SwitchNob = styled.div<{ $value: boolean }>`
  background: ${({ $value }) =>
    $value ? 'var(--color-white)' : 'var(--color-gray)'};
  height: ${NOB_DIAMETER}px;
  width: ${NOB_DIAMETER}px;
  border-radius: 100%;
  position: absolute;
  top: ${SWITCH_OFFSET}px;
  transition: all 0.3s ease-in;
  left: ${({ $value }) =>
    $value ? SWITCH_WIDTH - NOB_DIAMETER - SWITCH_OFFSET : SWITCH_OFFSET}px;
`

export const Switch = ({ name, value, onClick }: SwitchProps) => {
  return (
    <SwitchContainer $value={value} onClick={() => onClick(!value)}>
      <SwitchNob $value={value} />
      <input
        type="checkbox"
        name={name}
        value={value ? 'on' : 'off'}
        checked={value}
        style={{ display: 'none' }}
        onChange={(e) => onClick(e.target.checked)}
      />
    </SwitchContainer>
  )
}

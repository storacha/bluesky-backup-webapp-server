import { styled } from 'next-yak'
import { ChangeEvent, ReactNode } from 'react'
import { StyleProps } from './style'

export interface InputProps {
  type: string
  value: string
  placeholder?: string
  icon?: ReactNode
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

const Field = styled.div<{ $hasIcon?: boolean } & Partial<StyleProps>>`
  position: relative;
  display: ${({ $hasIcon }) => ($hasIcon ? 'flex' : 'block')};
  width: ${({ $width = '100%' }) => $width};
`

const InputWrapper = styled.input<{ $hasIcon?: boolean } & Partial<StyleProps>>`
  height: ${({ $height = '48px' }) => $height};
  width: ${({ $width = '100%' }) => $width};
  border-radius: 0.75rem;
  border: ${({ $border = '1px solid var(--color-gray-light)' }) => $border};
  padding-left: ${({ $hasIcon }) => ($hasIcon ? '2.5rem' : '0.75rem')};

  &::placeholder {
    color: var(--color-gray);
    font-size: 0.75rem;
  }
`

const IconWrapper = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
`

export const InputField = ({
  type,
  icon,
  value,
  onChange,
  placeholder,
}: InputProps) => {
  const hasIcon = !!icon;

  return (
    <Field $hasIcon={hasIcon}>
      <InputWrapper
        $hasIcon={hasIcon}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e)}
      />
      {icon && <IconWrapper>{icon}</IconWrapper>}
    </Field>
  )
}

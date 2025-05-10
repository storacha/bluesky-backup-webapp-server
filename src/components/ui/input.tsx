import { styled } from 'next-yak'
import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

import { StyleProps } from './style'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  icon?: ReactNode
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  icon?: ReactNode
}

const Field = styled.div<{ $hasIcon?: boolean } & Partial<StyleProps>>`
  position: relative;
  display: ${({ $hasIcon }) => ($hasIcon ? 'flex' : 'block')};
  width: ${({ $width = '100%' }) => $width};
`

const InputWrapper = styled.input<
  { $hasIcon?: boolean; $hasLabel?: boolean } & Partial<StyleProps>
>`
  height: ${({ $height = '48px' }) => $height};
  width: ${({ $width = '100%' }) => $width};
  border-radius: 0.75rem;
  font-size: 1.2rem;
  border: ${({ $border = '1px solid var(--color-gray-light)' }) => $border};
  padding-top: ${({ $hasLabel }) => ($hasLabel ? '0' : '1.25rem')};
  padding-left: ${({ $hasIcon }) => ($hasIcon ? '2.5rem' : '0.75rem')};

  &::placeholder {
    color: var(--color-gray);
    font-size: 0.85rem;
    font-weight: 400;
  }
`

const TextAreaWrapper = styled.textarea<
  { $hasIcon?: boolean; $hasLabel?: boolean } & Partial<StyleProps>
>`
  height: ${({ $height = '48px' }) => $height};
  width: ${({ $width = '100%' }) => $width};
  border-radius: 0.75rem;
  font-size: 1.2rem;
  border: ${({ $border = '1px solid var(--color-gray-light)' }) => $border};
  padding-top: ${({ $hasLabel }) => ($hasLabel ? '0' : '1.25rem')};
  padding-left: ${({ $hasIcon }) => ($hasIcon ? '2.5rem' : '0.75rem')};

  &::placeholder {
    color: var(--color-gray);
    font-size: 0.85rem;
    font-weight: 400;
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

const Label = styled.h4`
  color: var(--color-gray-medium);
  font-size: 0.88rem;
  position: absolute;
  left: 0.75rem;
  top: 0.5rem;
`

export const InputField = ({ icon, label, ...inputProps }: InputProps) => {
  const hasIcon = !!icon

  return (
    <Field $hasIcon={hasIcon}>
      {label && <Label>{label}</Label>}
      <InputWrapper $hasIcon={hasIcon} {...inputProps} />
      {icon && <IconWrapper>{icon}</IconWrapper>}
    </Field>
  )
}

export const TextAreaField = ({
  icon,
  label,
  ...inputProps
}: TextAreaProps) => {
  const hasIcon = !!icon

  return (
    <Field $hasIcon={hasIcon}>
      {label && <Label>{label}</Label>}
      <TextAreaWrapper $hasIcon={hasIcon} {...inputProps} />
      {icon && <IconWrapper>{icon}</IconWrapper>}
    </Field>
  )
}

"use client"
import { ReactNode, useId } from 'react'
import Select, { MenuPlacement, StylesConfig } from 'react-select'
import makeAnimated from 'react-select/animated'
import { Stack } from './Stack'

const animatedComponents = makeAnimated()

export type Option = {
  label: string | ReactNode
  value: string
  icon?: string
}

interface SelectFieldProps {
  name: string
  options: Option[]
  value?: string | null
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  width?: string
  height?: string
  noBorder?: boolean
  customIndicator?: ReactNode
  menuPlacement?: MenuPlacement
  components?: object
}

export const SelectField = ({
  name,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  disabled = false,
  width,
  height = '40px',
  noBorder = false,
  menuPlacement = 'bottom',
  components: customComponents,
}: SelectFieldProps) => {
  const instanceId = useId()
  const selectedOption = options.find((option) => option.value === value)

  const handleChange = (option: Option | null) => {
    if (onChange) {
      onChange(option?.value || '')
    }
  }

  const customStyles: StylesConfig<Option, false> = {
    control: (base) => ({
      ...base,
      minHeight: height,
      width: width || '100%',
      backgroundColor: 'transparent',
      borderColor: noBorder ? 'transparent' : 'var(--color-gray-medium)',
      borderRadius: '0.5rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'var(--color-primary)',
      },
      padding: 0,
      cursor: 'pointer',
      border: 'none',
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 0.5rem',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--color-white)',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      zIndex: 10,
    }),
    menuList: (base) => ({
      ...base,
      padding: '0.5rem',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'var(--color-gray-medium-light)'
        : state.isFocused
          ? 'var(--color-gray)'
          : 'var(--color-white)',
      color: 'var(--color-gray)',
      borderRadius: '0.25rem',
      padding: '0.75rem',
      marginBottom: '0.25rem',
      cursor: 'pointer',
      '&:last-child': {
        marginBottom: 0,
      },
      '&:active': {
        backgroundColor: 'var(--color-gray-medium-light)',
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--color-gray)',
      marginLeft: '0.5rem',
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--color-gray)',
      marginLeft: '0.5rem',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
  }

  return (
    <Stack $direction="column" $gap="0.5rem">
      {label && <label htmlFor={name}>{label}</label>}
      <Select
        instanceId={instanceId}
        name={name}
        options={options}
        value={selectedOption}
        onChange={(option) => handleChange(option as Option | null)}
        placeholder={placeholder}
        isDisabled={disabled}
        menuPlacement={menuPlacement}
        components={{
          ...animatedComponents,
          ...customComponents
        }}
        styles={customStyles}
        menuPortalTarget={
          typeof document !== 'undefined' ? document.body : null
        }
      />
    </Stack>
  )
}

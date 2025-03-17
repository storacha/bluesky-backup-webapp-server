import type { Space } from '@w3ui/react'
import { useState } from 'react'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid'
import { shortenDID } from '@/lib/ui'
import Dropdown from './Dropdown'
import Input from './Input'
import type { DropdownItem } from './Dropdown'

interface SpaceFinderProps {
  spaces: Space[]
  selected?: Space
  setSelected?: (space: Space) => void
  className?: string
}

export function SpaceFinder({
  spaces,
  selected,
  setSelected,
  className = '',
}: SpaceFinderProps): JSX.Element {
  const [query, setQuery] = useState('')

  const filtered =
    query === ''
      ? spaces
      : spaces.filter((space: Space) =>
          (space.name || space.did())
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        )

  const dropdownItems: DropdownItem[] = filtered.map((space) => ({
    label: space.name || shortenDID(space.did()),
    icon:
      selected && space.did() === selected.did() ? (
        <CheckIcon className="h-4 w-4 text-[var(--color-storacha-red)]" />
      ) : undefined,
    onClick: () => {
      if (setSelected) {
        setSelected(space)
      }
    },
  }))

  const triggerContent = (
    <div className="flex items-center justify-between w-full">
      <span className="truncate">
        {selected
          ? selected.name || shortenDID(selected.did())
          : 'Select a space'}
      </span>
      <ChevronDownIcon className="ml-2 h-5 w-5" />
    </div>
  )

  return (
    <div className={className}>
      <Dropdown
        items={dropdownItems}
        variant="secondary"
        align="right"
        className="w-full"
        trigger={triggerContent}
      >
        <Input
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          placeholder="Search for a space"
        />
      </Dropdown>
    </div>
  )
}

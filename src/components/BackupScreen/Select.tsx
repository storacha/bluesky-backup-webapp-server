import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { styled } from 'next-yak'
import {
  Button,
  ButtonContext,
  ListBox as RACListBox,
  ListBoxItem,
  ListBoxProps,
  Popover as RACPopover,
  Select as RACSelect,
  SelectProps,
  SelectValue,
} from 'react-aria-components'

import { Stack, Text } from '../ui'

import { AccountLogo } from './BackupDetail'

const Popover = styled(RACPopover)`
  background-color: var(--color-white);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-gray-light);
  font-size: 0.75rem;
`

const Item = styled(ListBoxItem)`
  border-radius: 0.25rem;
  padding: 0.75rem;
  cursor: default;

  &:focus {
    background-color: var(--color-gray-medium-light);
  }

  &[data-selected] {
    background-color: var(--color-dark-blue);
    color: var(--color-white);

    &:focus {
      outline: var(--color-gray-medium-light) 1px solid;
      outline-offset: -2px;
    }
  }
`

// An empty item to show when there are no items in the list.
const NonItem = styled(ListBoxItem)`
  display: none;
`

const ListBox = styled(RACListBox<Item>)`
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  /* Hide entirely when "empty" (actually containing an invisible NonItem) */
  &:has(> ${NonItem}) {
    display: none;
  }
`

const FullButton = styled(Button)`
  display: block;
  width: 100%;
`

const ActionButton = styled(FullButton)`
  border-top: 1px solid var(--color-gray-medium);
  padding: 0.75rem calc(0.75rem + 0.5rem);
  background-color: var(--color-gray-medium-light);

  &:focus {
    background-color: var(--color-gray-light);
  }
`

const DisclosureIcon = styled(ChevronDownIcon)`
  color: var(--color-gray-1);
  width: 1rem;
`

const MainSection = styled(Stack)`
  flex-basis: auto;
  flex-grow: 1;
  flex-shrink: 1;
  /* Helps it shrink to let the Value truncate. */
  min-width: 0;
`

const Value = styled(Text)`
  font-family: var(--font-dm-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Contents = styled.div<{ $hasValue: boolean }>`
  display: flex;
  flex-direction: row;
  padding: 0.75rem;
  gap: 0.75rem;
  align-items: center;
  justify-content: flex-start;

  border-width: 1px;
  border-style: dashed;
  border-color: var(--color-gray-light);
  border-radius: 12px;

  ${FullButton}:focus-visible &, &:hover {
    background-color: var(--color-white);
  }

  ${FullButton}:focus-visible & {
    outline: var(--color-dark-blue) 2px solid;
  }
`

type Item = {
  id: string
  label: string
}

export const Select = ({
  name,
  imageSrc,
  label,
  items,
  defaultSelectedKey,
  actionLabel,
  actionOnPress,
  content,
  isDisabled,
}: {
  /** URL of the image to show in the control. */
  imageSrc: string
  /** A noun describing what is selected (eg. "Bluesky Account"). */
  label: string
  /** The label for an action to place at the bottom of the options. */
  actionLabel: string
  /** Handler called when the action button is pressed. */
  actionOnPress: () => void
  content?: React.ReactNode
} & Pick<SelectProps<Item>, 'name' | 'defaultSelectedKey' | 'isDisabled'> &
  Pick<ListBoxProps<Item>, 'items'>) => {
  const prompt = `Select ${label}`
  const actionButton = (
    // Prevent the button from automagically being treated as the trigger
    // button just because it's inside the <Select> component.
    <ButtonContext.Provider value={{}}>
      <ActionButton onPress={actionOnPress}>{actionLabel}</ActionButton>
    </ButtonContext.Provider>
  )

  return (
    <RACSelect
      name={name}
      defaultSelectedKey={defaultSelectedKey}
      isDisabled={isDisabled}
    >
      <FullButton>
        <SelectValue<Item>>
          {({ selectedItem }) => {
            return (
              <Contents $hasValue={!!selectedItem}>
                <AccountLogo $type="original" $hasAccount={true}>
                  <Image src={imageSrc} alt="" width={25} height={25} />
                </AccountLogo>

                <MainSection>
                  {selectedItem ? (
                    <>
                      <Text $color="var(--color-black)">{label}</Text>
                      <Value>{selectedItem.label}</Value>
                    </>
                  ) : (
                    <Text>{prompt}</Text>
                  )}
                </MainSection>
                <DisclosureIcon />
              </Contents>
            )
          }}
        </SelectValue>
      </FullButton>
      <Popover aria-label={prompt}>
        {content ?? (
          <>
            <ListBox
              items={
                items && [...items].length === 0
                  ? [{ id: '', label: '' }]
                  : items
              }
            >
              {({ id, label }) =>
                // The Select won't even open if there are no items, so we need
                // to put a dummy item in the listbox.
                id === '' ? (
                  <NonItem aria-hidden></NonItem>
                ) : (
                  <Item>{label}</Item>
                )
              }
            </ListBox>
            {actionButton}
          </>
        )}
      </Popover>
    </RACSelect>
  )
}

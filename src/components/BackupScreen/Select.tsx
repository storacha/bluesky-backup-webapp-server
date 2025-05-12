import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { styled } from 'next-yak'
import {
  Button,
  ButtonContext,
  ListBox,
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
  padding: 0.5rem;

  background-color: var(--color-white);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-gray-light);
`

const FullButton = styled(Button)`
  display: block;
  width: 100%;
`

const Item = styled(ListBoxItem)`
  background-color: var(--color-white);
  color: var(--color-black);
  height: 40px;
  border-radius: 0.25rem;
  padding: 0.75rem;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  cursor: default;

  &:focus {
    background-color: var(--color-gray-medium-light);
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
`

const Value = styled(Text)`
  font-family: var(--font-dm-mono);
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
}: {
  /** URL of the image to show in the control. */
  imageSrc: string
  /** A noun describing what is selected (eg. "Bluesky Account"). */
  label: string
} & Pick<SelectProps<Item>, 'name' | 'defaultSelectedKey'> &
  Pick<ListBoxProps<Item>, 'items'>) => {
  const prompt = `Select ${label}`
  return (
    <RACSelect name={name} defaultSelectedKey={defaultSelectedKey}>
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
      <Popover>
        <ListBox aria-label={prompt} items={items}>
          {({ label }) => <Item>{label}</Item>}
        </ListBox>
        {/* Prevent the button from automagically being treated as the trigger
            button just because it's inside the <Select> component. */}
        <ButtonContext.Provider value={{}}>
          <FullButton onPress={() => console.log('Create New')}>
            Create New
          </FullButton>
        </ButtonContext.Provider>
      </Popover>
    </RACSelect>
  )
}

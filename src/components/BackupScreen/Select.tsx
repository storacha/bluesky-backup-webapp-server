import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { css, styled } from 'next-yak'
import { ReactNode } from 'react'
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

import { Stack } from '../ui'

const Popover = styled(RACPopover)`
  background-color: var(--color-white);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-gray-light);
  font-size: 0.75rem;
  overflow-y: auto;
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

export const ActionButton = styled(FullButton)`
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

  ${FullButton}[data-disabled] & {
    display: none;
  }
`

const MainSection = styled(Stack)`
  flex-basis: auto;
  flex-grow: 1;
  flex-shrink: 1;
  /* Helps it shrink to let the Value truncate. */
  min-width: 0;
`

const Label = styled.div`
  font-size: 0.75rem;

  ${FullButton}[data-disabled] & {
    color: var(--color-gray-medium-medium-light);
  }
`

const Value = styled.div`
  font-size: 0.75rem;
  font-family: var(--font-dm-mono);
  color: var(--color-gray-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${FullButton}[data-disabled] & {
    color: var(--color-gray-medium-medium-light);
  }
`

const Prompt = styled.div`
  font-size: 0.75rem;
  color: var(--color-gray-medium);
`

// Trivially styled solely to let this element be targeted with parent
// selectors.
const Outside = styled(RACSelect)`
  color: currentColor;
`

const Contents = styled.div<{ $hasValue: boolean }>`
  display: flex;
  flex-direction: row;
  padding: 0.75rem;
  gap: 0.75rem;
  align-items: center;
  justify-content: flex-start;

  border-width: 1px;
  border-style: ${({ $hasValue }) => ($hasValue ? 'solid' : 'dashed')};
  border-color: var(--color-gray-light);
  border-radius: 12px;

  ${FullButton}:focus-visible &, ${FullButton}:not([data-disabled]) &:hover {
    background-color: var(--color-white);
  }

  ${FullButton}:focus-visible & {
    outline: var(--color-dark-blue) 2px solid;
  }

  ${Outside}[data-invalid] & {
    border-color: var(--color-dark-red);
    outline-color: var(--color-dark-red);
  }
`

const withLogoSilhouette = css`
  /* Rather than use the image as a background, use the color as a background
    and the image as a mask. Pseudo-element so the main element can still
    display a border without being hidden by the mask. */
  &::after {
    content: '';
    flex-grow: 1;
    background-color: var(--account-logo-color);
    mask-image: var(--account-logo-image);
    mask-size: var(--account-logo-size);
    mask-position: var(--account-logo-position);
    mask-repeat: var(--account-logo-repeat);
  }
`

const AccountLogo = styled.div<{
  $imageSrc: string
  $hasValue?: boolean
}>`
  --account-logo-border-color: var(--color-gray-light);
  --account-logo-image: ${({ $imageSrc }) => `url(${$imageSrc})`};
  --account-logo-size: 25px 25px;
  --account-logo-position: center;
  --account-logo-repeat: no-repeat;

  flex-shrink: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  height: 42px;
  width: 42px;
  border-radius: 8px;
  border: 1px solid var(--account-logo-border-color);

  display: flex;
  justify-content: stretch;
  align-items: stretch;
  overflow: hidden;

  ${({ $hasValue }) =>
    $hasValue
      ? css`
          ${FullButton}:not([data-disabled]) & {
            background-color: var(--color-gray-light);
            background-image: var(--account-logo-image);
            background-size: var(--account-logo-size);
            background-position: var(--account-logo-position);
            background-repeat: var(--account-logo-repeat);
          }
        `
      : css`
          --account-logo-color: var(--color-gray-1);
          ${withLogoSilhouette};
        `}

  ${FullButton}[data-disabled] & {
    --account-logo-color: var(--color-gray-medium-medium-light);
    ${withLogoSilhouette};
  }

  @media only screen and (min-width: 0px) and (max-width: 576px) {
    display: none;
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
  isDisabled,
  isRequired,
  externalButton,
  renderItemValue = (item: Item) => item.label,
}: {
  /** URL of the image to show in the control. */
  imageSrc: string
  /** A noun describing what is selected (eg. "Bluesky Account"). */
  label: string
  /** The label for an action to place at the bottom of the options. */
  actionLabel?: string
  /** Handler called when the action button is pressed. */
  actionOnPress?: () => void
  /** Renders the value of an item as text or similar inline content. */
  renderItemValue?: (item: Item) => ReactNode
  externalButton?: ReactNode
} & Pick<
  SelectProps<Item>,
  'name' | 'defaultSelectedKey' | 'isDisabled' | 'isRequired'
> &
  Pick<ListBoxProps<Item>, 'items'>) => {
  const prompt = `Select ${label}`
  const actionButton = (
    // Prevent the button from automagically being treated as the trigger
    // button just because it's inside the <Select> component.
    <ButtonContext.Provider value={{}}>
      {externalButton ? (
        externalButton
      ) : (
        <ActionButton onPress={actionOnPress}>{actionLabel}</ActionButton>
      )}
    </ButtonContext.Provider>
  )

  return (
    <Outside
      name={name}
      defaultSelectedKey={defaultSelectedKey}
      isDisabled={isDisabled}
      isRequired={isRequired}
    >
      <FullButton>
        <SelectValue<Item>>
          {({ selectedItem }) => {
            return (
              <Contents $hasValue={!!selectedItem}>
                <AccountLogo $hasValue={!!selectedItem} $imageSrc={imageSrc} />
                <MainSection>
                  {selectedItem ? (
                    <>
                      <Label>{label}</Label>
                      <Value>{renderItemValue(selectedItem)}</Value>
                    </>
                  ) : (
                    <Prompt>{prompt}</Prompt>
                  )}
                </MainSection>
                <DisclosureIcon />
              </Contents>
            )
          }}
        </SelectValue>
      </FullButton>
      <Popover aria-label={prompt}>
        {
          <>
            <ListBox
              items={
                items && [...items].length === 0
                  ? [{ id: '', label: '' }]
                  : items
              }
            >
              {(item) =>
                // The Select won't even open if there are no items, so we need
                // to put a dummy item in the listbox.
                item.id === '' ? (
                  <NonItem aria-hidden></NonItem>
                ) : (
                  <Item>{renderItemValue(item)}</Item>
                )
              }
            </ListBox>
            {actionButton}
          </>
        }
      </Popover>
    </Outside>
  )
}

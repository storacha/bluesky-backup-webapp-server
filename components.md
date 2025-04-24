## Components

We're working on a design-system, so this is where some of the usage or "HOW-TOs" of components may appear.

### Modal

A modal component with the native `<dialog />` element. You can provide the `isOpen` and `onClose` prop values by importing `useDisclosure()` from `@/hooks/use-disclosure`

#### Props

# Modal Props

| Prop          | Type     | Description                                                                                                                                                  | Default     |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `title`       | string   | A title for the modal. Not rendered if nothing is provided.                                                                                                  | `undefined` |
| `isOpen`      | boolean  | State value to check if the modal is open. Required.                                                                                                         | `false`     |
| `onClose`     | function | Callback handler that closes the modal.                                                                                                                      | Required    |
| `hasCloseBtn` | boolean  | Controls whether to render a close button in the modal. If not provided, the modal can still be closed by pressing the 'Escape' key or clicking the overlay. | `undefined` |
| `size`        | string   | Controls the size of the modal. Accepts values: "xs", "sm", "md", "lg", "xl", or "full".                                                                     | `"md"`      |

#### Example

```tsx
import { useDisclosure } from '@/hooks/use-disclosure'
import { Modal } from '@/components/ui'

const Example = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal title="Awesome Modal" isOpen={isOpen} onClose={onClose} size="lg">
        <Box>Modal content goes here</Box>
      </Modal>
    </>
  )
}
```

### A global store with the URL

To better improve teh experience of people when they try to backup their data, we're going the "ui state in the URL" approach, to create this deep-linking experience for people, with a persisted ui state, so even when they leave the page, they can always come back to that exact point in the UI where they left off.

A simple example can be seen below, with the modal component.

```tsx
import { useUiComponentStore } from '@/store/ui'
import { useDisclosure } from '@/hooks/use-disclosure'

const ModalComponentWithUiState = () => {
  const { updateUiStore } = useUiComponentStore()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const openModal = () => {
    onOpen()
    updateUiStore({ ui: 'keychain' })
  }

  return (
    <>
      <Button onClick={openModal}>Open Modal</Button>
      <Modal title="Awesome Modal" isOpen={isOpen} onClose={onClose} size="lg">
        <Box>Modal content goes here</Box>
      </Modal>
    </>
  )
}
```

Please ensure you include the specific ui component value in the `UiComponents` type [here](https://github.com/bluesky-backup/webapp-server/blob/main/src/store/ui.ts#L6)

```ts
export type UiComponents = 'snapshots' | 'account' | 'keychain' | ''
```

We can then proceed to check if there's a ui component in the URL, and if so, open the corresponding modal when the parent component renders initially

```tsx
const { store } = useUiComponentStore()

useEffect(() => {
  if (store.ui === 'keychain') {
    onOpen()
  }
}, [store.ui])
```

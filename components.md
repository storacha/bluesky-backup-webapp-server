## Components

We're working on a design-system, so this is where some of the usage or "HOW-TOs" of components may appear.

### Modal

A modal component with the native `<dialog />` element. You can provide the `isOpen` and `onClose` prop values by importing `useDisclosure()` from `@/hooks/use-disclosure`

#### Props

# Modal Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `title` | string | A title for the modal. Not rendered if nothing is provided. | `undefined` |
| `isOpen` | boolean | State value to check if the modal is open. Required. | `false` |
| `onClose` | function | Callback handler that closes the modal. | Required |
| `hasCloseBtn` | boolean | Controls whether to render a close button in the modal. If not provided, the modal can still be closed by pressing the 'Escape' key or clicking the overlay. | `undefined` |
| `size` | string | Controls the size of the modal. Accepts values: "xs", "sm", "md", "lg", "xl", or "full". | `"md"` |

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

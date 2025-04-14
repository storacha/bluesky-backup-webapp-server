import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import Dialog, {
  DialogActions,
  DialogCloseButton,
  DialogConfirmButton,
} from '@/components/Dialog'
import Button from '@/components/Button'

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    showCloseButton: { control: 'boolean' },
    closeOnOverlayClick: { control: 'boolean' },
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Dialog Title',
    description: 'This is a description of the dialog content',
    children: <p className="py-4">Dialog content goes here</p>,
    footer: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Confirm</Button>
      </>
    ),
  },
}

// Interactive example
export const Interactive = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsOpen(false)
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirmation Required"
        description="Please confirm that you want to continue with this action."
      >
        <p className="py-4">
          This action cannot be undone. Are you sure you want to proceed?
        </p>

        <DialogActions>
          <DialogCloseButton onClick={() => setIsOpen(false)} />
          <DialogConfirmButton onClick={handleConfirm} isLoading={isLoading}>
            I&apos;m Sure
          </DialogConfirmButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}
Interactive.parameters = {
  docs: {
    source: {
      code: `
const [isOpen, setIsOpen] = useState(false);
const [isLoading, setIsLoading] = useState(false);

const handleConfirm = async () => {
  setIsLoading(true);
  await new Promise(resolve => setTimeout(resolve, 1500));
  setIsLoading(false);
  setIsOpen(false);
};

return (
  <div className="space-y-4">
    <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
    
    <Dialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Confirmation Required"
      description="Please confirm that you want to continue with this action."
    >
      <p className="py-4">
        This action cannot be undone. Are you sure you want to proceed?
      </p>
      
      <DialogActions>
        <DialogCloseButton onClick={() => setIsOpen(false)} />
        <DialogConfirmButton 
          onClick={handleConfirm} 
          isLoading={isLoading}
        >
          I&apos;m Sure
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  </div>
);`,
    },
  },
}

export const DifferentSizes: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Dialog Title',
    size: 'lg',
    children: (
      <div className="space-y-4 py-4">
        <p>This dialog demonstrates a larger size.</p>
        <p>Available sizes are: sm, md, lg, xl</p>
        <p>
          You can use these sizes to accommodate different amounts of content.
        </p>
      </div>
    ),
  },
}

export const WithoutCloseButton: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'No Close Button',
    showCloseButton: false,
    children: (
      <p className="py-4">
        This dialog doesn&apos;t have a close button in the corner.
      </p>
    ),
    footer: (
      <Button variant="primary" className="w-full">
        Continue
      </Button>
    ),
  },
}

import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { PaginationControls } from './Pagination'

const meta: Meta<typeof PaginationControls> = {
  title: 'components/Pagination',
  component: PaginationControls,
  args: {
    totalPages: 20,
    delta: 3,
  },
}
export default meta

type Story = StoryObj<typeof PaginationControls>

/* eslint-disable @typescript-eslint/no-explicit-any */
function PaginationStoryWrapper(args: any) {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <PaginationControls
      {...args}
      currentPage={currentPage}
      onChange={(page) => setCurrentPage(page)}
    />
  )
}

export const Default: Story = {
  render: (args) => <PaginationStoryWrapper {...args} />,
  args: {
    totalPages: 10,
    delta: 1,
  },
}

export const WithManyPages: Story = {
  render: (args) => <PaginationStoryWrapper {...args} />,
  args: {
    totalPages: 32,
    delta: 2,
  },
}

export const Minimal: Story = {
  render: (args) => <PaginationStoryWrapper {...args} />,
  args: {
    totalPages: 3,
    delta: 1,
  },
}

import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { styled } from 'next-yak'

import { Stack } from './ui'

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
`

interface PaginationProps {
  /** Total number of pages available */
  totalPages: number
  /** Current active page number (1-based) */
  currentPage: number
  /**
   * Called when a different page number is selected
   * @param page - The new page number
   */
  onChange: (page: number) => void
  /**
   * Number of sibling pages to show on either side of the current page
   * @default 2
   */
  delta?: number
}

export const PaginationControls = ({
  totalPages,
  currentPage,
  onChange,
  delta = 2,
}: PaginationProps) => {
  if (totalPages <= 1) return null

  const range: (number | 'dots')[] = []

  const left = Math.max(2, currentPage - delta)
  const right = Math.min(totalPages - 1, currentPage + delta)

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      range.push(i)
    } else if (
      range[range.length - 1] !== 'dots' &&
      (i === left - 1 || i === right + 1)
    ) {
      range.push('dots')
    }
  }

  return (
    <PaginationContainer>
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <CaretLeft size={20} />
      </button>
      <Stack $gap="1rem" $direction="row" $height="fit-content">
        {range.map((value, idx) =>
          value === 'dots' ? (
            <span key={`dots-${idx}`}>...</span>
          ) : (
            <button
              key={value}
              onClick={() => onChange(value)}
              style={{
                color: value === currentPage ? 'var(--color-dark-blue)' : '',
                fontWeight: value === currentPage ? 'bold' : 'normal',
                textDecoration: value === currentPage ? 'underline' : 'none',
              }}
            >
              {value}
            </button>
          )
        )}
      </Stack>
      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <CaretRight size={20} />
      </button>
    </PaginationContainer>
  )
}

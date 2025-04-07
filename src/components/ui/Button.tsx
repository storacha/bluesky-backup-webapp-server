import { styled } from 'next-yak'

export const Button = styled.button`
  font-family: var(--font-dm-mono);
  font-weight: 300;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: 1.125rem;
  text-align: center;

  &:active {
    background-color: var(--color-gray-medium);
  }
`

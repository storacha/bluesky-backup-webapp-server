import { styled } from 'next-yak'

export const Input = styled.div`
  position: relative;
  --input-padding-tb: 0.75rem;
  --input-padding-lr: 1rem;
  --label-line-height: 1.25rem;
  --gap: 0.125rem;

  & > input {
    padding: calc(
        var(--input-padding-tb) + var(--label-line-height) + var(--gap)
      )
      var(--input-padding-lr) var(--input-padding-tb);

    border: 1px solid var(--color-gray-light);
    border-radius: 0.75rem;

    font-size: 1.125rem;
    width: 100%;
  }

  & > label {
    position: absolute;
    top: var(--input-padding-tb);
    left: 1rem;
    pointer-events: none;
    font-size: 0.875rem;
    line-height: var(--label-line-height);
    color: var(--color-gray-medium);
  }
`

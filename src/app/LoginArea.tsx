import { styled } from 'next-yak'
import { Stack } from './Stack'

const Outside = styled.div`
  border: 1px solid var(--color-gray-light);
  border-radius: 0.75rem;
  padding: 2.5rem;
  box-shadow: 0px 8px 26px 0px #63637514;
`

const H3 = styled.h3`
  font-size: 1.375rem;
  line-height: 1.5rem;
  font-weight: 700;
`

const H4 = styled.h4`
  font-size: 1.125rem;
  line-height: 1.5rem;
  font-weight: 400;
  color: var(--color-gray-medium);
`

const Input = styled.div`
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

const Button = styled.button`
  font-family: var(--font-dm-mono);
  font-weight: 300;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: 1.125rem;
  text-align: center;
`

export const LoginArea = ({ emailAddress }: { emailAddress: string }) => {
  return (
    <Outside>
      <form>
        <Stack $gap="2rem">
          <Stack $gap="0.5rem">
            <H3>First, log in to Storacha</H3>
            <H4>If you don’t have an account, we’ll create one for you.</H4>
          </Stack>
          <Input>
            <label>Email address</label>
            <input type="email" value={emailAddress} />
          </Input>
          <Button type="submit">Log in</Button>
        </Stack>
      </form>
    </Outside>
  )
}

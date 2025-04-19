import { styled } from 'next-yak'
import { Container, Heading } from './Backup'

const RestoreContainer = styled(Container)`
  height: 100vh;
  border-left: 1px solid var(--color-light-blue);
`

export const BackupRestore = () => {
  return (
    <RestoreContainer>
      <Heading>backup & restore</Heading>
    </RestoreContainer>
  )
}

import { styled } from 'next-yak'
import { Container, Heading } from './Backup'
import { Center, Text } from '../ui'

const RestoreContainer = styled(Container)`
  height: 100vh;
  border-left: 1px solid var(--color-light-blue);
`

const Instruction = styled(Text)``

export const BackupRestore = () => {
  return (
    <RestoreContainer>
      <Heading>backup & restore</Heading>
      <Center $height="90vh">
        <Instruction $fontWeight="600">
          Press &quot;Create Backup&quot; to get started!
        </Instruction>
      </Center>
    </RestoreContainer>
  )
}

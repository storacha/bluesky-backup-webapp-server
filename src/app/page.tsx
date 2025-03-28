import { styled } from 'next-yak'
import { LoginArea } from './LoginArea'
import { Stack } from './Stack'

const Outside = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  min-height: 100vh;
`

const Header = styled.header`
  padding: 2rem;
`

const Main = styled.main`
  flex: 1 0 auto;
  padding: 2rem;
`

const Tagline = styled.h2`
  font-size: 60px;
  font-family: var(--font-epilogue);
`

const Footer = styled.footer`
  padding: 2rem;
`

export default function Home() {
  return (
    <Outside>
      <Header>Storacha</Header>
      <Main>
        <Stack $gap="2.5rem" $direction="row" $even>
          <div>
            <Tagline>Backup & Restore your Bluesky Account</Tagline>
          </div>
          <div>
            <LoginArea emailAddress="timothy-chalamet@gmail.com" />
          </div>
        </Stack>
      </Main>
      <Footer>STORACHA</Footer>
    </Outside>
  )
}

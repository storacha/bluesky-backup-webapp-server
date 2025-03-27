import { styled } from 'next-yak'

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

  display: flex;
  flex-direction: row;
  padding: 2rem;

  & > * {
    flex: 1 1 0;
  }
`

const Tagline = styled.h2`
  font-size: 60px;
  font-family: var(--font-epilogue-500);
`

const Login = styled.div``

const Footer = styled.footer`
  padding: 2rem;
`

export default function Home() {
  return (
    <Outside>
      <Header>Storacha</Header>
      <Main>
        <div>
          <Tagline>Backup & Restore your Bluesky Account</Tagline>
        </div>
        <div>
          <Login>Login</Login>
        </div>
      </Main>
      <Footer>STORACHA</Footer>
    </Outside>
  )
}

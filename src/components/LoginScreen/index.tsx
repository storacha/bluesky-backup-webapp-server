import Image, { getImageProps } from 'next/image'
import { styled } from 'next-yak'

import { LoginArea } from '@/components/LoginScreen/LoginArea'
import { Stack } from '@/components/ui'

const Outside = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  min-height: 100vh;
  background-repeat: no-repeat;
  background-size: cover;
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

function getBackgroundImage(srcSet = '') {
  const imageSet = srcSet
    .split(', ')
    .map((str) => {
      const [url, dpi] = str.split(' ')
      return `url("${url}") ${dpi}`
    })
    .join(', ')
  return `image-set(${imageSet})`
}

export function LoginScreen() {
  const {
    props: { srcSet },
  } = getImageProps({
    alt: '',
    width: 1200,
    height: 630,
    src: '/bluesky-storacha.webp',
  })
  const backgroundImage = getBackgroundImage(srcSet)
  return (
    <Outside style={{ height: '100vh', width: '100vw', backgroundImage }}>
      <Header>
        <Image src="/wordlogo.png" alt="Storacha" width="164" height="57" />
      </Header>
      <Main>
        <Stack $gap="2.5rem" $direction="row" $even>
          <div>
            <Tagline>Backup & Restore your Bluesky Account</Tagline>
          </div>
          <div>
            <LoginArea />
          </div>
        </Stack>
      </Main>
      <Footer>STORACHA</Footer>
    </Outside>
  )
}

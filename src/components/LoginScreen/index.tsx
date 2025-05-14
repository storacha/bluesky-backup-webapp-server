import Image, { getImageProps } from 'next/image'
import Link from 'next/link'
import { styled } from 'next-yak'

import { LoginArea } from '@/components/LoginScreen/LoginArea'
import { Stack } from '@/components/ui'
import wordmark from '@/images/storacha-wm.svg'
import wordlogo from '@/images/wordlogo.png'

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

  @media only screen and (min-width: 0px) and (max-width: 992px) {
    font-size: 35px;
  }
`

const Footer = styled.footer`
  border-color: var(--color-dark-blue);
  color: var(--color-dark-blue);
  padding-left: 1.5rem;
  padding-right: 1.5rem;
`

const FooterContainer = styled.div`
  padding: 1.5rem 1.25rem;
  border: 3px solid;
  border-radius: 2.5rem;
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

const footerLinks = {
  resources: [
    {
      text: 'Quickstart Guide',
      href: 'https://docs.storacha.network/quickstart',
    },
    { text: 'FAQ', href: 'https://docs.storacha.network/faq' },
    { text: 'Contact Us', href: 'mailto:support@storacha.network' },
    { text: 'Terms of Service', href: 'https://docs.storacha.network/terms' },
    {
      text: 'Privacy Policy',
      href: 'https://docs.storacha.network/privacy-policy',
    },
    { text: 'Status', href: 'https://status.storacha.network' },
  ],
  getStarted: [
    {
      text: 'JS Client',
      href: 'https://github.com/storacha/w3up/tree/main/packages/w3up-client#readme',
    },
    { text: 'CLI', href: 'https://docs.storacha.network/w3cli' },
    { text: 'Web UI', href: 'https://console.storacha.network' },
  ],
}

const mailingList = {
  href: 'https://945c6cfe.sibforms.com/serve/MUIFAOom2AtelLIYvFII91Z7ohm-e_pdRCS6DYtA0a5Cvn5DfuG0YQrPRnKbp7OXbJq4ogT7oejPXZFPtyS3L6ZgUvL0tJ3bP6_7sgO6kprVKqTHJECQ4WJeangGIU7MpK0mMx-3XVF3v6sNSYq2Vy1LaAltLwmnB-DE7QjXdLk9XM_AcErDhQoYPqms63o_IeGxnirl6AJcYuCO',
  text: 'Join Mailing List',
}

/**
 * I'm inlining this SVG because Iconify wasn't working as expected, and that's
 * where these SVGs live - I've copied them out of the JSON included in the
 * @iconify-json/{simple-icons|carbon} packages.
 */
const SvgIcon = ({
  path,
  height = '32',
  width = '32',
}: {
  path: string
  height?: string
  width?: string
}) => (
  <svg height={height} width={width}>
    <path fill="currentColor" d={path} viewBox={`0 0 ${width} ${height}`} />
  </svg>
)

const discordIconPath =
  'M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0a13 13 0 0 0-.617-1.25a.08.08 0 0 0-.079-.037A19.7 19.7 0 0 0 3.677 4.37a.1.1 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.08.08 0 0 0 .084-.028a14 14 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13 13 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10 10 0 0 0 .372-.292a.07.07 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.07.07 0 0 1 .078.01q.181.149.373.292a.077.077 0 0 1-.006.127a12.3 12.3 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028a19.8 19.8 0 0 0 6.002-3.03a.08.08 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03M8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418'

const xIconPath =
  'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584l-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z'

const gitHubIconPath =
  'M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'

const mediumIconPath =
  'M4.21 0A4.2 4.2 0 0 0 0 4.21v15.58A4.2 4.2 0 0 0 4.21 24h15.58A4.2 4.2 0 0 0 24 19.79v-1.093a5 5 0 0 1-.422.02c-2.577 0-4.027-2.146-4.09-4.832a8 8 0 0 1 .022-.708c.093-1.186.475-2.241 1.105-3.022a3.9 3.9 0 0 1 1.395-1.1c.468-.237 1.127-.367 1.664-.367h.023q.151 0 .303.01V4.211A4.2 4.2 0 0 0 19.79 0Zm.198 5.583h4.165l3.588 8.435l3.59-8.435h3.864v.146l-.019.004c-.705.16-1.063.397-1.063 1.254h-.003l.003 10.274c.06.676.424.885 1.063 1.03l.02.004v.145h-4.923v-.145l.019-.005c.639-.144.994-.353 1.054-1.03V7.267l-4.745 11.15h-.261L6.15 7.569v9.445c0 .857.358 1.094 1.063 1.253l.02.004v.147H4.405v-.147l.019-.004c.705-.16 1.065-.397 1.065-1.253V6.987c0-.857-.358-1.094-1.064-1.254l-.018-.004zm19.25 3.668c-1.086.023-1.733 1.323-1.813 3.124H24V9.298a1.4 1.4 0 0 0-.342-.047m-1.862 3.632c-.1 1.756.86 3.239 2.204 3.634v-3.634z'

const youtubeIconPath =
  'M23.498 6.186a3.02 3.02 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.02 3.02 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.02 3.02 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.02 3.02 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814M9.545 15.568V8.432L15.818 12z'

const farcasterIconPath =
  'M18.24.24H5.76A5.76 5.76 0 0 0 0 6v12a5.76 5.76 0 0 0 5.76 5.76h12.48A5.76 5.76 0 0 0 24 18V6A5.76 5.76 0 0 0 18.24.24m.816 17.166v.504a.49.49 0 0 1 .543.48v.568h-5.143v-.569A.49.49 0 0 1 15 17.91v-.504c0-.22.153-.402.358-.458l-.01-4.364c-.158-1.737-1.64-3.098-3.443-3.098s-3.285 1.361-3.443 3.098l-.01 4.358c.228.042.532.208.54.464v.504a.49.49 0 0 1 .543.48v.568H4.392v-.569a.49.49 0 0 1 .543-.479v-.504c0-.253.201-.454.454-.472V9.039h-.49l-.61-2.031H6.93V5.042h9.95v1.966h2.822l-.61 2.03h-.49v7.896c.252.017.453.22.453.472'

const blueskyIconPath =
  'M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565C.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479c.815 2.736 3.713 3.66 6.383 3.364q.204-.03.415-.056q-.207.033-.415.056c-3.912.58-7.387 2.005-2.83 7.078c5.013 5.19 6.87-1.113 7.823-4.308c.953 3.195 2.05 9.271 7.733 4.308c4.267-4.308 1.172-6.498-2.74-7.078a9 9 0 0 1-.415-.056q.21.026.415.056c2.67.297 5.568-.628 6.383-3.364c.246-.828.624-5.79.624-6.478c0-.69-.139-1.861-.902-2.206c-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8'

const redditIconPath =
  'M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286A.72.72 0 0 0 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0m4.388 3.199a1.999 1.999 0 1 1-1.947 2.46v.002a2.37 2.37 0 0 0-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363a2.802 2.802 0 1 1 2.908 4.753c-.088 3.256-3.637 5.876-7.997 5.876c-4.361 0-7.905-2.617-7.998-5.87a2.8 2.8 0 0 1 1.189-5.34c.645 0 1.239.218 1.712.585c1.275-.79 2.881-1.291 4.64-1.365v-.01a3.23 3.23 0 0 1 2.88-3.207a2 2 0 0 1 1.959-1.595m-8.085 8.376c-.784 0-1.459.78-1.506 1.797s.64 1.429 1.426 1.429s1.371-.369 1.418-1.385s-.553-1.841-1.338-1.841m7.406 0c-.786 0-1.385.824-1.338 1.841s.634 1.385 1.418 1.385c.785 0 1.473-.413 1.426-1.429c-.046-1.017-.721-1.797-1.506-1.797m-3.703 4.013c-.974 0-1.907.048-2.77.135a.222.222 0 0 0-.183.305a3.2 3.2 0 0 0 2.953 1.964a3.2 3.2 0 0 0 2.953-1.964a.222.222 0 0 0-.184-.305a28 28 0 0 0-2.769-.135'

const emailIconPath =
  'M28 6H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2m-2.2 2L16 14.78L6.2 8ZM4 24V8.91l11.43 7.91a1 1 0 0 0 1.14 0L28 8.91V24Z'

const socialNetworks = [
  {
    name: 'Discord',
    description: 'Get involved',
    href: 'https://discord.gg/pqa6Dn6RnP',
    icon: <SvgIcon path={discordIconPath} />,
  },
  {
    name: 'X',
    description: 'Read the latest',
    href: 'https://x.com/storachanetwork',
    icon: <SvgIcon path={xIconPath} />,
  },
  {
    name: 'GitHub',
    description: 'Build with us',
    href: 'https://github.com/storacha',
    icon: <SvgIcon path={gitHubIconPath} />,
  },
  {
    name: 'Medium',
    description: 'Read our blog',
    href: 'https://medium.com/@storacha',
    icon: <SvgIcon path={mediumIconPath} />,
  },
  {
    name: 'YouTube',
    description: 'Watch our demos',
    href: 'https://www.youtube.com/@StorachaNetwork',
    icon: <SvgIcon path={youtubeIconPath} />,
  },
  {
    name: 'Farcaster',
    description: 'Join the discussion',
    href: 'https://warpcast.com/storacha',
    icon: <SvgIcon path={farcasterIconPath} />,
  },
  {
    name: 'Bluesky',
    description: 'Join the conversation',
    href: 'https://bsky.app/profile/storacha.network',
    icon: <SvgIcon path={blueskyIconPath} />,
  },
  {
    name: 'Reddit',
    description: 'See more',
    href: 'https://www.reddit.com/r/Storacha',
    icon: <SvgIcon path={redditIconPath} />,
  },
]

const AppLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const ButtonLink = styled.a`
  display: block;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
`

const MailingListButtonLink = styled(ButtonLink)`
  color: var(--color-white);
  background: var(--color-dark-blue);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
  height: fit-content;
  padding: 0.75rem 1.25rem;
  border-radius: 2rem;
  font-weight: 500;
`

function MailingListSignup() {
  return (
    <MailingListButtonLink href={mailingList.href} target="_blank">
      <SvgIcon path={emailIconPath} />
      {mailingList.text}
    </MailingListButtonLink>
  )
}

const WordmarkContainer = styled.div`
  margin-top: 8rem;
  height: 8rem;
  position: relative;

  @media only screen and (min-width: 0px) and (max-width: 600px) {
    margin-top: 2rem;
    height: 3rem;
  }
`

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: flex-start;

  @media only screen and (min-width: 0px) and (max-width: 600px) {
    grid-template-columns: 1fr;
  }

  @media only screen and (min-width: 601px) and (max-width: 992px) {
    grid-template-columns: 1fr 1fr;
    & > *:nth-child(3) {
      grid-column: span 2;
    }
  }
`

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;

  @media only screen and (max-width: 992px) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
`

const FooterHeading = styled.h5`
  font-weight: 500;
  text-wrap: pretty;
  font-size: 1.125rem;
  margin-bottom: 1rem;
`

const SocialIconsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;

  @media only screen and (min-width: 0px) and (max-width: 600px) {
    align-items: left;
    justify-content: flex-start;
  }

  @media only screen and (min-width: 601px) and (max-width: 992px) {
    margin-top: 1.1rem;
  }
`

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media only screen and (max-width: 600px) {
    & li {
      font-size: 0.75rem;
    }
  }
`

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`

const MainStack = styled(Stack)`
  @media only screen and (min-width: 0px) and (max-width: 576px) {
    flex-flow: column;
  }

  @media only screen and (min-width: 600px) and (max-width: 992px) {
    gap: 0.4rem;
  }
`

const MainContainer = styled.section`
  @media only screen and (min-width: 1440px) {
    padding: 0 12rem;
  }
`

export function LoginScreen() {
  const {
    props: { srcSet },
  } = getImageProps({
    alt: '',
    // set this to the dimensions of the image itself to avoid scaling
    width: 1441,
    height: 1832,
    src: '/background.png',
  })
  const backgroundImage = getBackgroundImage(srcSet)
  return (
    <Outside
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage,
      }}
    >
      <MainContainer>
        <Header>
          <Image src="/wordlogo.png" alt="Storacha" width="164" height="57" />
        </Header>
        <Main>
          <MainStack $gap="2.5rem" $direction="row" $even>
            <div>
              <Tagline>Backup & Restore your Bluesky Account</Tagline>
            </div>
            <div>
              <LoginArea />
            </div>
          </MainStack>
        </Main>
        <Footer>
          <FooterContainer>
            <FooterGrid>
              <div>
                <MailingListSignup />
              </div>
              <SocialIconsContainer>
                {socialNetworks.map((network) => (
                  <AppLink
                    key={network.name}
                    href={network.href}
                    target="_blank"
                    title={network.description}
                  >
                    {network.icon ? network.icon : network.name}
                  </AppLink>
                ))}
              </SocialIconsContainer>
              <LinksGrid>
                <FooterSection>
                  <FooterHeading>Resources</FooterHeading>
                  <FooterLinks>
                    {footerLinks.resources.map((link) => (
                      <li key={link.href}>
                        <AppLink href={link.href}>{link.text}</AppLink>
                      </li>
                    ))}
                  </FooterLinks>
                </FooterSection>
                <FooterSection>
                  <FooterHeading>Getting Started</FooterHeading>
                  <FooterLinks>
                    {footerLinks.getStarted.map((link) => (
                      <li key={link.href}>
                        <AppLink href={link.href}>{link.text}</AppLink>
                      </li>
                    ))}
                  </FooterLinks>
                </FooterSection>
              </LinksGrid>
            </FooterGrid>
            <WordmarkContainer>
              <Image src={wordmark} alt="Storacha" height="204" width="1360" />
            </WordmarkContainer>
          </FooterContainer>
        </Footer>
      </MainContainer>
    </Outside>
  )
}

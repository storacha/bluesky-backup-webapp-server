'use client'

import { styled } from 'next-yak'

const StyledDiv = styled.div`
  color: #333;
  padding: 16px;
  background-color: tomato;
`

const MyParagraph = styled.p<{ $primary?: boolean }>`
  color: ${(props) => (props.$primary ? 'teal' : 'orange')};
  background-color: #f0f0f0;
`

export default function Home() {
  return (
    <>
      <StyledDiv>Hello, next-yak!</StyledDiv>
      <MyParagraph>I work like styled-components</MyParagraph>
      <MyParagraph $primary>I work like styled-components</MyParagraph>
    </>
  )
}

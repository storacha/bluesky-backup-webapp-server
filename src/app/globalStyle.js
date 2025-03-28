import 'the-new-css-reset/css/reset.css'
import './global.css'

import { DM_Sans, DM_Mono, Epilogue } from 'next/font/google'

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: '300',
  variable: '--font-dm-mono',
})

export const epilogue = Epilogue({
  subsets: ['latin'],
  weight: '500',
  variable: '--font-epilogue',
})

import 'the-new-css-reset/css/reset.css'

import { DM_Sans, Epilogue } from 'next/font/google'

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const epilogue = Epilogue({
  subsets: ['latin'],
  weight: '500',
  variable: '--font-epilogue-500',
})

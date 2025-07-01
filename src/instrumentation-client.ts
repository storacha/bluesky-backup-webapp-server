// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { captureRouterTransitionStart, init } from '@sentry/nextjs'

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENV,
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})

export const onRouterTransitionStart = captureRouterTransitionStart

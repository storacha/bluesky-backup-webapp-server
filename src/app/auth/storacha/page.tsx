'use client'

import dynamic from "next/dynamic";

function Page () {
  const StorachaAuthenticator = dynamic(() => import('../../../components/StorachaAuthenticator'), {
    loading: () => <p>Loading...</p>,
    ssr: false
  })

  return (
    <div className='bg-grad flex flex-col items-center h-screen'>
      <StorachaAuthenticator />
    </div>
  )
}

export default Page
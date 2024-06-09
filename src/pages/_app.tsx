import '@/styles/globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import type { AppProps } from 'next/app'
import Header from '@/components/Header'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
        <Header/>
      <Component {...pageProps} />
    </ClerkProvider>
  )
}

export default MyApp;
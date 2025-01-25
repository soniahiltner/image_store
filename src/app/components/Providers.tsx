'use client'
import  { SessionProvider } from 'next-auth/react'
import { ImageKitProvider } from 'imagekitio-next'

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const authenticator = async () => {
    try {
      const res = await fetch('/api/imagekit-auth')
      if (!res.ok) {
        throw new Error('Failed to authenticate')
      }
      return res.json()
    } catch (error) {
      throw error
    }
  }

  return (
    <SessionProvider refetchInterval={3000}>
      <ImageKitProvider
        urlEndpoint={urlEndpoint}
        publicKey={publicKey}
        authenticator={authenticator}
      >
        {children}
      </ImageKitProvider>
    </SessionProvider>
  )
}

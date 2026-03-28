import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'WebOS',
  description: 'Web-based Operating System',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

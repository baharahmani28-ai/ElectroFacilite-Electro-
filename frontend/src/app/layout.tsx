import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Facilite ELECTRO - Pour les Paiements Échelonnés',
  description: 'Plateforme de gestion des paiements échelonnés pour les clients, demandes de financement et produits',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}


import './globals.css'

export const metadata = {
  title: 'Hotel Maheshwar\'s Stay - Booking Confirmation',
  description: 'Internal booking confirmation email sender',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}

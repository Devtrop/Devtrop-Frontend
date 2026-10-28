'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/shared/navbar/Navbar'
import { Footer } from '@/components/shared/footer/Footer'
import ChatHub from '@/components/shared/ChatHub'
import { SITE_CONFIG } from '@/data/site'
import { whatsappUrl, WHATSAPP_MESSAGES } from '@/lib/whatsapp'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if the current route is a dashboard route or auth route
  const isDashboard = pathname?.startsWith('/dashboard')
  const isAuth = pathname?.startsWith('/auth')
  
  // Hide navbar and footer on dashboard and auth pages
  const hideNavAndFooter = isDashboard || isAuth

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      <main className="flex-1 flex flex-col w-full">{children}</main>
      {!hideNavAndFooter && <Footer />}
      {!hideNavAndFooter && (
        <ChatHub
          whatsappHref={whatsappUrl(WHATSAPP_MESSAGES.default)}
          contactEmail={SITE_CONFIG.contactEmail}
          defaultMessage={WHATSAPP_MESSAGES.default}
        />
      )}
    </>
  )
}

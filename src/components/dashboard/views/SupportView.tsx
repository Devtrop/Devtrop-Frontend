'use client'

import React from 'react'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { SupportSkeleton } from '@/components/dashboard/support/SupportSkeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, Mail, MessageSquare, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SupportView() {
  return (
    <RoleGuard fallback={<SupportSkeleton />} allowedRoles={['SUPER_ADMIN', 'ADMIN', 'USER']}>
      <div className="flex flex-col gap-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="size-6 text-emerald-400" />
            Help & Documentation
          </h1>
          <p className="text-xs text-muted-foreground">
            Frequently asked questions, platform usage guides, and recruitment support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Mail className="size-4 text-emerald-400" />
                Contact Coordinator
              </CardTitle>
              <CardDescription className="text-xs">
                Need to reschedule or clarify interview requirements?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="w-full cursor-pointer">
                hello@risetogetherbd.com
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="size-4 text-sky-400" />
                Live Discord / Community
              </CardTitle>
              <CardDescription className="text-xs">
                Join our community channel for platform questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="w-full gap-1.5 cursor-pointer">
                <span>Join Community</span>
                <ExternalLink className="size-3" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xs font-semibold">
                  How does dynamic Role-Based Access Control work?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Our system evaluates permissions based on your assigned role (Super Admin, Admin,
                  or User). The sidebar and route guards dynamically show only authorized navigation
                  menus, ensuring full security and isolation.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-xs font-semibold">
                  How do I pin or collapse the sidebar?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  The sidebar stays in a collapsed icon rail by default and expands smoothly when
                  hovered. You can click the Pin icon at the top of the sidebar to lock it into the
                  expanded view permanently across page reloads.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-xs font-semibold">
                  How do candidates book interview slots?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Admins generate pools of available time slots and send invitation links.
                  Candidates can then visit the booking portal, pick a convenient time, and
                  instantly receive confirmation with calendar details.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}

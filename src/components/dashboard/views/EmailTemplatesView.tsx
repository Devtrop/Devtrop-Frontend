'use client'

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Search, RotateCcw, Copy, Trash2, Edit, Eye, X, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { emailTemplatesApi, CATEGORY_DISPLAY_CONFIG } from '@/lib/email-templates'
import { emailCache } from '@/lib/email-templates-cache'
import { EmailPreviewModal } from '@/components/dashboard/email-templates/EmailPreviewModal'
import { EmailLayoutsTab } from '@/components/dashboard/email-templates/EmailLayoutsTab'
import type {
  EmailTemplate,
  EmailTemplateCategory,
  EmailTemplateStatus,
} from '@/types/email-template'

type MainTab = 'MESSAGES' | 'LAYOUTS'
type CategoryFilterGroup = 'ALL' | 'INTERVIEW' | 'ONBOARDING' | 'TASK' | 'GENERAL' | 'APPLICATIONS'

export function EmailTemplatesView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    if (typeof window !== 'undefined') {
      const fromUrl = new URLSearchParams(window.location.search).get('tab')?.toUpperCase()
      if (fromUrl === 'LAYOUTS' || fromUrl === 'MESSAGES') {
        return fromUrl as MainTab
      }
      const saved = sessionStorage.getItem('email_templates_active_tab')?.toUpperCase()
      if (saved === 'LAYOUTS' || saved === 'MESSAGES') {
        return saved as MainTab
      }
    }
    return 'MESSAGES'
  })

  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    const cached = emailCache.getTemplates()
    return cached && cached.length > 1 ? cached : []
  })
  const [loading, setLoading] = useState(() => {
    const cached = emailCache.getTemplates()
    return !cached || cached.length <= 1
  })
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EmailTemplateStatus | '' | 'ALL_STATUS'>('')

  const [groupFilter, setGroupFilter] = useState<CategoryFilterGroup>(() => {
    if (typeof window !== 'undefined') {
      const fromUrl = new URLSearchParams(window.location.search).get('group')?.toUpperCase()
      if (
        fromUrl &&
        ['ALL', 'INTERVIEW', 'ONBOARDING', 'TASK', 'GENERAL', 'APPLICATIONS'].includes(fromUrl)
      ) {
        return fromUrl as CategoryFilterGroup
      }
      const saved = sessionStorage.getItem('email_templates_group_filter')?.toUpperCase()
      if (
        saved &&
        ['ALL', 'INTERVIEW', 'ONBOARDING', 'TASK', 'GENERAL', 'APPLICATIONS'].includes(saved)
      ) {
        return saved as CategoryFilterGroup
      }
    }
    return 'ALL'
  })

  useEffect(() => {
    const tabParam = searchParams.get('tab')?.toUpperCase()
    if (tabParam === 'LAYOUTS' || tabParam === 'MESSAGES') {
      setActiveTab(tabParam as MainTab)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('email_templates_active_tab', tabParam)
      }
    } else if (typeof window !== 'undefined') {
      const savedTab = sessionStorage.getItem('email_templates_active_tab')?.toUpperCase()
      if (savedTab === 'LAYOUTS' || savedTab === 'MESSAGES') {
        setActiveTab(savedTab as MainTab)
      }
    }

    const groupParam = searchParams.get('group')?.toUpperCase()
    if (
      groupParam &&
      ['ALL', 'INTERVIEW', 'ONBOARDING', 'TASK', 'GENERAL', 'APPLICATIONS'].includes(groupParam)
    ) {
      setGroupFilter(groupParam as CategoryFilterGroup)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('email_templates_group_filter', groupParam)
      }
    } else if (!groupParam && typeof window !== 'undefined') {
      const savedGroup = sessionStorage.getItem('email_templates_group_filter')?.toUpperCase()
      if (
        savedGroup &&
        ['ALL', 'INTERVIEW', 'ONBOARDING', 'TASK', 'GENERAL', 'APPLICATIONS'].includes(savedGroup)
      ) {
        setGroupFilter(savedGroup as CategoryFilterGroup)
      }
    }
  }, [searchParams])

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('email_templates_active_tab', tab)
      const currentParams = new URLSearchParams(window.location.search)
      currentParams.set('tab', tab.toLowerCase())
      router.replace('/dashboard/email-templates?' + currentParams.toString(), { scroll: false })
    }
  }

  const handleGroupFilterChange = (group: CategoryFilterGroup) => {
    setGroupFilter(group)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('email_templates_group_filter', group)
      const currentParams = new URLSearchParams(window.location.search)
      if (group === 'ALL') {
        currentParams.delete('group')
      } else {
        currentParams.set('group', group.toLowerCase())
      }
      router.replace('/dashboard/email-templates?' + currentParams.toString(), { scroll: false })
    }
  }

  // Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [cloningId, setCloningId] = useState<string | null>(null)

  const fetchTemplates = useCallback(async (isSilent = false, forceRefresh = false) => {
    try {
      if (!isSilent) setLoading(true)
      const res = await emailTemplatesApi.list(
        {
          limit: 100,
        },
        forceRefresh,
      )
      setTemplates(res?.data || [])
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load email templates')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200)
    return () => clearTimeout(t)
  }, [search])

  // Fetch if cache is empty or incomplete (<= 1 item), otherwise silently re-validate
  useEffect(() => {
    if (activeTab === 'MESSAGES') {
      const cached = emailCache.getTemplates()
      if (!cached || cached.length <= 1) {
        fetchTemplates()
      } else {
        fetchTemplates(true)
      }
    }
  }, [fetchTemplates, activeTab])

  // Subscribe to emailCache for instant reactive updates across app
  useEffect(() => {
    const unsubscribe = emailCache.subscribeTemplates(() => {
      const cached = emailCache.getTemplates()
      if (cached && cached.length > 1) {
        setTemplates(cached)
      } else {
        fetchTemplates(true, true)
      }
    })
    return unsubscribe
  }, [fetchTemplates])

  // Instant optimistic status change
  const handleStatusChange = async (tmpl: EmailTemplate, newStatus: EmailTemplateStatus) => {
    const previousStatus = tmpl.status
    if (previousStatus === newStatus) return

    const updated = { ...tmpl, status: newStatus }
    setTemplates((prev) => {
      const next = prev.map((t) => (t.id === tmpl.id ? updated : t))
      emailCache.setTemplates(next)
      return next
    })

    try {
      await emailTemplatesApi.update(tmpl.id, { status: newStatus })
      toast.success(`"${tmpl.name}" status changed to ${newStatus}`)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status')
      setTemplates((prev) => {
        const next = prev.map((t) => (t.id === tmpl.id ? { ...t, status: previousStatus } : t))
        emailCache.setTemplates(next)
        return next
      })
    }
  }

  // Instant clone
  const handleDuplicate = async (e: React.MouseEvent, tmpl: EmailTemplate) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setCloningId(tmpl.id)
      const duplicated = await emailTemplatesApi.duplicate(tmpl.id)
      toast.success(`Cloned "${duplicated?.name || tmpl.name}"`)
      setTemplates((prev) => {
        const updated = [duplicated, ...prev]
        emailCache.setTemplates(updated)
        return updated
      })
    } catch (err: any) {
      toast.error(err?.message || 'Failed to clone template')
    } finally {
      setCloningId(null)
    }
  }

  // Instant default toggle
  const handleToggleDefault = async (e: React.MouseEvent, tmpl: EmailTemplate) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await emailTemplatesApi.setDefault(tmpl.id)
      toast.success(
        `"${tmpl.name}" is now default for ${CATEGORY_DISPLAY_CONFIG[tmpl.category]?.label || tmpl.category}`,
      )
      setTemplates((prev) => {
        const updated = prev.map((t) => {
          if (t.category === tmpl.category) {
            return { ...t, isDefault: t.id === tmpl.id }
          }
          return t
        })
        emailCache.setTemplates(updated)
        return updated
      })
    } catch (err: any) {
      toast.error(err?.message || 'Failed to set default template')
      fetchTemplates(true, true)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await emailTemplatesApi.delete(deleteTarget.id)
      toast.success(`Deleted "${deleteTarget.name}"`)
      setTemplates((prev) => {
        const updated = prev.filter((t) => t.id !== deleteTarget.id)
        emailCache.setTemplates(updated)
        return updated
      })
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete template')
    } finally {
      setDeleting(false)
    }
  }

  // Instant live search & group & status filtering
  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase()
    return templates.filter((item) => {
      // 1. Group filter
      if (groupFilter === 'INTERVIEW' && !item.category.startsWith('INTERVIEW_')) return false
      if (groupFilter === 'ONBOARDING' && !item.category.startsWith('ONBOARDING_')) return false
      if (groupFilter === 'TASK' && item.category !== 'JOB_TASKS') return false
      if (groupFilter === 'GENERAL' && item.category !== 'GENERAL') return false
      if (groupFilter === 'APPLICATIONS' && item.category !== 'APPLICATIONS') return false

      // 2. Status filter
      if (
        statusFilter &&
        statusFilter !== ('ALL_STATUS' as string) &&
        item.status !== statusFilter
      ) {
        return false
      }

      // 3. Instant search (matches name, subject, category label, or body)
      if (q) {
        const categoryLabel = (CATEGORY_DISPLAY_CONFIG[item.category]?.label || '').toLowerCase()
        const nameMatch = item.name?.toLowerCase().includes(q)
        const subjectMatch = item.subject?.toLowerCase().includes(q)
        const categoryMatch = categoryLabel.includes(q) || item.category.toLowerCase().includes(q)
        const bodyMatch = item.bodyText?.toLowerCase().includes(q)
        if (!nameMatch && !subjectMatch && !categoryMatch && !bodyMatch) {
          return false
        }
      }

      return true
    })
  }, [templates, groupFilter, statusFilter, search])

  const tabCounts = useMemo(() => {
    return {
      ALL: templates.length,
      INTERVIEW: templates.filter((t) => t.category.startsWith('INTERVIEW_')).length,
      ONBOARDING: templates.filter((t) => t.category.startsWith('ONBOARDING_')).length,
      TASK: templates.filter((t) => t.category === 'JOB_TASKS').length,
      APPLICATIONS: templates.filter((t) => t.category === 'APPLICATIONS').length,
      GENERAL: templates.filter((t) => t.category === 'GENERAL').length,
    }
  }, [templates])

  const renderSubjectWithTokens = (subj: string) => {
    const parts = subj.split(/(\{\{\s*[\w.-]+\s*\}\})/g)
    return (
      <span className="truncate text-muted-foreground/90">
        {parts.map((part, i) => {
          if (part.startsWith('{{') && part.endsWith('}}')) {
            return (
              <span
                key={i}
                className="inline-flex items-center px-1 py-0 mx-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-mono text-[10px]"
              >
                {part}
              </span>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </span>
    )
  }

  return (
    <RoleGuard permissions={['email_template.read']} allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <TooltipProvider delayDuration={150}>
        <div className="space-y-4">
          {/* Header without useless icons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
            <div className="flex items-center gap-5">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Email Templates</h1>

              {/* Clean Notion-style Segmented Switch */}
              <div className="flex items-center bg-muted/40 p-0.5 rounded-lg border border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => handleTabChange('MESSAGES')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'MESSAGES'
                      ? 'bg-card text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Messages
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('LAYOUTS')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'LAYOUTS'
                      ? 'bg-card text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Layouts
                </button>
              </div>
            </div>

            {activeTab === 'MESSAGES' && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    emailCache.invalidateTemplates()
                    fetchTemplates(false, true)
                  }}
                  disabled={loading}
                  className="text-xs h-8 gap-1.5 cursor-pointer rounded-lg"
                >
                  <RotateCcw
                    className={`size-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`}
                  />
                  <span>Refresh</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('email_templates_active_tab', 'MESSAGES')
                      sessionStorage.setItem('email_templates_group_filter', groupFilter)
                    }
                    router.push('/dashboard/email-templates/new')
                  }}
                  className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer rounded-lg"
                >
                  <Plus className="size-3.5" />
                  <span>New Message</span>
                </Button>
              </div>
            )}
          </div>

          {/* VIEW: LAYOUTS TAB */}
          {activeTab === 'LAYOUTS' && <EmailLayoutsTab />}

          {/* VIEW: MESSAGES TAB */}
          {activeTab === 'MESSAGES' && (
            <div className="space-y-3.5">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 text-xs">
                {(
                  [
                    { id: 'ALL', label: 'All' },
                    { id: 'INTERVIEW', label: 'Interview' },
                    { id: 'ONBOARDING', label: 'Onboarding' },
                    { id: 'TASK', label: 'Tasks' },
                    { id: 'APPLICATIONS', label: 'Applications' },
                    { id: 'GENERAL', label: 'General' },
                  ] as const
                ).map((tab) => {
                  const count = tabCounts[tab.id]
                  const isActive = groupFilter === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleGroupFilterChange(tab.id)}
                      className={`py-1 px-2.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                        isActive
                          ? 'bg-foreground text-background font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  )
                })}
              </div>

              {/* Search & Status Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages by name or subject..."
                    className="pl-8 pr-7 h-8 text-xs bg-card/60 rounded-lg"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                <div className="w-full sm:w-40">
                  <Select
                    value={statusFilter}
                    onValueChange={(val) => setStatusFilter(val as EmailTemplateStatus | '')}
                  >
                    <SelectTrigger className="h-8 text-xs bg-card/60 rounded-lg">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="ALL_STATUS">All Statuses</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clean, Structured Messages Table */}
              <div className="rounded-xl border border-border/80 bg-card/40 overflow-hidden shadow-xs">
                {loading ? (
                  <div className="py-16 text-center text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
                    <RotateCcw className="size-5 animate-spin text-emerald-500" />
                    <span>Loading messages...</span>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-xs flex flex-col items-center justify-center gap-2.5">
                    <div className="font-semibold text-foreground">No email messages found</div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem('email_templates_active_tab', 'MESSAGES')
                          sessionStorage.setItem('email_templates_group_filter', groupFilter)
                        }
                        router.push('/dashboard/email-templates/new')
                      }}
                      className="text-xs h-7 gap-1 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer mt-1 rounded-md"
                    >
                      <Plus className="size-3" />
                      <span>New Message</span>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/70 text-[11px] font-semibold text-muted-foreground bg-muted/20">
                          <th className="py-2.5 px-4 font-semibold text-center">Template</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Stage</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Layout</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Default</th>
                          <th className="py-2.5 px-4 font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-xs">
                        {filteredTemplates.map((tmpl) => {
                          const categoryConfig = CATEGORY_DISPLAY_CONFIG[tmpl.category]
                          const isCloning = cloningId === tmpl.id

                          return (
                            <tr key={tmpl.id} className="group hover:bg-muted/20 transition-colors">
                              {/* 1. Template Name & Subject */}
                              <td className="py-3 px-4 min-w-[220px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (typeof window !== 'undefined') {
                                      sessionStorage.setItem(
                                        'email_templates_active_tab',
                                        'MESSAGES',
                                      )
                                      sessionStorage.setItem(
                                        'email_templates_group_filter',
                                        groupFilter,
                                      )
                                    }
                                    router.push(`/dashboard/email-templates/${tmpl.id}`)
                                  }}
                                  className="font-medium text-xs text-foreground hover:text-emerald-500 transition-colors truncate block text-left cursor-pointer"
                                >
                                  {tmpl.name}
                                </button>
                                <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                  {renderSubjectWithTokens(tmpl.subject)}
                                </div>
                              </td>

                              {/* 2. Stage */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="text-xs text-foreground font-medium">
                                  {categoryConfig?.label || tmpl.category}
                                </span>
                              </td>

                              {/* 3. Layout */}
                              <td className="py-3 px-3 whitespace-nowrap text-muted-foreground text-xs">
                                {tmpl.layout?.name || 'System Default'}
                              </td>

                              {/* 4. Status */}
                              <td className="py-3 px-3 whitespace-nowrap text-center">
                                <Select
                                  value={tmpl.status}
                                  onValueChange={(val) =>
                                    handleStatusChange(tmpl, val as EmailTemplateStatus)
                                  }
                                >
                                  <SelectTrigger
                                    className={`h-6 text-[10px] font-semibold px-2 py-0 border rounded-full cursor-pointer transition-all inline-flex items-center justify-between gap-1 w-24 mx-auto ${
                                      tmpl.status === 'PUBLISHED'
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'
                                        : tmpl.status === 'DRAFT'
                                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
                                          : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                                    }`}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="text-xs">
                                    <SelectItem value="PUBLISHED">Published</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>

                              {/* 5. Default */}
                              <td className="py-3 px-3 whitespace-nowrap text-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleDefault(e, tmpl)}
                                      className={`p-1.5 rounded-full transition-all cursor-pointer inline-flex items-center justify-center ${
                                        tmpl.isDefault
                                          ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                                          : 'text-muted-foreground/30 hover:text-amber-400 hover:bg-amber-400/10'
                                      }`}
                                      aria-label={
                                        tmpl.isDefault ? 'Default template' : 'Set as default'
                                      }
                                    >
                                      <Star
                                        className={`size-4 ${
                                          tmpl.isDefault
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'fill-none stroke-current'
                                        }`}
                                      />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    {tmpl.isDefault
                                      ? 'Default template for this stage'
                                      : 'Click to set as stage default'}
                                  </TooltipContent>
                                </Tooltip>
                              </td>

                              {/* 6. Actions */}
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPreviewTemplate(tmpl)}
                                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
                                      >
                                        <Eye className="size-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      Preview
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleDuplicate(e, tmpl)}
                                        disabled={isCloning}
                                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
                                      >
                                        {isCloning ? (
                                          <RotateCcw className="size-3.5 animate-spin" />
                                        ) : (
                                          <Copy className="size-3.5" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      Clone
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          if (typeof window !== 'undefined') {
                                            sessionStorage.setItem(
                                              'email_templates_active_tab',
                                              'MESSAGES',
                                            )
                                            sessionStorage.setItem(
                                              'email_templates_group_filter',
                                              groupFilter,
                                            )
                                          }
                                          router.push(`/dashboard/email-templates/${tmpl.id}`)
                                        }}
                                        className="h-7 px-2 text-xs text-muted-foreground hover:text-emerald-500 cursor-pointer rounded-md"
                                      >
                                        <Edit className="size-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      Edit
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeleteTarget(tmpl)}
                                        className="h-7 px-2 text-xs text-muted-foreground hover:text-rose-500 cursor-pointer rounded-md"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      Delete
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Standalone Preview Modal */}
          <EmailPreviewModal
            isOpen={Boolean(previewTemplate)}
            onClose={() => setPreviewTemplate(null)}
            template={previewTemplate}
          />

          {/* Delete Modal */}
          {deleteTarget && (
            <Dialog
              open={Boolean(deleteTarget)}
              onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
              <DialogContent className="max-w-md text-xs rounded-xl border border-border/80">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-foreground">
                    Delete Email Message?
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Are you sure you want to delete &ldquo;<strong>{deleteTarget.name}</strong>
                    &rdquo;? This message will be permanently removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    className="text-xs cursor-pointer rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs gap-1.5 cursor-pointer rounded-lg"
                  >
                    <Trash2 className="size-3.5" />
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </TooltipProvider>
    </RoleGuard>
  )
}

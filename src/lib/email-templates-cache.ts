import type { EmailTemplate, EmailLayout } from '@/types/email-template'

let cachedTemplates: EmailTemplate[] | null = null
let cachedLayouts: EmailLayout[] | null = null

type CacheListener = () => void
const templateListeners = new Set<CacheListener>()
const layoutListeners = new Set<CacheListener>()

function notifyTemplateListeners() {
  templateListeners.forEach((fn) => {
    try {
      fn()
    } catch {
      // silent
    }
  })
}

function notifyLayoutListeners() {
  layoutListeners.forEach((fn) => {
    try {
      fn()
    } catch {
      // silent
    }
  })
}

export const emailCache = {
  getTemplates: (): EmailTemplate[] | null => cachedTemplates,
  setTemplates: (data: EmailTemplate[]) => {
    cachedTemplates = data
    notifyTemplateListeners()
  },
  updateTemplate: (updated: EmailTemplate) => {
    if (cachedTemplates && cachedTemplates.length > 1) {
      let found = false
      cachedTemplates = cachedTemplates.map((t) => {
        if (t.id === updated.id) {
          found = true
          return { ...t, ...updated }
        }
        return t
      })
      if (found) {
        notifyTemplateListeners()
        return
      }
    }
    // Invalidate cache if not fully loaded so next list fetch pulls complete catalog
    cachedTemplates = null
    notifyTemplateListeners()
  },
  addTemplate: (newItem: EmailTemplate) => {
    if (cachedTemplates && cachedTemplates.length > 1) {
      cachedTemplates = [newItem, ...cachedTemplates.filter((t) => t.id !== newItem.id)]
      notifyTemplateListeners()
      return
    }
    cachedTemplates = null
    notifyTemplateListeners()
  },
  removeTemplate: (id: string) => {
    if (cachedTemplates) {
      cachedTemplates = cachedTemplates.filter((t) => t.id !== id)
      notifyTemplateListeners()
    }
  },
  invalidateTemplates: () => {
    cachedTemplates = null
    notifyTemplateListeners()
  },
  subscribeTemplates: (listener: CacheListener) => {
    templateListeners.add(listener)
    return () => {
      templateListeners.delete(listener)
    }
  },

  getLayouts: (): EmailLayout[] | null => cachedLayouts,
  setLayouts: (data: EmailLayout[]) => {
    cachedLayouts = data
    notifyLayoutListeners()
  },
  updateLayout: (updated: EmailLayout) => {
    if (cachedLayouts && cachedLayouts.length > 1) {
      let found = false
      cachedLayouts = cachedLayouts.map((l) => {
        if (l.id === updated.id) {
          found = true
          return { ...l, ...updated }
        }
        return l
      })
      if (found) {
        notifyLayoutListeners()
        return
      }
    }
    cachedLayouts = null
    notifyLayoutListeners()
  },
  addLayout: (newItem: EmailLayout) => {
    if (cachedLayouts && cachedLayouts.length > 1) {
      cachedLayouts = [newItem, ...cachedLayouts.filter((l) => l.id !== newItem.id)]
      notifyLayoutListeners()
      return
    }
    cachedLayouts = null
    notifyLayoutListeners()
  },
  removeLayout: (id: string) => {
    if (cachedLayouts) {
      cachedLayouts = cachedLayouts.filter((l) => l.id !== id)
      notifyLayoutListeners()
    }
  },
  invalidateLayouts: () => {
    cachedLayouts = null
    notifyLayoutListeners()
  },
  subscribeLayouts: (listener: CacheListener) => {
    layoutListeners.add(listener)
    return () => {
      layoutListeners.delete(listener)
    }
  },

  invalidateAll: () => {
    cachedTemplates = null
    cachedLayouts = null
    notifyTemplateListeners()
    notifyLayoutListeners()
  },
}

import React from 'react'
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleArrowDown,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Flame,
  Hourglass,
  Layers,
  Link as LinkIcon,
  Loader2,
  MailPlus,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Star,
  Sun,
  Sunset,
  Trash2,
  Users,
  Video,
  X,
  XCircle,
} from 'lucide-react'

export const InterviewIcons = {
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleArrowDown,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Flame,
  Hourglass,
  Layers,
  Link: LinkIcon,
  Loader: Loader2,
  MailPlus,
  More: MoreHorizontal,
  Plus,
  Refresh: RefreshCw,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Star,
  Sun,
  Sunset,
  Trash: Trash2,
  Users,
  Video,
  X,
  XCircle,
}

export type InterviewIconName = keyof typeof InterviewIcons

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  name: InterviewIconName
  className?: string
}

export function InterviewIcon({ name, className, ...props }: DynamicIconProps) {
  const IconComponent = InterviewIcons[name]
  if (!IconComponent) return null
  return <IconComponent className={className} {...props} />
}

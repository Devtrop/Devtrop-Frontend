'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { getUserRoleDisplay, getRoleBadgeColors } from '@/config/roles.config'
import { SettingsSkeleton } from '@/components/dashboard/settings/SettingsSkeleton'
import {
  Settings,
  User,
  Bell,
  Key,
  Camera,
  Mail,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { DashboardFormSkeleton } from '@/components/dashboard/common/DashboardSkeleton'

// ─── Profile Tab ────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user } = useAuth()
  const roleBadgeColors = getRoleBadgeColors(user)
  const dynamicRoleName = getUserRoleDisplay(user)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate from /users/me
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    api
      .getOwnProfile()
      .then((res) => {
        if (cancelled) return
        let profile: import('@/lib/api').UserDetail | null = null
        if (res.user) {
          profile = res.user as import('@/lib/api').UserDetail
        } else if (res.data && typeof res.data === 'object' && 'id' in res.data) {
          profile = res.data as import('@/lib/api').UserDetail
        } else if (
          res.data &&
          typeof res.data === 'object' &&
          'user' in res.data &&
          res.data.user
        ) {
          profile = (res.data as { user: import('@/lib/api').UserDetail }).user
        }
        if (profile) {
          setName(String(profile.name ?? user?.name ?? ''))
          setPhone(String(profile.phone ?? user?.phone ?? ''))
        }
      })
      .catch(() => {
        setName(user?.name ?? '')
        setPhone(user?.phone ?? '')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.name, user?.phone])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.updateOwnProfile({ name: name.trim(), phone: phone.trim() })
      toast.success('Profile updated successfully')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile'
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card/60 overflow-hidden">
        <CardHeader>
          <Skeleton className="h-5 w-36 rounded-none" />
          <Skeleton className="h-3.5 w-64 rounded-none" />
        </CardHeader>
        <CardContent className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-16 rounded-none" />
            <Skeleton className="h-9 w-full rounded-none" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded-none" />
            <Skeleton className="h-9 w-full rounded-none" />
          </div>
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-24 rounded-none" />
            <Skeleton className="h-9 w-full rounded-none" />
          </div>
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-20 rounded-none" />
            <Skeleton className="h-7 w-28 rounded-none" />
          </div>
          <div className="pt-2">
            <Skeleton className="h-9 w-28 rounded-none" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/80 bg-card/60">
      <CardHeader>
        <CardTitle className="text-base font-bold text-foreground">Profile Information</CardTitle>
        <CardDescription className="text-xs">
          Your identity details across the RiseTogether workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-lg">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="text-xs h-9"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1700-000000"
              className="text-xs h-9"
            />
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <Label className="text-xs">Email Address</Label>
            <div className="text-xs text-muted-foreground px-3 py-2 rounded-none border border-border/60 bg-muted/20">
              {user?.email}
              <span className="ml-2 text-[10px] text-amber-400">
                (change email in the Email tab)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <Label className="text-xs">Assigned Role</Label>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-bold border',
                  roleBadgeColors.bg,
                  roleBadgeColors.text,
                  roleBadgeColors.border,
                )}
              >
                <span className={cn('size-2 rounded-full', roleBadgeColors.dot)} />
                {dynamicRoleName}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="gap-2 bg-accent hover:bg-accent text-white cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Avatar Tab ──────────────────────────────────────────────────────────────

function AvatarTab() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [liveAvatarUrl, setLiveAvatarUrl] = useState<string | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Fetch live profile directly from /users/me so we always have the real database avatar
  useEffect(() => {
    let cancelled = false
    setIsLoadingProfile(true)

    api
      .getOwnProfile()
      .then((res) => {
        if (cancelled) return
        const profile = (res.user ||
          (res.data && 'id' in res.data ? res.data : (res.data as { user?: any })?.user) ||
          res) as any
        const url = profile?.avatarUrl || profile?.avatar
        if (url) {
          setLiveAvatarUrl(url)
        }
      })
      .catch(() => {
        // Fall back to current auth session if network fails
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProfile(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.avatarUrl, user?.avatar])

  const activeAvatar = preview || liveAvatarUrl || user?.avatarUrl || user?.avatar

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Strict validation matching backend ImageFilePipe
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid image type. Only JPEG, PNG, and WebP images are allowed.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum allowed size is 5 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleCancelPreview = () => {
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    const file = selectedFile || fileInputRef.current?.files?.[0]
    if (!file) {
      toast.error('Image file is required')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await api.updateOwnAvatar(formData)
      const resData = ((response as any)?.data || response) as {
        avatarUrl?: string
        avatar?: string
        avatarKey?: string
      }
      const newUrl = resData?.avatarUrl || resData?.avatar

      if (newUrl) {
        setLiveAvatarUrl(newUrl)
      }

      toast.success('Avatar updated successfully')
      handleCancelPreview()

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload avatar'
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="border-border/80 bg-card/60">
      <CardHeader>
        <CardTitle className="text-base font-bold text-foreground">Profile Avatar</CardTitle>
        <CardDescription className="text-xs">
          Upload and manage your profile picture.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 max-w-lg">
          <div className="flex items-center gap-5">
            <Avatar className="size-20 ring-2 ring-border">
              {activeAvatar ? (
                <AvatarImage
                  src={activeAvatar}
                  alt={user?.name || 'User'}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-accent text-accent font-bold text-xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 text-xs cursor-pointer"
              >
                <Camera className="size-3.5" />
                Choose New Image
              </Button>
              <p className="text-[11px] text-muted-foreground">JPEG, PNG, or WebP (Max 5 MB)</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {preview && (
            <div className="flex flex-col gap-3 p-3 rounded-none border border-border/80 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground truncate max-w-xs">
                  {selectedFile?.name || 'Selected image'}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={isUploading}
                  onClick={handleUpload}
                  className="gap-2 bg-accent hover:bg-accent text-white cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Uploading to Storage...
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      Save Avatar
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUploading}
                  onClick={handleCancelPreview}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {activeAvatar && !preview && (
            <div className="flex items-center gap-2 text-[11px] text-accent bg-accent-soft border border-accent rounded-none px-3 py-1.5 w-fit">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span>Active profile avatar connected to Cloudflare R2</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Security Tab ────────────────────────────────────────────────────────────

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSaving(true)
    try {
      // Backend only accepts currentPassword and newPassword
      await api.changeOwnPassword({
        currentPassword,
        newPassword,
      })
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to change password'
      toast.error(msg)
      setError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-border/80 bg-card/60">
      <CardHeader>
        <CardTitle className="text-base font-bold text-foreground">Security & Password</CardTitle>
        <CardDescription className="text-xs">
          Change your account password. You will need your current password to confirm.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
          {error && (
            <div className="flex items-center gap-2 rounded-none border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-400">
              <AlertCircle className="size-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Current Password */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="text-xs h-9 pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="text-xs h-9 pr-9"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="text-xs h-9 pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="gap-2 bg-accent hover:bg-accent text-white cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Key className="size-3.5" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Email Tab ───────────────────────────────────────────────────────────────

function EmailTab() {
  const { user } = useAuth()
  const [newEmail, setNewEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSaving(true)
    try {
      await api.changeOwnEmail({ newEmail: newEmail.trim() })
      setEmailSent(true)
      toast.success('Confirmation email sent! Check your inbox.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to request email change'
      toast.error(msg)
      setError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  // ── "Check your inbox" confirmation state ──
  if (emailSent) {
    return (
      <Card className="border-border/80 bg-card/60">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center max-w-sm mx-auto">
          <div className="size-14 rounded-full bg-accent-soft border border-accent flex items-center justify-center">
            <CheckCircle2 className="size-7 text-accent" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">Confirmation email sent!</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We sent a verification link to{' '}
              <span className="font-mono text-accent">{newEmail}</span>. Click the link in that
              email to complete the change.
            </p>
          </div>
          <button
            onClick={() => {
              setEmailSent(false)
              setNewEmail('')
            }}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors flex items-center gap-1"
          >
            Use a different email
            <ArrowRight className="size-3" />
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/80 bg-card/60">
      <CardHeader>
        <CardTitle className="text-base font-bold text-foreground">Change Email Address</CardTitle>
        <CardDescription className="text-xs">
          Update the email address associated with your account. A verification link will be sent to
          the new address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5 max-w-lg">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Current Email</Label>
            <div className="text-xs text-muted-foreground px-3 py-2 rounded-none border border-border/60 bg-muted/20 font-mono">
              {user?.email}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-none border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-400">
                <AlertCircle className="size-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">New Email Address</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@email.com"
                className="text-xs h-9"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="gap-2 bg-accent hover:bg-accent text-white cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="size-3.5" />
                    Send Confirmation Email
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Notifications Tab ───────────────────────────────────────────────────────

function NotificationsTab() {
  return (
    <Card className="border-border/80 bg-card/60">
      <CardHeader>
        <CardTitle className="text-base font-bold text-foreground">Notification Channels</CardTitle>
        <CardDescription className="text-xs">
          Choose how you wish to receive updates and alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[
          {
            title: 'Email Alerts',
            description: 'Receive interview confirmations and reminders via email',
          },
          {
            title: 'In-App Notifications',
            description: 'Show bell badges for slot bookings and score evaluations',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between p-3 rounded-none border border-border/60 bg-muted/20"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">{item.title}</span>
              <span className="text-[11px] text-muted-foreground">{item.description}</span>
            </div>
            <span className="text-xs font-semibold text-accent">Enabled</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Main SettingsView ───────────────────────────────────────────────────────

export function SettingsView() {
  const { user, isLoading: isAuthLoading } = useAuth()
  if (isAuthLoading || !user) {
    return <SettingsSkeleton />
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="size-6 text-accent" />
          Account Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your personal profile, avatar, email, password, and notification preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="flex flex-col gap-6">
        <TabsList className="w-fit bg-muted/40 p-1 border border-border/60 flex-wrap h-auto gap-0.5">
          <TabsTrigger value="profile" className="gap-1.5 text-xs">
            <User className="size-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="avatar" className="gap-1.5 text-xs">
            <Camera className="size-3.5" />
            Avatar
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs">
            <Key className="size-3.5" />
            Password
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5 text-xs">
            <Mail className="size-3.5" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs">
            <Bell className="size-3.5" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="avatar">
          <AvatarTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="email">
          <EmailTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

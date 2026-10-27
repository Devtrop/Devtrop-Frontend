'use client'

import React, { useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RoleGuard } from '@/components/dashboard/RoleGuard'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useUpdateClientVisibility,
  useDeleteClient,
} from '@/lib/query/clients'
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Building2,
  ArrowUpDown,
  Eye,
  EyeOff,
  Upload,
  X,
} from 'lucide-react'
import type { Client, CreateClientDto, UpdateClientDto } from '@/lib/clients'

export function ClientsView() {
  const { data: rawClients, isLoading: loading, isError } = useClients()
  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()
  const visibilityMutation = useUpdateClientVisibility()
  const deleteMutation = useDeleteClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc') // Default: by order ascending

  const [formData, setFormData] = useState<CreateClientDto>({
    name: '',
    order: 0,
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clients = useMemo(() => {
    if (!rawClients || !Array.isArray(rawClients)) return []
    return [...rawClients].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.order - b.order
      }
      return b.order - a.order
    })
  }, [rawClients, sortOrder])

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please select a valid image (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        order: client.order,
      })
      setImagePreview(client.imageUrl)
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        order: clients.length,
      })
      setImagePreview(null)
    }
    setSelectedImage(null)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingClient(null)
    setFormData({ name: '', order: 0 })
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Client name is required')
      return
    }

    if (!editingClient && !selectedImage) {
      toast.error('Client image is required')
      return
    }

    if (editingClient) {
      updateMutation.mutate(
        {
          id: editingClient.id,
          data: formData,
          image: selectedImage || undefined,
        },
        {
          onSuccess: () => {
            handleCloseDialog()
          },
        }
      )
    } else {
      if (!selectedImage) return
      createMutation.mutate(
        {
          data: formData,
          image: selectedImage,
        },
        {
          onSuccess: () => {
            handleCloseDialog()
          },
        }
      )
    }
  }

  const handleToggleVisibility = (client: Client) => {
    visibilityMutation.mutate({
      id: client.id,
      isHidden: !client.isHidden,
    })
  }

  const handleDelete = async () => {
    if (!clientToDelete) return

    deleteMutation.mutate(clientToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setClientToDelete(null)
      },
    })
  }

  const visibleCount = clients.filter((c) => !c.isHidden).length
  const hiddenCount = clients.filter((c) => c.isHidden).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
          <p className="font-semibold text-destructive">Error</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to load clients. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96" />
        </div>
      }
      permissions={['client.read']}
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    >
      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Edit Client' : 'Create Client'}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? 'Update the client details below.'
                : 'Fill in the details to create a new client.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., TechCorp Inc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">
                Client Logo {!editingClient && '*'}
              </Label>
              <div className="space-y-3">
                {imagePreview && (
                  <div className="relative w-full h-32 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={120}
                      height={48}
                      className="object-contain max-h-24"
                      style={{ width: 'auto', height: 'auto', maxHeight: '96px' }}
                    />
                    {selectedImage && (
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        type="button"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full gap-2"
                  >
                    <Upload className="size-4" />
                    {selectedImage
                      ? 'Change Image'
                      : imagePreview
                        ? 'Upload New Image'
                        : 'Upload Image'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported: JPEG, PNG, WebP (max 5MB)
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{clientToDelete?.name}"</span>? This
              action cannot be undone and will also delete the client logo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Clients
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage client logos displayed on the homepage
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSort}
              className="gap-1.5 border-border hover:bg-muted text-xs h-8 px-3"
              title={`Sort by ${sortOrder === 'asc' ? 'descending' : 'ascending'} order`}
            >
              <ArrowUpDown className="size-3.5" />
              <span className="hidden sm:inline">
                {sortOrder === 'asc' ? 'Order ↑' : 'Order ↓'}
              </span>
            </Button>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
            >
              <Plus className="size-4" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Building2 className="size-4 sm:size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  Total Clients
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {clients.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <Eye className="size-4 sm:size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  Visible
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {visibleCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <EyeOff className="size-4 sm:size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  Hidden
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {hiddenCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table & Mobile Cards */}
        {clients.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
              🏢
            </div>
            <h2 className="mt-4 text-base font-semibold text-foreground">
              No clients found
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by adding your first client.
            </p>
            <Button onClick={() => handleOpenDialog()} className="mt-4">
              Add Client
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block rounded-xl border border-border bg-card shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="text-xs min-w-[700px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-20 px-4">Order</TableHead>
                      <TableHead className="w-32 px-4">Logo</TableHead>
                      <TableHead className="min-w-44 px-4">Name</TableHead>
                      <TableHead className="w-24 px-4">Status</TableHead>
                      <TableHead className="w-52 px-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-muted/30">
                        <TableCell className="px-4 py-3">
                          <span className="text-muted-foreground font-medium">
                            {client.order}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="relative w-20 h-10 rounded border border-border bg-muted flex items-center justify-center overflow-hidden">
                            <Image
                              src={client.imageUrl}
                              alt={client.name}
                              width={80}
                              height={32}
                              className="object-contain"
                              style={{ width: 'auto', height: 'auto', maxHeight: '32px', maxWidth: '80px' }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium text-foreground">
                          {client.name}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {client.isHidden ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600">
                              <EyeOff className="size-3" />
                              Hidden
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600">
                              <Eye className="size-3" />
                              Visible
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleVisibility(client)}
                              disabled={visibilityMutation.isPending}
                              className="h-7 gap-1.5 text-xs"
                            >
                              {client.isHidden ? (
                                <>
                                  <Eye className="size-3" />
                                  Show
                                </>
                              ) : (
                                <>
                                  <EyeOff className="size-3" />
                                  Hide
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(client)}
                              className="h-7 gap-1.5 text-xs"
                            >
                              <Edit className="size-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setClientToDelete(client)
                                setDeleteDialogOpen(true)
                              }}
                              className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                            >
                              <Trash2 className="size-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 rounded border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      <Image
                        src={client.imageUrl}
                        alt={client.name}
                        width={64}
                        height={64}
                        className="object-contain"
                        style={{ width: 'auto', height: 'auto', maxHeight: '64px', maxWidth: '64px' }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          #{client.order}
                        </span>
                        {client.isHidden ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600">
                            <EyeOff className="size-3" />
                            Hidden
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600">
                            <Eye className="size-3" />
                            Visible
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-foreground truncate mt-1">
                        {client.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVisibility(client)}
                      disabled={visibilityMutation.isPending}
                      className="flex-1 h-8 gap-1.5 text-xs"
                    >
                      {client.isHidden ? (
                        <>
                          <Eye className="size-3.5" />
                          Show
                        </>
                      ) : (
                        <>
                          <EyeOff className="size-3.5" />
                          Hide
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(client)}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Edit className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setClientToDelete(client)
                        setDeleteDialogOpen(true)
                      }}
                      className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  )
}

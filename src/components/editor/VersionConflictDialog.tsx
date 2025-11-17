'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface VersionConflictDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReload: () => void
  onOverwrite: () => void
  updatedAt?: string
}

export function VersionConflictDialog({
  open,
  onOpenChange,
  onReload,
  onOverwrite,
  updatedAt,
}: VersionConflictDialogProps) {
  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleString()
    : 'recently'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>Version Conflict Detected</DialogTitle>
          </div>
          <DialogDescription className="space-y-3 pt-4">
            <Alert variant="destructive">
              <AlertDescription>
                This catalogue has been modified by another user since you
                started editing.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Last modified:{' '}
              <span className="font-medium">{formattedDate}</span>
            </p>
            <p className="text-sm">
              You can either reload to get the latest version (your changes will
              be lost) or overwrite the changes made by others.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onReload}>
            Reload Latest Version
          </Button>
          <Button variant="destructive" onClick={onOverwrite}>
            Overwrite Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

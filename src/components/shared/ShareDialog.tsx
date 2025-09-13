import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { Check, Copy, Mail, MessageCircle } from 'lucide-react'
import { useState } from 'react'

interface ShareDialogProps {
  shareUrl: string
  catalogueName: string
  children: React.ReactNode
}

export function ShareDialog({ shareUrl, catalogueName, children }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "The catalogue link has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive"
      })
    }
  }

  const handleWhatsAppShare = () => {
    const text = `Check out this catalogue: ${catalogueName}\n${shareUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleEmailShare = () => {
    const subject = `Check out this catalogue: ${catalogueName}`
    const body = `I wanted to share this catalogue with you:\n\n${catalogueName}\n\nView it here: ${shareUrl}`
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl)
  }



  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Share Catalogue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Copy Link Section */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border">
              {shareUrl}
            </div>
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              size="sm"
              className="px-3"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Share Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Share via:</p>
            <div className="grid grid-cols-2 gap-3">
              {/* WhatsApp */}
              <Button
                onClick={handleWhatsAppShare}
                variant="outline"
                className="flex items-center justify-center space-x-2 p-3 h-auto"
              >
                <MessageCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">WhatsApp</span>
              </Button>

              {/* Email */}
              <Button
                onClick={handleEmailShare}
                variant="outline"
                className="flex items-center justify-center space-x-2 p-3 h-auto"
              >
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Email</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
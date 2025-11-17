'use client'
import React, { useState } from 'react'
import {
  HelpCircle,
  Mail,
  Send,
  ChevronRight,
  Phone,
  MessageSquare,
  FileText,
  Video,
  Users,
  Zap,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

const HelpSupportPage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const faqs = [
    {
      id: '1',
      question: 'How do I create my first catalogue?',
      answer:
        'To create your first catalogue, go to your dashboard and click the "Create New Catalogue" button. Choose a template, add your products, and customize the design to match your brand.',
    },
    {
      id: '2',
      question: 'What file formats are supported for product images?',
      answer:
        'We support JPG, PNG, and WebP image formats. For best results, use high-resolution images (at least 1000x1000 pixels) with a maximum file size of 10MB per image.',
    },
    {
      id: '3',
      question: 'How can I export my catalogue as PDF?',
      answer:
        'You can export your catalogue as PDF from the catalogue view page. Click the "Export" button and select "PDF Download". The PDF will be generated and downloaded automatically.',
    },
    {
      id: '4',
      question: 'What are the differences between subscription plans?',
      answer:
        'Free plan allows 1 catalogue with up to 10 products. Monthly and Yearly plans offer unlimited catalogues, products, custom themes, and priority support.',
    },
    {
      id: '5',
      question: 'Can I customize the theme of my catalogue?',
      answer:
        'Yes! Premium subscribers can access our theme customization tools to change colors, fonts, layouts, and add custom branding to match their business identity.',
    },
    {
      id: '6',
      question: 'How do I share my catalogue with customers?',
      answer:
        'You can share your catalogue by copying the public link from your dashboard, or by exporting it as PDF and sending it directly to customers via email.',
    },
  ]

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      alert(
        "Your message has been sent! We'll get back to you within 24 hours."
      )
      setContactForm({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50">
      <div className="ml-24 flex-1">
        <DashboardHeader
          title="Help & Support"
          subtitle="Find answers and get support when you need it"
        />

        <div className="p-8">
          {/* Contact Support */}
          <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
            <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-emerald-200/20 to-teal-200/20 blur-2xl" />
            <CardHeader className="relative pb-4">
              <CardTitle className="text-xl">Contact Support</CardTitle>
              <CardDescription className="text-sm">
                Get help from our expert support team through multiple channels
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Priority Support - Email */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-100 bg-white/30 p-5 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                  <div className="absolute right-3 top-3">
                    <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                      Priority
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                      <Mail className="h-7 w-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">
                          Email Support
                        </h4>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          2h avg
                        </span>
                      </div>
                      <p className="mb-1 text-sm font-medium text-gray-700">
                        hello@catfy.com
                      </p>
                      <p className="text-xs text-gray-600">
                        For urgent issues and account support
                      </p>
                      <p className="mt-1 text-xs font-medium text-emerald-600">
                        Mon-Fri: 9AM-6PM EST
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Chat */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-100 bg-white/30 p-5 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                  <div className="absolute right-3 top-3">
                    <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></div>
                      Online
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                      <MessageSquare className="h-7 w-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">Live Chat</h4>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          Instant
                        </span>
                      </div>
                      <p className="mb-1 text-sm font-medium text-gray-700">
                        Available now
                      </p>
                      <p className="text-xs text-gray-600">
                        Real-time assistance from our experts
                      </p>
                      <p className="mt-1 text-xs font-medium text-blue-600">
                        24/7 availability
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone Support */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-100 bg-white/30 p-5 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                  <div className="absolute right-3 top-3">
                    <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                      Business Hours
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                      <Phone className="h-7 w-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">
                          Phone Support
                        </h4>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                          Premium
                        </span>
                      </div>
                      <p className="mb-1 text-sm font-medium text-gray-700">
                        +1 (555) CAT-FYGO
                      </p>
                      <p className="text-xs text-gray-600">
                        Direct line for enterprise customers
                      </p>
                      <p className="mt-1 text-xs font-medium text-purple-600">
                        Mon-Fri: 9AM-5PM EST
                      </p>
                    </div>
                  </div>
                </div>

                {/* Help Center */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-100 bg-white/30 p-5 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                  <div className="absolute right-3 top-3">
                    <div className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                      Self-Service
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                      <HelpCircle className="h-7 w-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">Help Center</h4>
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          24/7
                        </span>
                      </div>
                      <p className="mb-1 text-sm font-medium text-gray-700">
                        Comprehensive guides & tutorials
                      </p>
                      <p className="text-xs text-gray-600">
                        Find answers instantly with our knowledge base
                      </p>
                      <p className="mt-1 text-xs font-medium text-amber-600">
                        Always available
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time Guarantee */}
              <div className="mt-6 rounded-2xl border-2 border-gray-100 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-gray-200 hover:bg-white/50">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-gray-900">
                      Response Guarantee
                    </h4>
                    <p className="text-sm text-gray-600">
                      We respond to all inquiries within our guaranteed
                      timeframes. Enterprise customers receive priority support
                      with dedicated account managers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="group relative mt-6 overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
            <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-2xl" />
            <CardHeader className="relative pb-4">
              <CardTitle className="text-xl">
                Frequently Asked Questions
              </CardTitle>
              <CardDescription className="text-sm">
                Find quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {faqs.map(faq => (
                  <div
                    key={faq.id}
                    className="overflow-hidden rounded-xl border border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
                  >
                    <button
                      onClick={() =>
                        setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                      }
                      className="flex w-full items-center justify-between p-4 text-left transition-all hover:bg-white/70"
                    >
                      <div className="flex flex-1 items-center gap-3">
                        <h3 className="text-sm font-semibold leading-tight text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                          expandedFAQ === faq.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="border-t border-gray-100/50 bg-white/30 px-4 py-3">
                        <p className="text-xs leading-relaxed text-gray-700">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="group relative mt-6 overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
            <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-purple-200/20 to-pink-200/20 blur-2xl" />
            <CardHeader className="relative pb-4">
              <CardTitle className="text-xl">Resources & Learning</CardTitle>
              <CardDescription className="text-sm">
                Explore tools and resources to master Catfy
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="group/item cursor-pointer rounded-xl border border-gray-100 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Documentation
                      </h4>
                      <p className="text-xs text-gray-500">
                        Complete guides & API docs
                      </p>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-gray-600">
                    Comprehensive documentation for all features, integrations,
                    and best practices.
                  </p>
                  <div className="flex items-center gap-1 text-sm font-medium text-indigo-600">
                    <span>Read Docs</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>

                <div className="group/item cursor-pointer rounded-xl border border-gray-100 p-4 transition-all hover:border-purple-200 hover:bg-purple-50/50">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
                      <Video className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Video Tutorials
                      </h4>
                      <p className="text-xs text-gray-500">
                        Step-by-step video guides
                      </p>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-gray-600">
                    Watch our video series covering everything from basics to
                    advanced techniques.
                  </p>
                  <div className="flex items-center gap-1 text-sm font-medium text-purple-600">
                    <span>Watch Videos</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>

                <div className="group/item cursor-pointer rounded-xl border border-gray-100 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/50">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Community Forum
                      </h4>
                      <p className="text-xs text-gray-500">
                        Connect with other users
                      </p>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-gray-600">
                    Join our community to ask questions, share tips, and learn
                    from fellow users.
                  </p>
                  <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                    <span>Join Community</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>

                <div className="group/item cursor-pointer rounded-xl border border-gray-100 p-4 transition-all hover:border-amber-200 hover:bg-amber-50/50">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        What&apos;s New
                      </h4>
                      <p className="text-xs text-gray-500">
                        Latest features & updates
                      </p>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-gray-600">
                    Stay updated with the latest features, improvements, and bug
                    fixes.
                  </p>
                  <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                    <span>View Changelog</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>

                <div className="group/item cursor-pointer rounded-xl border border-gray-100 p-4 transition-all hover:border-red-200 hover:bg-red-50/50">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-pink-500 shadow-sm">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        System Status
                      </h4>
                      <p className="text-xs text-gray-500">
                        Service availability
                      </p>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-gray-600">
                    Check our system status and see if there are any ongoing
                    incidents.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>All Systems Operational</span>
                  </div>
                </div>

                <div className="group/item cursor-pointer rounded-xl border border-gray-100 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Live Chat</h4>
                      <p className="text-xs text-gray-500">Instant support</p>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-gray-600">
                    Get instant help from our support team during business
                    hours.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Online Now</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="group relative mt-6 overflow-hidden rounded-3xl border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
            <div className="absolute -right-12 -top-12 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-blue-200/20 to-cyan-200/20 blur-2xl" />
            <CardHeader className="relative pb-4">
              <CardTitle className="text-xl">Contact Support</CardTitle>
              <CardDescription className="text-sm">
                Send us a message and we&apos;ll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Name *
                    </label>
                    <input
                      required
                      value={contactForm.name}
                      onChange={e =>
                        setContactForm(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Your full name"
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2.5 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={e =>
                        setContactForm(prev => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="your@email.com"
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2.5 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Subject *
                  </label>
                  <input
                    required
                    value={contactForm.subject}
                    onChange={e =>
                      setContactForm(prev => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Brief description of your issue"
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2.5 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={e =>
                      setContactForm(prev => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Please describe your issue in detail..."
                    className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2.5 text-sm backdrop-blur-sm transition-all duration-200 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] px-6 py-2.5 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-[#5558E3] hover:to-[#1e0f4d] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Message
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HelpSupportPage

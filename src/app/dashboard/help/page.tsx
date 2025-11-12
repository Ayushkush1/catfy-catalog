'use client'

import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  ChevronRight,
  FileText,
  Book,
  Video,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I create my first catalogue?',
    answer:
      'To create your first catalogue, go to your dashboard and click the "Create New Catalogue" button. Choose a template, add your products, and customize the design to match your brand.',
    category: 'Getting Started',
  },
  {
    id: '2',
    question: 'What file formats are supported for product images?',
    answer:
      'We support JPG, PNG, and WebP image formats. For best results, use high-resolution images (at least 1000x1000 pixels) with a maximum file size of 10MB per image.',
    category: 'Products',
  },
  {
    id: '3',
    question: 'How can I export my catalogue as PDF?',
    answer:
      'You can export your catalogue as PDF from the catalogue view page. Click the "Export" button and select "PDF Download". The PDF will be generated and downloaded automatically.',
    category: 'Export',
  },
  {
    id: '4',
    question: 'What are the differences between subscription plans?',
    answer:
      'Free plan allows 1 catalogue with up to 10 products. Monthly and Yearly plans offer unlimited catalogues, products, custom themes, and priority support.',
    category: 'Billing',
  },
  {
    id: '5',
    question: 'Can I customize the theme of my catalogue?',
    answer:
      'Yes! Premium subscribers can access our theme customization tools to change colors, fonts, layouts, and add custom branding to match their business identity.',
    category: 'Customization',
  },
  {
    id: '6',
    question: 'How do I share my catalogue with customers?',
    answer:
      'You can share your catalogue by copying the public link from your dashboard, or by exporting it as PDF and sending it directly to customers via email.',
    category: 'Sharing',
  },
]

const categories = [
  'All',
  'Getting Started',
  'Products',
  'Export',
  'Billing',
  'Customization',
  'Sharing',
]

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(
        "Your message has been sent! We'll get back to you within 24 hours."
      )
      setContactForm({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#E8EAF6]">
      <div className="ml-32 flex-1">
        <DashboardHeader title="Help & Support" subtitle="Find answers and get support when you need it" />

        <div className="p-8">

          {/* Search Bar */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search for help articles, guides, and more..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Live Chat</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Get instant help from our support team
                </p>
                <Button className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C4DE8] text-white">Start Chat</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Email Support</h3>
                <p className="mb-4 text-sm text-gray-600">Send us a detailed message</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    document
                      .getElementById('contact-form')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Send Email
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Phone Support</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Call us during business hours
                </p>
                <Button variant="outline" className="w-full">
                  +1 (555) 123-4567
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>

            {/* Search and Filter */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.map(faq => (
                <Card key={faq.id} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                        <Badge variant="secondary" className="mt-2">
                          {faq.category}
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="py-12 text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-600">
                  No FAQs found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or category filter
                </p>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <Card id="contact-form">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Still need help? Contact us
              </CardTitle>
              <CardDescription className="text-center">
                Send us a message and we&apos;ll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Name *
                    </label>
                    <Input
                      required
                      value={contactForm.name}
                      onChange={e =>
                        setContactForm(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <Input
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
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Subject *
                  </label>
                  <Input
                    required
                    value={contactForm.subject}
                    onChange={e =>
                      setContactForm(prev => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Message *
                  </label>
                  <Textarea
                    required
                    rows={6}
                    value={contactForm.message}
                    onChange={e =>
                      setContactForm(prev => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Please describe your issue in detail..."
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <div className="mt-12 text-center">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Additional Resources
            </h3>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/documentation">
                  <FileText className="mr-2 h-4 w-4" />
                  Documentation
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/pricing">View Pricing Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

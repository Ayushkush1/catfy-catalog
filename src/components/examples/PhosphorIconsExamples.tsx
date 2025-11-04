/**
 * Phosphor Icons Example Component
 * 
 * This file demonstrates various ways to use Phosphor Icons
 * in your React components within the Catfy editor.
 */

import React, { useState } from 'react'
import { IconContext } from '@phosphor-icons/react'
import {
  Heart,
  Star,
  ShoppingCart,
  User,
  Gear,
  Bell,
  MagnifyingGlass,
  Plus,
  Trash,
  PencilLine,
  ArrowRight,
  Check,
  X,
  Image,
  VideoCamera,
  File,
  Folder,
  Upload,
  Download,
  Share,
  Copy,
} from '@phosphor-icons/react'

/**
 * Example 1: Basic Icon Usage
 */
export function BasicIconExample() {
  return (
    <div className="flex gap-4 p-4">
      <Heart size={24} />
      <Star size={24} />
      <ShoppingCart size={24} />
      <User size={24} />
      <Gear size={24} />
    </div>
  )
}

/**
 * Example 2: Different Icon Weights
 */
export function IconWeightsExample() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Thin:</span>
        <Heart size={32} weight="thin" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Light:</span>
        <Heart size={32} weight="light" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Regular:</span>
        <Heart size={32} weight="regular" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Bold:</span>
        <Heart size={32} weight="bold" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Fill:</span>
        <Heart size={32} weight="fill" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Duotone:</span>
        <Heart size={32} weight="duotone" />
      </div>
    </div>
  )
}

/**
 * Example 3: Interactive Icons with State
 */
export function InteractiveIconExample() {
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  return (
    <div className="flex gap-6 p-4">
      {/* Like Button */}
      <button
        onClick={() => setIsLiked(!isLiked)}
        className="group flex flex-col items-center gap-1"
      >
        <Heart
          size={32}
          weight={isLiked ? 'fill' : 'regular'}
          className={`transition-colors duration-200 ${isLiked
              ? 'text-red-500'
              : 'text-gray-400 group-hover:text-red-300'
            }`}
        />
        <span className="text-xs">{isLiked ? 'Liked' : 'Like'}</span>
      </button>

      {/* Favorite Button */}
      <button
        onClick={() => setIsFavorited(!isFavorited)}
        className="group flex flex-col items-center gap-1"
      >
        <Star
          size={32}
          weight={isFavorited ? 'fill' : 'regular'}
          className={`transition-colors duration-200 ${isFavorited
              ? 'text-yellow-500'
              : 'text-gray-400 group-hover:text-yellow-300'
            }`}
        />
        <span className="text-xs">{isFavorited ? 'Favorited' : 'Favorite'}</span>
      </button>

      {/* Cart Button */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          <ShoppingCart size={32} className="text-gray-700" />
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {cartCount}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCartCount(c => Math.max(0, c - 1))}
            className="rounded-md bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
          >
            -
          </button>
          <button
            onClick={() => setCartCount(c => c + 1)}
            className="rounded-md bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Example 4: Icon Buttons with Hover Effects
 */
export function IconButtonsExample() {
  return (
    <div className="flex gap-2 p-4">
      <button className="rounded-lg bg-blue-600 p-3 text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg">
        <Plus size={20} weight="bold" />
      </button>
      <button className="rounded-lg bg-red-600 p-3 text-white transition-all duration-200 hover:bg-red-700 hover:shadow-lg">
        <Trash size={20} weight="bold" />
      </button>
      <button className="rounded-lg bg-green-600 p-3 text-white transition-all duration-200 hover:bg-green-700 hover:shadow-lg">
        <Check size={20} weight="bold" />
      </button>
      <button className="rounded-lg bg-gray-600 p-3 text-white transition-all duration-200 hover:bg-gray-700 hover:shadow-lg">
        <PencilLine size={20} weight="bold" />
      </button>
    </div>
  )
}

/**
 * Example 5: Icon with Text (Common Pattern)
 */
export function IconWithTextExample() {
  return (
    <div className="space-y-3 p-4">
      <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        <Upload size={20} weight="bold" />
        <span>Upload File</span>
      </button>
      <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
        <Download size={20} weight="regular" />
        <span>Download</span>
      </button>
      <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
        <Share size={20} weight="regular" />
        <span>Share</span>
      </button>
    </div>
  )
}

/**
 * Example 6: Search Bar with Icon
 */
export function SearchBarExample() {
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="p-4">
      <div className="relative">
        <MagnifyingGlass
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Example 7: File Type Icons
 */
export function FileTypeIconsExample() {
  const files = [
    { name: 'Document.pdf', icon: File, color: 'text-red-500' },
    { name: 'Image.jpg', icon: Image, color: 'text-blue-500' },
    { name: 'Video.mp4', icon: VideoCamera, color: 'text-purple-500' },
    { name: 'Projects', icon: Folder, color: 'text-yellow-500' },
  ]

  return (
    <div className="space-y-2 p-4">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
        >
          <file.icon size={24} className={file.color} />
          <span className="text-sm">{file.name}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Example 8: Notification Badge
 */
export function NotificationBadgeExample() {
  const [notifications, setNotifications] = useState(3)

  return (
    <div className="p-4">
      <button className="relative rounded-lg border border-gray-300 p-4 hover:bg-gray-50">
        <Bell size={32} weight={notifications > 0 ? 'fill' : 'regular'} />
        {notifications > 0 && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {notifications}
          </span>
        )}
      </button>
      <button
        onClick={() => setNotifications(0)}
        className="mt-3 rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
      >
        Clear Notifications
      </button>
    </div>
  )
}

/**
 * Example 9: Using IconContext for Defaults
 */
export function IconContextExample() {
  return (
    <div className="space-y-4 p-4">
      {/* Without context */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Without IconContext:</h3>
        <div className="flex gap-2">
          <Heart size={24} weight="regular" color="currentColor" />
          <Star size={24} weight="regular" color="currentColor" />
          <User size={24} weight="regular" color="currentColor" />
        </div>
      </div>

      {/* With context */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">With IconContext:</h3>
        <IconContext.Provider
          value={{ size: 24, weight: 'bold', color: '#2563eb' }}
        >
          <div className="flex gap-2">
            <Heart /> {/* Inherits: size=24, weight=bold, color=blue */}
            <Star />
            <User />
          </div>
        </IconContext.Provider>
      </div>
    </div>
  )
}

/**
 * Example 10: Action Menu with Icons
 */
export function ActionMenuExample() {
  const actions = [
    { icon: Copy, label: 'Duplicate', color: 'text-blue-600' },
    { icon: PencilLine, label: 'Edit', color: 'text-green-600' },
    { icon: Share, label: 'Share', color: 'text-purple-600' },
    { icon: Trash, label: 'Delete', color: 'text-red-600' },
  ]

  return (
    <div className="w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
      {actions.map((action, index) => (
        <button
          key={index}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-gray-100"
        >
          <action.icon size={20} className={action.color} />
          <span className="text-sm">{action.label}</span>
          <ArrowRight size={16} className="ml-auto text-gray-400" />
        </button>
      ))}
    </div>
  )
}

/**
 * Complete Demo Component
 */
export function PhosphorIconsDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Phosphor Icons Examples</h1>
          <p className="text-gray-600">
            Comprehensive examples of using Phosphor Icons in React
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">1. Basic Icons</h2>
          <BasicIconExample />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">2. Icon Weights</h2>
          <IconWeightsExample />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">3. Interactive Icons</h2>
          <InteractiveIconExample />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">4. Icon Buttons</h2>
          <IconButtonsExample />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">5. Icons with Text</h2>
          <IconWithTextExample />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">6. Search Bar</h2>
          <SearchBarExample />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">7. File Type Icons</h2>
          <FileTypeIconsExample />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">8. Notification Badge</h2>
          <NotificationBadgeExample />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">9. IconContext</h2>
          <IconContextExample />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">10. Action Menu</h2>
          <ActionMenuExample />
        </div>
      </div>
    </div>
  )
}

export default PhosphorIconsDemo

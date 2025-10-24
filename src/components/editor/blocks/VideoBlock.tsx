'use client'

import React, { useState } from 'react'
import { useNode, UserComponent } from '@craftjs/core'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Play, Upload } from 'lucide-react'

export interface VideoBlockProps {
  src?: string
  type?: 'upload' | 'youtube' | 'vimeo' | 'url'
  width?: string
  height?: string
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  poster?: string
  borderRadius?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  className?: string
}

export const VideoBlock: UserComponent<VideoBlockProps> = ({
  src = '',
  type = 'upload',
  width = '100%',
  height = '300px',
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  poster = '',
  borderRadius = 0,
  marginTop = 0,
  marginBottom = 0,
  marginLeft = 0,
  marginRight = 0,
  className = '',
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode(state => ({
    selected: state.events.selected,
  }))

  const [isPlaying, setIsPlaying] = useState(false)

  const containerStyle: React.CSSProperties = {
    margin: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
    borderRadius: `${borderRadius}px`,
    overflow: 'hidden',
    position: 'relative',
  }

  const videoStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: `${borderRadius}px`,
  }

  // Extract video ID for YouTube and Vimeo
  const getEmbedUrl = (url: string, videoType: string) => {
    if (videoType === 'youtube') {
      const youtubeRegex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = url.match(youtubeRegex)
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}`
      }
    } else if (videoType === 'vimeo') {
      const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/
      const match = url.match(vimeoRegex)
      if (match) {
        return `https://player.vimeo.com/video/${match[1]}?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}`
      }
    }
    return url
  }

  const renderVideo = () => {
    if (!src) {
      return (
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-100"
          style={videoStyle}
        >
          <Upload className="mb-2 h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-500">Add a video</p>
        </div>
      )
    }

    if (type === 'youtube' || type === 'vimeo') {
      return (
        <iframe
          src={getEmbedUrl(src, type)}
          style={videoStyle}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }

    return (
      <video
        src={src}
        style={videoStyle}
        controls={controls}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        Your browser does not support the video tag.
      </video>
    )
  }

  return (
    <div
      ref={ref => {
        if (ref) {
          connect(drag(ref))
        }
      }}
      className={`video-block ${selected ? 'ring-2 ring-blue-500' : ''} ${className}`}
      style={containerStyle}
    >
      {renderVideo()}

      {selected && !src && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-75">
          <div className="text-center">
            <Play className="mx-auto mb-2 h-8 w-8 text-blue-600" />
            <p className="text-sm font-medium text-blue-600">
              Click to configure video
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export const VideoBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as VideoBlockProps,
  }))

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setProp((props: VideoBlockProps) => {
        props.src = url
        props.type = 'upload'
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="video-type">Video Type</Label>
        <Select
          value={props.type}
          onValueChange={(value: string) =>
            setProp(
              (props: VideoBlockProps) =>
                (props.type = value as VideoBlockProps['type'])
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upload">Upload File</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="vimeo">Vimeo</SelectItem>
            <SelectItem value="url">Direct URL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {props.type === 'upload' ? (
        <div>
          <Label htmlFor="video-upload">Upload Video</Label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="video-src">Video URL</Label>
          <Input
            value={props.src}
            onChange={e =>
              setProp((props: VideoBlockProps) => (props.src = e.target.value))
            }
            placeholder={
              props.type === 'youtube'
                ? 'https://www.youtube.com/watch?v=...'
                : props.type === 'vimeo'
                  ? 'https://vimeo.com/...'
                  : 'https://example.com/video.mp4'
            }
            className="mt-1"
          />
        </div>
      )}

      <div>
        <Label htmlFor="video-poster">Poster Image URL (optional)</Label>
        <Input
          value={props.poster}
          onChange={e =>
            setProp((props: VideoBlockProps) => (props.poster = e.target.value))
          }
          placeholder="https://example.com/poster.jpg"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="video-width">Width</Label>
          <Input
            value={props.width}
            onChange={e =>
              setProp(
                (props: VideoBlockProps) => (props.width = e.target.value)
              )
            }
            placeholder="100%, 400px, etc."
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="video-height">Height</Label>
          <Input
            value={props.height}
            onChange={e =>
              setProp(
                (props: VideoBlockProps) => (props.height = e.target.value)
              )
            }
            placeholder="300px, 50vh, etc."
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="border-radius">
          Border Radius: {props.borderRadius}px
        </Label>
        <Slider
          value={[props.borderRadius || 0]}
          onValueChange={([value]) =>
            setProp((props: VideoBlockProps) => (props.borderRadius = value))
          }
          max={50}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="video-controls"
            checked={props.controls}
            onChange={e =>
              setProp(
                (props: VideoBlockProps) => (props.controls = e.target.checked)
              )
            }
            className="rounded"
          />
          <Label htmlFor="video-controls">Show Controls</Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="video-autoplay"
            checked={props.autoplay}
            onChange={e =>
              setProp(
                (props: VideoBlockProps) => (props.autoplay = e.target.checked)
              )
            }
            className="rounded"
          />
          <Label htmlFor="video-autoplay">Autoplay</Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="video-loop"
            checked={props.loop}
            onChange={e =>
              setProp(
                (props: VideoBlockProps) => (props.loop = e.target.checked)
              )
            }
            className="rounded"
          />
          <Label htmlFor="video-loop">Loop</Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="video-muted"
            checked={props.muted}
            onChange={e =>
              setProp(
                (props: VideoBlockProps) => (props.muted = e.target.checked)
              )
            }
            className="rounded"
          />
          <Label htmlFor="video-muted">Muted</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="margin-top">Margin Top: {props.marginTop}px</Label>
          <Slider
            value={[props.marginTop || 0]}
            onValueChange={([value]) =>
              setProp((props: VideoBlockProps) => (props.marginTop = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="margin-bottom">
            Margin Bottom: {props.marginBottom}px
          </Label>
          <Slider
            value={[props.marginBottom || 0]}
            onValueChange={([value]) =>
              setProp((props: VideoBlockProps) => (props.marginBottom = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  )
}
;(VideoBlock as any).craft = {
  props: {
    src: '',
    type: 'upload',
    width: '100%',
    height: '300px',
    autoplay: false,
    controls: true,
    loop: false,
    muted: false,
    poster: '',
    borderRadius: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  related: {
    settings: VideoBlockSettings,
  },
}

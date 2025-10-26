"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei"
import type * as THREE from "three"
import { CollectionItem, Project } from "@/types"
import { ExternalLink } from "lucide-react"
import { CollectionFullscreen } from "./collection-item-fullscreen"

interface CollectionItemViewerProps {
  item: CollectionItem

}

interface ExtendedCollectionItemCardProps extends CollectionItemViewerProps {
  project: Project
  inModal?: boolean
}

interface ExtendedCollectionItemViewerProps extends CollectionItemViewerProps {
  onRequestFullscreen?: () => void
}

function MaximizeButton({ onClick, className }: { onClick?: () => void; className?: string }) {
  const base = "z-10 transition-opacity"
  const defaultClasses = "absolute top-2 right-2 opacity-0 group-hover:opacity-100"
  return (
    <Button size="icon" variant="secondary" className={`${base} ${className ?? defaultClasses}`} onClick={() => onClick?.()}>
      <Maximize2 className="h-4 w-4" />
    </Button>
  )
}

export default function CollectionItemCard({ item, project, inModal }: ExtendedCollectionItemCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const openFullscreen = () => setIsFullscreen(true)
  const closeFullscreen = () => setIsFullscreen(false)

  function renderInline() {
    switch (item.type) {
      case "image":
        return <ImageViewer item={item} onRequestFullscreen={openFullscreen} />
      case "url-link":
        return <UrlLinkViewer item={item} onRequestFullscreen={openFullscreen} />
      case "video":
        return <VideoViewer item={item} onRequestFullscreen={openFullscreen} />
      case "3d-model":
        return <ModelViewer item={item} onRequestFullscreen={openFullscreen} />
      case "game":
        return <GameViewer item={item} onRequestFullscreen={openFullscreen} />
      case "text":
        return <TextViewer item={item} onRequestFullscreen={openFullscreen} />
      case "audio":
        return <AudioViewer item={item} onRequestFullscreen={openFullscreen} />
      default:
        return <div className="text-muted-foreground">Unsupported item type</div>
    }
  }
  

  return (
    <>
      {renderInline()}
      
      {isFullscreen && (
        <CollectionFullscreen item={item} onClose={closeFullscreen} project={project} inModal={inModal} />
      )}
      
    </>
  )
}

function UrlLinkViewer({ item, onRequestFullscreen }: ExtendedCollectionItemViewerProps) {
  // embed state: null = loading, true = allowed, false = blocked
  const [embedAllowed, setEmbedAllowed] = useState<boolean | null>(null)
  const timeoutRef = useRef<number | null>(null)

  // Determine if the link is external or same-host
  const isSameHost = (url: string): boolean => {
    try {
      const linkUrl = new URL(url, window.location.href)
      return linkUrl.hostname === window.location.hostname
    } catch {
      return false
    }
  }

  const handleOpen = () => {
    if (item.path) {
      // Only open in new tab if it's an external link
      if (isSameHost(item.path)) {
        window.location.href = item.path
      } else {
        window.open(item.path, "_blank", "noopener,noreferrer")
      }
    }
  }

  // Helper to determine if thumbnail is a video
  const isVideoThumbnail = (thumbnail?: string): boolean => {
    if (!thumbnail) return false
    const videoExts = ['.mp4', '.mov', '.webm', '.mkv', '.avi']
    return videoExts.some(ext => thumbnail.toLowerCase().endsWith(ext))
  }

  const hasThumbnail = !!item.thumbnail
  const thumbnailIsVideo = isVideoThumbnail(item.thumbnail)

  useEffect(() => {
    // Only set up embed timeout if we don't have a thumbnail
    if (!hasThumbnail) {
      // start a timeout to assume embedding is blocked if iframe doesn't fire onLoad
      // some sites block embedding (X-Frame-Options/CSP) and iframe may never load.
      timeoutRef.current = window.setTimeout(() => {
        setEmbedAllowed(false)
      }, 2000)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [item.path, hasThumbnail])

  const onIframeLoad = () => {
    // iframe loaded successfully, mark embed allowed and clear timeout
    setEmbedAllowed(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  // Render thumbnail if available
  if (hasThumbnail) {
    return (
      <Card className="p-4">
        <div className="relative group cursor-pointer" onClick={handleOpen}>
          <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
            {thumbnailIsVideo ? (
              <video
                src={item.thumbnail}
                className="w-full h-full object-cover"
                autoPlay={item.autoPlay === true}
                loop={item.loop === true}
                muted
                playsInline
              />
            ) : (
              <Image
                src={item.thumbnail || "/placeholder.svg"}
                alt={item.label || "Link preview"}
                width={1600}
                height={900}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Overlay to indicate it's a link */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-background/90 rounded-full p-3">
                  <ExternalLink className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="icon" 
              variant="secondary" 
              className="z-10 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onRequestFullscreen?.()
              }}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          {item.label && <p className="text-sm text-muted-foreground">{item.label}</p>}
        </div>

        <div className="mt-3">
          <ResourceMeta item={item} />
        </div>
      </Card>
    )
  }

  // Fallback to iframe embed when no thumbnail
  return (
    <Card className="p-4">
      <div className="relative group">
        <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
          {embedAllowed === false ? (
            // fallback when embedding is blocked
            <div className="w-full h-full flex items-center justify-center p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Preview not available for this site.</p>
                <div className="flex items-center justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleOpen}>
                    Open link
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // show iframe while loading or when allowed
            <iframe
              src={item.path}
              title={item.label || item.path}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              onLoad={onIframeLoad}
            />
          )}
        </div>

        <div className="absolute top-2 right-2 flex gap-2">
          <Button size="icon" variant="secondary" onClick={handleOpen}>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <MaximizeButton onClick={() => onRequestFullscreen?.()} className="opacity-100 group-hover:opacity-100" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        {item.label && <p className="text-sm text-muted-foreground">{item.label}</p>}
      </div>

      <div className="mt-3">
        <ResourceMeta item={item} />
      </div>
    </Card>
  )
}

function ImageViewer({ item, onRequestFullscreen }: ExtendedCollectionItemViewerProps) {
  return (
    <div className="relative group w-full h-full rounded-lg overflow-hidden md:max-w-10/12 lg:max-w-7/12 md:max-h-5/12 lg:max-h-1/12">

        <Image src={item.path || "/placeholder.svg"} alt={item.label || "Image"} width={1600} height={900} className="w-full h-full object-contain" />

      <MaximizeButton onClick={() => onRequestFullscreen?.()} />


    </div>
  )
}

function VideoViewer({ item, onRequestFullscreen }: ExtendedCollectionItemViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // use thumbnail as poster when provided
  const poster = item.thumbnail || undefined
  
  // Check for autoPlay and loop options
  const shouldAutoPlay = item.autoPlay === true
  const shouldLoop = item.loop === true

  return (
    <div className="relative group">
      <video
        ref={videoRef}
        src={item.path}
        poster={poster}
        className="w-full h-auto rounded-lg"
        controls
        autoPlay={shouldAutoPlay}
        loop={shouldLoop}
        muted={shouldAutoPlay} // Auto-playing videos should be muted by default
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        Your browser does not support the video tag.
      </video>

      <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="secondary" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="secondary" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      <MaximizeButton onClick={() => onRequestFullscreen?.()} />

      <div className="mt-3">
        <ResourceMeta item={item} />
      </div>
    </div>
  )
}

function ModelViewer({ item, onRequestFullscreen }: ExtendedCollectionItemViewerProps) {
  // Check for autoPlay option - if true, start playing animations automatically
  const shouldAutoPlay = item.autoPlay === true
  const [isPlaying, setIsPlaying] = useState(shouldAutoPlay)
  const [hasAnimations, setHasAnimations] = useState(false)

  return (
    <Card className="p-4">
      <div className="relative">
        <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />
            <Suspense fallback={null}>
              <Model3D
                path={item.path}
                isPlaying={isPlaying}
                loop={item.loop === true}
                onAnimationsDetected={(hasAnims) => setHasAnimations(hasAnims)}
              />
            </Suspense>
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          {hasAnimations && (
            <Button size="icon" variant="secondary" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}
          <MaximizeButton onClick={() => onRequestFullscreen?.()} className="opacity-100 group-hover:opacity-100" />
        </div>
      </div>
      {item.label && <p className="text-sm text-muted-foreground mt-2">{item.label}</p>}
      <p className="text-xs text-muted-foreground mt-1">Drag to rotate • Scroll to zoom • Right-click to pan</p>

      <div className="mt-3">
        <ResourceMeta item={item} />
      </div>
    </Card>
  )
}

interface Model3DProps {
  path: string
  isPlaying: boolean
  loop: boolean
  onAnimationsDetected: (hasAnimations: boolean) => void
}

function Model3D({ path, isPlaying, loop, onAnimationsDetected }: Model3DProps) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(path)
  const { actions, names } = useAnimations(animations, group)

  useEffect(() => {
    if (animations && animations.length > 0) {
      onAnimationsDetected(true)
    } else {
      onAnimationsDetected(false)
    }
  }, [animations, onAnimationsDetected])

  useEffect(() => {
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]]
      if (action) {
        action.setLoop(loop ? 2201 : 2200, Infinity) // LoopRepeat : LoopOnce
        if (isPlaying) {
          action.play()
        } else {
          action.stop()
        }
      }
    }
  }, [isPlaying, loop, actions, names])

  return <primitive ref={group} object={scene} />
}

function GameViewer({ item, onRequestFullscreen }: ExtendedCollectionItemViewerProps) {
  return (
    <Card className="p-4">
      <div className="relative group">
        <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
          <iframe
            src={item.path}
            className="w-full h-full border-0"
            title={item.label || "Game"}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        <MaximizeButton onClick={() => onRequestFullscreen?.()} />
      </div>
      <div className="flex items-center justify-between mt-2">
        {item.label && <p className="text-sm text-muted-foreground">{item.label}</p>}
      </div>
      <div className="mt-3">
        <ResourceMeta item={item} />
      </div>
    </Card>
  )
}

function TextViewer({ item, onRequestFullscreen }: ExtendedCollectionItemViewerProps) {
  const [content, setContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(item.path)
      .then((res) => res.text())
      .then((text) => {
        setContent(text)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load text file:", err)
        setContent("Failed to load content")
        setIsLoading(false)
      })
  }, [item.path])

  return (
    <Card className="p-4">
      <div className="relative group">
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : (
          <pre className="whitespace-pre-wrap text-sm font-mono max-h-96 overflow-auto">{content}</pre>
        )}
        <MaximizeButton onClick={() => onRequestFullscreen?.()} />
      </div>

      <div className="flex items-center justify-between mt-2">
        {item.label && <p className="text-sm text-muted-foreground">{item.label}</p>}
      </div>

      <div className="mt-3">
        <ResourceMeta item={item} />
      </div>
    </Card>
  )
}

function AudioViewer({ item, onRequestFullscreen }: ExtendedCollectionItemViewerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Card className="p-4">
      <div className="relative group">
        <audio
        ref={audioRef}
        src={item.path}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
        <MaximizeButton onClick={() => onRequestFullscreen?.()} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {item.label && <p className="text-sm font-medium">{item.label}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="secondary" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="secondary" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
      <div className="mt-3">
        <ResourceMeta item={item} />
      </div>
    </Card>
  )
}

// Fullscreen modal moved to separate component file (CollectionFullscreen). Removed unused local FullscreenModal.

function ResourceMeta({ item }: { item: CollectionItem }) {


  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {item.label}
          {item.summary && <p className="text-xs text-muted-foreground mt-1">{item.summary}</p>}
        </div>
      </div>

      {item.resources && item.resources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.resources.map((r, i) => (
            <a key={r.id || `${r.type}-${i}`} href={r.url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">{r.label || r.type || "Open"}</span>
              </Button>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// Text fullscreen rendering moved to CollectionFullscreen component.

"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei"
import type * as THREE from "three"
import { CollectionItem } from "@/types"
import Image from "next/image"

interface ContentViewerProps {
  item: CollectionItem
}

export function ContentViewer({ item }: ContentViewerProps) {
  switch (item.type) {
    case "image":
      return <ImageContent path={item.path} />
    case "video":
      return <VideoContent item={item} />
    case "3d-model":
      return <ModelContent item={item} />
    case "game":
      return <GameContent path={item.path} />
    case "text":
      return <TextContent path={item.path} />
    case "audio":
      return <AudioContent path={item.path} />
    default:
      return <div className="text-muted-foreground">Unsupported content type</div>
  }
}

function ImageContent({ path }: { path: string }) {
  return (
    <div className="w-full h-full max-w-full max-h-full relative">
      <Image
        src={path || "/placeholder.svg"}
        alt="Content"
        fill
        className="w-full h-full max-w-full max-h-[80vh] object-contain rounded-lg"
      />
    </div>
  )
}

function VideoContent({ item }: { item: CollectionItem }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const shouldAutoPlay = item.autoPlay === true
  const shouldLoop = item.loop === true

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

  return (
    <div className="relative group max-w-full">
      <video
        ref={videoRef}
        src={item.path}
        className="max-w-full max-h-[80vh] rounded-lg"
        controls
        autoPlay={shouldAutoPlay}
        loop={shouldLoop}
        muted={shouldAutoPlay}
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
    </div>
  )
}

function ModelContent({ item }: { item: CollectionItem }) {
  const shouldAutoPlay = item.autoPlay === true
  const shouldLoop = item.loop === true
  const [isPlaying, setIsPlaying] = useState(shouldAutoPlay)
  const [hasAnimations, setHasAnimations] = useState(false)

  return (
    <div className="w-full max-w-4xl aspect-square relative border-2 border-white">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} className="rounded-lg">
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Suspense fallback={null}>
          <Model3D 
            path={item.path} 
            isPlaying={isPlaying} 
            loop={shouldLoop}
            onAnimationsDetected={(hasAnims) => setHasAnimations(hasAnims)} 
          />
        </Suspense>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      {hasAnimations && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-4 right-4"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      )}
      <p className="text-xs text-muted-foreground text-center mt-2">
        Drag to rotate • Scroll to zoom • Right-click to pan
      </p>
    </div>
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

function GameContent({ path }: { path: string }) {
  return (
    <div className="w-full max-w-4xl aspect-video">
      <iframe
        src={path}
        className="w-full h-full border-0 rounded-lg"
        title="Game"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}

function TextContent({ path }: { path: string }) {
  const [content, setContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(path)
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
  }, [path])

  return (
    <Card className="p-6 max-w-4xl w-full">
      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <pre className="whitespace-pre-wrap text-sm font-mono max-h-[70vh] overflow-auto">{content}</pre>
      )}
    </Card>
  )
}

function AudioContent({ path }: { path: string }) {
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
    <Card className="p-8 max-w-2xl w-full">
      <audio
        ref={audioRef}
        src={path}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button size="icon" variant="secondary" className="h-12 w-12" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button size="icon" variant="secondary" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <div className="flex-1 space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

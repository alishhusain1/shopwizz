"use client"

import { useEffect, useState } from "react"
import { Mic, Square } from "lucide-react"

interface VoiceRecordingProps {
  isRecording: boolean
  onToggleRecording: () => void
  onStopRecording: () => void
  className?: string
}

export default function VoiceRecording({
  isRecording,
  onToggleRecording,
  onStopRecording,
  className = "",
}: VoiceRecordingProps) {
  const [audioLevel, setAudioLevel] = useState(0)
  const [pulseIntensity, setPulseIntensity] = useState(1)

  // Simulate audio level changes when recording
  useEffect(() => {
    if (!isRecording) {
      setAudioLevel(0)
      setPulseIntensity(1)
      return
    }

    const interval = setInterval(() => {
      // Simulate varying audio levels
      const newLevel = Math.random() * 0.8 + 0.2 // 0.2 to 1.0
      setAudioLevel(newLevel)
      setPulseIntensity(0.8 + newLevel * 0.4) // 0.8 to 1.2
    }, 150)

    return () => clearInterval(interval)
  }, [isRecording])

  if (!isRecording) {
    return (
      <button
        onClick={onToggleRecording}
        className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
          isRecording
            ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
            : "text-gray-400 hover:text-white hover:bg-gray-700"
        } ${className}`}
        aria-label="Start voice recording"
      >
        <Mic className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer pulsing rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="absolute rounded-full border-2 border-purple-500/30 animate-ping"
          style={{
            width: `${60 + audioLevel * 40}px`,
            height: `${60 + audioLevel * 40}px`,
            animationDuration: "2s",
          }}
        />
        <div
          className="absolute rounded-full border border-purple-400/20 animate-pulse"
          style={{
            width: `${80 + audioLevel * 60}px`,
            height: `${80 + audioLevel * 60}px`,
            animationDuration: "1.5s",
          }}
        />
      </div>

      {/* Main recording circle */}
      <div
        className="relative z-10 rounded-full bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600 shadow-2xl shadow-purple-500/50 transition-all duration-150 flex items-center justify-center cursor-pointer group"
        style={{
          width: `${48 + audioLevel * 16}px`,
          height: `${48 + audioLevel * 16}px`,
          transform: `scale(${pulseIntensity})`,
        }}
        onClick={onStopRecording}
      >
        {/* Inner glow effect */}
        <div
          className="absolute inset-1 rounded-full bg-gradient-to-b from-white/20 to-transparent"
          style={{
            opacity: 0.3 + audioLevel * 0.4,
          }}
        />

        {/* Recording icon */}
        <div className="relative z-10 text-white group-hover:scale-110 transition-transform duration-200">
          <Square className="w-4 h-4 fill-current" />
        </div>

        {/* Audio level indicator bars */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/40 rounded-full transition-all duration-100"
              style={{
                width: "2px",
                height: `${4 + audioLevel * 12 * Math.random()}px`,
                transform: `rotate(${i * 45}deg) translateY(-${20 + audioLevel * 8}px)`,
                opacity: audioLevel > 0.3 ? 0.8 : 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Recording status text */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-purple-400 font-medium animate-pulse">
        Recording...
      </div>
    </div>
  )
}

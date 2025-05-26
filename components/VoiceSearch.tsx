"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, X } from "lucide-react"

interface VoiceSearchProps {
  onTranscript: (transcript: string) => void
  onSearch: (query: string) => void
  className?: string
}

export default function VoiceSearch({ onTranscript, onSearch, className = "" }: VoiceSearchProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcript, setTranscript] = useState("")
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [])

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    setTranscript("")

    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    // TODO: Implement actual voice recording with Web Speech API
    // Simulate voice recognition
    setTimeout(() => {
      if (recordingIntervalRef.current) {
        stopRecording()
        const mockTranscript = "Find me comfortable running shoes under $100"
        setTranscript(mockTranscript)
        onTranscript(mockTranscript)
      }
    }, 3000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  const handleSearch = () => {
    if (transcript.trim()) {
      onSearch(transcript.trim())
    }
  }

  const clearTranscript = () => {
    setTranscript("")
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Recording Interface */}
      <div className="text-center space-y-4">
        {!isRecording ? (
          <>
            <p className="text-gray-400 text-sm mb-4">Tap to start voice search. Describe what you're looking for.</p>
            <button
              onClick={startRecording}
              className="w-20 h-20 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 mx-auto group"
            >
              <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </button>
          </>
        ) : (
          <>
            <p className="text-purple-400 font-medium">Listening...</p>
            <div className="relative mx-auto w-20 h-20">
              {/* Pulsing animation rings */}
              <div className="absolute inset-0 bg-purple-600 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-2 bg-purple-500 rounded-full animate-pulse opacity-50"></div>
              <button
                onClick={stopRecording}
                className="relative w-full h-full bg-purple-600 rounded-full flex items-center justify-center z-10 hover:bg-purple-700 transition-colors"
              >
                <Mic className="w-8 h-8 text-white" />
              </button>
            </div>
            <p className="text-gray-400 text-sm">Recording: {formatTime(recordingTime)}</p>
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Stop Recording
            </button>
          </>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Voice transcript:</span>
            <button onClick={clearTranscript} className="p-1 text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white mb-3">"{transcript}"</p>
          <button
            onClick={handleSearch}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Search with Voice
          </button>
        </div>
      )}
    </div>
  )
}

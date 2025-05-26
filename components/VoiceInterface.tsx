"use client"

import { useEffect, useState } from "react"
import { X, Mic, Send } from "lucide-react"
import VoiceRecording from "./VoiceRecording"

interface VoiceInterfaceProps {
  isOpen: boolean
  onClose: () => void
  onSendMessage: (message: string) => void
}

export default function VoiceInterface({ isOpen, onClose, onSendMessage }: VoiceInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0)
      return
    }

    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true)
      setTranscript("")
      // TODO: Start actual voice recording
    } else {
      handleStopRecording()
    }
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setIsProcessing(true)

    // Simulate processing and transcription
    setTimeout(() => {
      const mockTranscript = "Find me comfortable running shoes under $100"
      setTranscript(mockTranscript)
      setIsProcessing(false)
    }, 2000)
  }

  const handleSendTranscript = () => {
    if (transcript.trim()) {
      onSendMessage(transcript.trim())
      onClose()
    }
  }

  const handleCancel = () => {
    setIsRecording(false)
    setTranscript("")
    setIsProcessing(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-8 right-8 p-3 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Main content */}
        <div className="flex flex-col items-center space-y-8 max-w-md w-full">
          {/* Voice recording visualization */}
          <div className="relative">
            <VoiceRecording
              isRecording={isRecording}
              onToggleRecording={handleToggleRecording}
              onStopRecording={handleStopRecording}
              className="w-32 h-32"
            />

            {/* Background gradient effect */}
            {isRecording && (
              <div className="absolute inset-0 -z-10">
                <div className="w-64 h-64 bg-gradient-radial from-purple-500/20 via-purple-500/10 to-transparent rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* Status and instructions */}
          <div className="text-center space-y-4">
            {!isRecording && !transcript && !isProcessing && (
              <>
                <h2 className="text-2xl font-semibold text-white">Voice Search</h2>
                <p className="text-gray-400">Tap the microphone and tell me what you're looking for</p>
              </>
            )}

            {isRecording && (
              <>
                <h2 className="text-2xl font-semibold text-white">Listening...</h2>
                <p className="text-purple-400 font-mono text-lg">{formatTime(recordingTime)}</p>
                <p className="text-gray-400">Tap the circle to stop recording</p>
              </>
            )}

            {isProcessing && (
              <>
                <h2 className="text-2xl font-semibold text-white">Processing...</h2>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </>
            )}

            {transcript && !isProcessing && (
              <>
                <h2 className="text-2xl font-semibold text-white">Did you say:</h2>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-white text-lg">{transcript}</p>
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          {transcript && !isProcessing && (
            <div className="flex space-x-4 w-full">
              <button
                onClick={handleToggleRecording}
                className="flex-1 px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleSendTranscript}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          )}

          {!transcript && !isRecording && !isProcessing && (
            <button
              onClick={handleToggleRecording}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center space-x-3 text-lg font-medium"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          )}
        </div>

        {/* Ambient background effects */}
        {isRecording && (
          <>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="absolute top-1/2 left-1/6 w-16 h-16 bg-purple-400/10 rounded-full blur-lg animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}
      </div>
    </div>
  )
}

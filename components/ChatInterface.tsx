"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Mic, Settings, Send, Paperclip } from "lucide-react"
import { useAuthModal } from "@/hooks/useAuthModal"
import AuthModals from "./AuthModals"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  onNewSearch: (query: string) => void
  isFullScreen?: boolean
}

export default function ChatInterface({
  messages,
  onSendMessage,
  onNewSearch,
  isFullScreen = false,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isOpen, mode, openModal, closeModal, changeMode } = useAuthModal()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement voice recording
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Implement image processing
      console.log("Image uploaded:", file.name)
    }
  }

  const suggestedQueries = [
    "Find similar products",
    "Show me cheaper alternatives",
    "What's the best value?",
    "Compare top 3 options",
  ]

  if (isFullScreen) {
    return (
      <>
        <div className="bg-gray-800 rounded-lg h-[calc(100vh-200px)] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">SW</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">ShopWizz.ai</h2>
                <p className="text-gray-400 text-sm">Your AI Shopping Assistant</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold text-white mb-4">What can I help you find today?</h3>
                <p className="text-gray-400 mb-8">
                  Ask me anything about products, and I'll help you find the perfect match.
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    "Find me a comfortable office chair under $200",
                    "Show me the best wireless headphones",
                    "I need a laptop for college students",
                    "Find eco-friendly cleaning products",
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => onSendMessage(example)}
                      className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left text-gray-300 hover:text-white transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user" ? "bg-purple-600" : "bg-gray-600"
                    }`}
                  >
                    <span className="text-white text-sm font-bold">{message.type === "user" ? "U" : "SW"}</span>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${
                      message.type === "user" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="text-xs opacity-70 mt-2 block">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Queries */}
          {messages.length > 0 && (
            <div className="px-6 pb-2">
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((query) => (
                  <button
                    key={query}
                    onClick={() => onSendMessage(query)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full text-sm transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything about products..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none pr-20"
                />
                <div className="absolute right-3 bottom-3 flex space-x-2">
                  <button
                    onClick={handleImageUpload}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-600"
                    title="Upload images"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleRecording}
                    className={`p-2 rounded-lg transition-colors ${
                      isRecording ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                    title="Voice recording"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        {/* Auth Modals */}
        <AuthModals isOpen={isOpen} mode={mode} onClose={closeModal} onModeChange={changeMode} />
      </>
    )
  }

  // Regular sidebar chat interface for non-logged in users
  return (
    <>
      <div className="h-full flex flex-col bg-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">SW</span>
            </div>
            <span className="text-white font-medium">ShopWizz.ai</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === "user" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-100"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((query) => (
              <button
                key={query}
                onClick={() => onSendMessage(query)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full text-xs transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700">
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about these products..."
                rows={2}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none pr-20"
              />
              <div className="absolute right-2 bottom-2 flex space-x-1">
                <button
                  onClick={handleImageUpload}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-600"
                  title="Upload images"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleRecording}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isRecording ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Save your search history?</p>
            <button
              onClick={() => openModal("signup")}
              className="text-purple-400 hover:text-purple-300 text-xs underline"
            >
              Sign up
            </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {/* Auth Modals */}
      <AuthModals isOpen={isOpen} mode={mode} onClose={closeModal} onModeChange={changeMode} />
    </>
  )
}

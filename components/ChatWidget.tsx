"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Send, Mic, Settings, ChevronUp, ChevronDown, Paperclip } from "lucide-react"
import { callChatGPT, ChatMessage } from "@/lib/api"

interface ChatWidgetProps {
  onSearch: (query: string) => void
  isLoading: boolean
  isMobile?: boolean
}

export default function ChatWidget({ onSearch, isLoading, isMobile = false }: ChatWidgetProps) {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<{ id: string; type: "user" | "ai"; content: string; timestamp: Date }[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    if (message.trim()) {
      const userMsg = { id: crypto.randomUUID(), type: "user" as const, content: message.trim(), timestamp: new Date() }
      setMessages((prev) => [...prev, userMsg])
      setMessage("")
      setLoading(true)
      try {
        const chatMessages: ChatMessage[] = [...messages, userMsg].map(m => ({ role: m.type === "user" ? "user" : "assistant", content: m.content }))
        const response = await callChatGPT(chatMessages)
        const aiMsg = { id: crypto.randomUUID(), type: "ai" as const, content: response.choices[0].message.content, timestamp: new Date() }
        setMessages((prev) => [...prev, aiMsg])
      } catch (err) {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), type: "ai", content: "Sorry, something went wrong.", timestamp: new Date() }])
      } finally {
        setLoading(false)
      }
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
    // TODO: Implement voice recording with ElevenLabs STT
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

  if (isMobile) {
    return (
      <div className="bg-gray-800 border-t border-gray-700">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">SW</span>
            </div>
            <span className="text-white font-medium">ShopWizz.ai</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Expand chat"
            data-testid="expand-chat"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>

        {/* Chat Messages - always visible, like desktop */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.type === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                <p className="text-sm">{msg.content}</p>
                <span className="text-xs opacity-70 mt-1 block">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Expandable Content (filters/help) */}
        {isExpanded && (
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Existing intro/help text and filters */}
            <div className="bg-purple-900/30 rounded-lg p-3">
              <p className="text-sm text-gray-300">
                I can help you find what you're looking for. Just type or talk to me. Try asking for something specific
                like "Women's yoga pants" or "Men's running shoes"
              </p>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full p-3 bg-gray-700 rounded-lg text-white"
            >
              <span>Filters</span>
              <Settings className="w-4 h-4" />
            </button>

            {showFilters && (
              <div className="space-y-3 p-3 bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="flex-1 px-2 py-1 bg-gray-600 rounded text-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="flex-1 px-2 py-1 bg-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="Any brand"
                    className="w-full px-2 py-1 bg-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-gray-400 mb-2">Save your search history?</p>
              <button className="text-purple-400 hover:text-purple-300 text-sm underline">Sign up</button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type or Talk"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-20"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <button
                  onClick={toggleRecording}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isRecording ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={handleImageUpload}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-600"
                  title="Upload images"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors"
            >
              {isLoading ? "..." : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
    )
  }

  // Desktop Chat Widget
  return (
    <div className="h-full bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">SW</span>
          </div>
          <span className="text-white font-medium">ShopWizz.ai</span>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Chat Messages */}
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.type === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                <p className="text-sm">{msg.content}</p>
                <span className="text-xs opacity-70 mt-1 block">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-purple-900/30 rounded-lg p-4">
          <p className="text-sm text-gray-300">
            I can help you find what you're looking for. Just type or talk to me. Try asking for something specific like
            "Women's yoga pants" or "Men's running shoes"
          </p>
        </div>

        {/* Filters Section */}
        <div className="space-y-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full p-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
          >
            <span>Filters</span>
            <Settings className="w-4 h-4" />
          </button>

          {showFilters && (
            <div className="space-y-3 p-3 bg-gray-700 rounded-lg">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Price Range</label>
                <div className="flex space-x-2">
                  <input type="number" placeholder="Min" className="flex-1 px-3 py-2 bg-gray-600 rounded text-white" />
                  <input type="number" placeholder="Max" className="flex-1 px-3 py-2 bg-gray-600 rounded text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Brand</label>
                <input
                  type="text"
                  placeholder="Any brand"
                  className="w-full px-3 py-2 bg-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Min Rating</label>
                <select className="w-full px-3 py-2 bg-gray-600 rounded text-white">
                  <option value="">Any rating</option>
                  <option value="4">4+ stars</option>
                  <option value="3">3+ stars</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">Save your search history?</p>
          <button className="text-purple-400 hover:text-purple-300 text-sm underline">Sign up</button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type or Talk"
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={toggleRecording}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={handleImageUpload}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-600"
                title="Upload images"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {isLoading ? "Searching..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Settings, Send, Paperclip } from "lucide-react"
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
  const [isAssistantTyping, setIsAssistantTyping] = useState(false)
  const [animatedText, setAnimatedText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isOpen, mode, openModal, closeModal, changeMode } = useAuthModal()
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate assistant typing: show bubble for 1.5s after user sends a message
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].type === "user") {
      setIsAssistantTyping(true)
      const timeout = setTimeout(() => setIsAssistantTyping(false), 1500)
      return () => clearTimeout(timeout)
    } else {
      setIsAssistantTyping(false)
    }
  }, [messages])

  // Typewriter effect for latest AI message
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.type === "ai") {
      setAnimatedText("");
      let i = 0;
      const interval = setInterval(() => {
        setAnimatedText(lastMsg.content.slice(0, i + 1));
        i++;
        if (i >= lastMsg.content.length) {
          clearInterval(interval);
        }
      }, 18); // Adjust speed here (ms per char)
      return () => clearInterval(interval);
    } else {
      setAnimatedText("");
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() || imageBase64) {
      if (imageBase64) {
        onSendMessage({ kind: "image", image: imageBase64, text: inputValue.trim() })
        setImageBase64(null)
        setImagePreviewUrl(null)
      } else {
        onSendMessage({ kind: "text", text: inputValue.trim() })
      }
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
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        setImagePreviewUrl(result)
        // Remove the data:image/...;base64, prefix for backend
        const base64 = result.split(',')[1]
        setImageBase64(base64)
      }
      reader.readAsDataURL(file)
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
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-lg h-[calc(100vh-200px)] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">SW</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">ShopWizz.ai</h2>
                <p className="text-gray-400 text-sm">Your AI Shopping Assistant</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
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
                      className="p-4 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl text-left text-gray-200 hover:text-white transition-colors shadow-md"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, idx) => {
              const isLastAi =
                message.type === "ai" && idx === messages.length - 1;
              return (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-end space-x-3 max-w-[70%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === "user" ? "bg-purple-500/80" : "bg-gray-700/80"
                      } shadow-md`}
                    >
                      <span className="text-white text-sm font-bold">{message.type === "user" ? "U" : "SW"}</span>
                    </div>
                    <div
                      className={`p-4 rounded-2xl shadow-xl ${
                        message.type === "user"
                          ? "bg-gradient-to-br from-purple-500/80 to-purple-700/80 text-white"
                          : "bg-white/10 backdrop-blur-md text-gray-100 border border-white/10"
                      }`}
                    >
                      <p className="text-base leading-relaxed">
                        {isLastAi ? animatedText : message.content}
                        {isLastAi && animatedText.length < message.content.length && <span className="animate-pulse">|</span>}
                      </p>
                      <span className="text-xs opacity-60 mt-2 block">
                        {(() => {
                          const date = typeof message.timestamp === "string"
                            ? new Date(message.timestamp)
                            : message.timestamp;
                          return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Assistant typing bubble */}
            {isAssistantTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-3 max-w-[70%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-700/80 shadow-md">
                    <span className="text-white text-sm font-bold">SW</span>
                  </div>
                  <div className="p-4 rounded-2xl shadow-xl bg-white/10 backdrop-blur-md text-gray-100 border border-white/10 flex items-center gap-2 min-w-[60px]">
                    <span className="block w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]"></span>
                    <span className="block w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span className="block w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Queries */}
          {messages.length > 0 && (
            <div className="px-8 pb-4">
              <div className="flex flex-wrap gap-3">
                {suggestedQueries.map((query) => (
                  <button
                    key={query}
                    onClick={() => onSendMessage(query)}
                    className="px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-gray-200 hover:text-white rounded-full text-sm transition-colors shadow"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-8 border-t border-gray-800 bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything about products..."
                  rows={2}
                  className="w-full px-5 py-4 bg-white/10 backdrop-blur-md border-none rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none pr-16 shadow-lg"
                />
                <div className="absolute right-4 bottom-4 flex space-x-2">
                  <button
                    onClick={handleImageUpload}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    title="Upload images"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  {/* Voice button can be added here if needed */}
                </div>
              </div>

              {imagePreviewUrl && (
                <div className="flex items-center space-x-2 mt-2">
                  <img src={imagePreviewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-gray-500" />
                  <button onClick={() => { setImageBase64(null); setImagePreviewUrl(null); }} className="px-2 py-1 bg-gray-700 text-white rounded-xl">Remove</button>
                </div>
              )}

              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full text-white font-bold transition-colors shadow-lg flex items-center justify-center"
                title="Send"
              >
                <Send className="w-5 h-5" />
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
      <div className="h-full flex flex-col bg-gray-900/80 backdrop-blur-xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600/80 backdrop-blur-md rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">SW</span>
            </div>
            <span className="text-white font-medium">ShopWizz.ai</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, idx) => {
            const isLastAi =
              message.type === "ai" && idx === messages.length - 1;
            return (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl shadow-xl ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-purple-500/80 to-purple-700/80 text-white"
                      : "bg-white/10 backdrop-blur-md text-gray-100 border border-white/10"
                  }`}
                >
                  <p className="text-base leading-relaxed">
                    {isLastAi ? animatedText : message.content}
                    {isLastAi && animatedText.length < message.content.length && <span className="animate-pulse">|</span>}
                  </p>
                  <span className="text-xs opacity-60 mt-2 block">
                    {(() => {
                      const date = typeof message.timestamp === "string"
                        ? new Date(message.timestamp)
                        : message.timestamp;
                      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    })()}
                  </span>
                </div>
              </div>
            );
          })}
          {/* Assistant typing bubble */}
          {isAssistantTyping && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-3 max-w-[70%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-700/80 shadow-md">
                  <span className="text-white text-sm font-bold">SW</span>
                </div>
                <div className="p-4 rounded-2xl shadow-xl bg-white/10 backdrop-blur-md text-gray-100 border border-white/10 flex items-center gap-2 min-w-[60px]">
                  <span className="block w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="block w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="block w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-3">
            {suggestedQueries.map((query) => (
              <button
                key={query}
                onClick={() => onSendMessage(query)}
                className="px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-gray-200 hover:text-white rounded-full text-xs transition-colors shadow"
              >
                {query}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/80 backdrop-blur-xl">
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about these products..."
                rows={2}
                className="w-full px-5 py-4 bg-white/10 backdrop-blur-md border-none rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none pr-16 shadow-lg"
              />
              <div className="absolute right-4 bottom-4 flex space-x-1">
                <button
                  onClick={handleImageUpload}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  title="Upload images"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                {/* Voice button can be added here if needed */}
              </div>
            </div>

            {imagePreviewUrl && (
              <div className="flex items-center space-x-2 mt-2">
                <img src={imagePreviewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-gray-500" />
                <button onClick={() => { setImageBase64(null); setImagePreviewUrl(null); }} className="px-2 py-1 bg-gray-700 text-white rounded-xl">Remove</button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full text-white font-bold transition-colors shadow-lg flex items-center justify-center"
                title="Send"
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

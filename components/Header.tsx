"use client"

import { useState } from "react"
import { Menu, X, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useAuthModal } from "@/hooks/useAuthModal"
import AuthModals from "./AuthModals"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { isOpen, mode, openModal, closeModal, changeMode } = useAuthModal()

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMenuOpen(false)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SW</span>
            </div>
            <span className="text-xl font-bold text-white">ShopWizz.ai</span>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="hidden md:block text-sm text-gray-300">Welcome, {user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md text-gray-200 hover:text-white hover:bg-white/20 rounded-full shadow transition-all duration-150 font-medium hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:block">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openModal("signin")}
                  className="hidden md:block px-5 py-2 bg-white/10 backdrop-blur-md text-gray-200 hover:text-white hover:bg-white/20 rounded-full shadow transition-all duration-150 font-medium hover:scale-105"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openModal("signup")}
                  className="hidden md:block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow font-bold transition-all duration-150 hover:scale-105"
                >
                  Sign Up
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 bg-white/10 backdrop-blur-md text-gray-200 hover:text-white hover:bg-white/20 rounded-full shadow transition-all duration-150 hover:scale-110"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
            <div className="flex flex-col space-y-4 mt-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-300">Welcome, {user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md text-gray-200 hover:text-white hover:bg-white/20 rounded-full shadow transition-all duration-150 font-medium hover:scale-105"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      openModal("signin")
                      setIsMenuOpen(false)
                    }}
                    className="text-left px-5 py-2 bg-white/10 backdrop-blur-md text-gray-200 hover:text-white hover:bg-white/20 rounded-full shadow transition-all duration-150 font-medium hover:scale-105"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      openModal("signup")
                      setIsMenuOpen(false)
                    }}
                    className="text-left px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow font-bold transition-all duration-150 hover:scale-105"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modals */}
      <AuthModals isOpen={isOpen} mode={mode} onClose={closeModal} onModeChange={changeMode} />
    </>
  )
}

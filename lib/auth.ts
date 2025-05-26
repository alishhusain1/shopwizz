import { supabase } from "./supabase"
import type { UserPreferences, SearchHistoryEntry } from "@/types/database"

export interface AuthUser {
  id: string
  email: string
  role: "user" | "admin" | "super_admin"
  preferences: UserPreferences
  searchHistory: SearchHistoryEntry[]
  emailVerified: boolean
}

export async function signUp(email: string, password: string, firstName?: string, lastName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo: `${window.location.origin}/verify-email`,
    },
  })

  if (error) throw error

  // Create user record in our users table
  if (data.user) {
    const { error: insertError } = await supabase.from("users").insert({
      id: data.user.id,
      email: data.user.email!,
      password_hash: "", // Supabase handles password hashing
      role: "user",
      preferences: {},
      search_history: [],
    })

    if (insertError) {
      console.error("Error creating user record:", insertError)
      // Don't throw here as the auth user was created successfully
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userData, error } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching user data:", error)
    return null
  }

  return {
    id: userData.id,
    email: userData.email,
    role: userData.role,
    preferences: userData.preferences || {},
    searchHistory: userData.search_history || [],
    emailVerified: !!user.email_confirmed_at,
  }
}

export async function updateUserPreferences(userId: string, preferences: UserPreferences) {
  const { error } = await supabase
    .from("users")
    .update({
      preferences,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) throw error
}

export async function addSearchToHistory(userId: string, searchEntry: SearchHistoryEntry) {
  // Get current search history
  const { data: userData, error: fetchError } = await supabase
    .from("users")
    .select("search_history")
    .eq("id", userId)
    .single()

  if (fetchError) throw fetchError

  const currentHistory = userData.search_history || []
  const updatedHistory = [searchEntry, ...currentHistory].slice(0, 50) // Keep last 50 searches

  const { error } = await supabase
    .from("users")
    .update({
      search_history: updatedHistory,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) throw error
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}

export async function verifyPasswordResetToken() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  return user
}

export async function resendEmailVerification(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/verify-email`,
    },
  })

  if (error) throw error
}

export async function checkEmailVerification() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    isVerified: !!user?.email_confirmed_at,
    email: user?.email,
  }
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signUp, signIn } from "@/lib/auth"
import { toast } from "sonner"
import Link from "next/link"

interface AuthFormProps {
  mode: "signin" | "signup"
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result
      if (mode === "signup") {
        result = await signUp(email, password)
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        toast.success(mode === "signup" ? "Account created successfully!" : "Signed in successfully!")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {mode === "signup" ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "signup" 
              ? "Enter your details to create your account" 
              : "Enter your email and password to access your account"
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Please wait..." : (mode === "signup" ? "Create Account" : "Sign In")}
            </Button>
            <p className="text-center text-sm text-gray-600">
              {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
              <Link 
                href={mode === "signup" ? "/auth/signin" : "/auth/signup"} 
                className="text-primary font-medium hover:underline"
              >
                {mode === "signup" ? "Sign in" : "Sign up"}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
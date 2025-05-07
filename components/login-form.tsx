'use client'

import * as React from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import { Button } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { Input } from './ui/input'
import { Label } from './ui/label'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const IconEye = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
)

const IconEyeOff = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243"
    />
  </svg>
)

interface PasswordStrengthResult {
  score: number
  level: string
  message: string
  color: string
}

const calculatePasswordStrength = (
  password?: string
): PasswordStrengthResult => {
  if (!password || password.length === 0) {
    return {
      score: 0,
      level: '',
      message: 'Enter a password to check its strength.',
      color: 'bg-gray-300'
    }
  }

  const criteria = {
    length: password.length >= 8,
    lengthSufficient: password.length >= 10,
    lengthStrong: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password)
  }

  let strengthScore = 0
  if (criteria.length) strengthScore++
  if (criteria.uppercase) strengthScore++
  if (criteria.lowercase) strengthScore++
  if (criteria.number) strengthScore++
  if (criteria.specialChar) strengthScore++
  if (criteria.lengthStrong) strengthScore++ // Extra point for very long

  let visualScore = 0
  let level: string
  let color: string
  let message = ''

  const unmetCriteriaMessages: string[] = []

  if (!criteria.length) {
    level = 'Too Weak'
    color = 'bg-red-500'
    visualScore = 0
    unmetCriteriaMessages.push('at least 8 characters')
  } else {
    const varietyCount = [
      criteria.uppercase,
      criteria.lowercase,
      criteria.number,
      criteria.specialChar
    ].filter(Boolean).length

    if (strengthScore <= 2 || varietyCount < 2) {
      level = 'Weak'
      color = 'bg-orange-500'
      visualScore = 1
    } else if (strengthScore <= 3 || varietyCount === 2) {
      level = 'Medium'
      color = 'bg-yellow-500'
      visualScore = 2
    } else if (strengthScore <= 5 || (varietyCount === 3 && criteria.lengthSufficient)) {
      level = 'Strong'
      color = 'bg-lime-500'
      visualScore = 3
    } else {
      level = 'Very Strong'
      color = 'bg-green-500'
      visualScore = 4
    }
  }

  if (!criteria.uppercase) unmetCriteriaMessages.push('an uppercase letter')
  if (!criteria.lowercase) unmetCriteriaMessages.push('a lowercase letter')
  if (!criteria.number) unmetCriteriaMessages.push('a number')
  if (!criteria.specialChar)
    unmetCriteriaMessages.push('a special character (e.g. !@#$)')

  if (password.length > 0) {
    if (visualScore === 0 && !criteria.length) {
      message = `Too Weak. Needs ${unmetCriteriaMessages[0]}.`
      const otherSuggestions = unmetCriteriaMessages.filter(msg => msg !== 'at least 8 characters')
      if (otherSuggestions.length > 0) {
        message += ` Also: ${otherSuggestions.slice(0, 2).join(', ')}.`
      }
    } else if (visualScore < 4 && unmetCriteriaMessages.length > 0) {
      message = `${level}. Consider adding: ${unmetCriteriaMessages.slice(0, 2).join(', ')}.`
    } else if (visualScore === 4) {
      message = 'Very Strong password!'
    } else {
      message = `${level}.`
    }
  } else {
     message = 'Enter a password to check its strength.'
  }


  return {
    score: visualScore,
    level,
    message,
    color
  }
}

const PasswordStrengthMeter: React.FC<{ password?: string }> = React.memo(
  ({ password }) => {
    const strength = calculatePasswordStrength(password)
    const barColor =
      password && password.length > 0 ? strength.color : 'bg-gray-200'

    const getTextColor = (score: number) => {
      if (!password || password.length === 0) return 'text-gray-500'
      if (score === 0) return 'text-red-600'
      if (score === 1) return 'text-orange-600'
      if (score === 2) return 'text-yellow-600'
      if (score === 3) return 'text-lime-600'
      if (score === 4) return 'text-green-600'
      return 'text-gray-500'
    }

    return (
      <div className="mt-2">
        <div className="flex space-x-1 h-2 rounded-full">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`flex-1 rounded-full ${
                password && password.length > 0 && index < strength.score
                  ? barColor
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        {password && password.length > 0 && (
            <p className={`mt-1 text-xs ${getTextColor(strength.score)}`}>
                {strength.message}
            </p>
        )}
        {(!password || password.length === 0) && (
             <p className={`mt-1 text-xs text-gray-500`}>
                {strength.message}
            </p>
        )}
      </div>
    )
  }
)
PasswordStrengthMeter.displayName = 'PasswordStrengthMeter'

interface LoginFormProps extends React.ComponentPropsWithoutRef<'div'> {
  action: 'sign-in' | 'sign-up'
}

export function LoginForm({
  className,
  action = 'sign-in',
  ...props
}: LoginFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const router = useRouter()
  const supabase = React.useMemo(() => createClientComponentClient(), [])

  const [formState, setFormState] = React.useState<{
    email: string
    password: string
  }>({
    email: '',
    password: ''
  })

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormState(prev => ({
        ...prev,
        [name]: value
      }))
    },
    []
  )

  const signIn = React.useCallback(async () => {
    const { email, password } = formState
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return error
  }, [formState, supabase])

  const signUp = React.useCallback(async () => {
    const { email, password } = formState
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback` }
    })

    if (!error && data && !data.session)
      toast.success('Check your inbox to confirm your email address!')
    return error
  }, [formState, supabase])

  const handleOnSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsLoading(true)

      const error = action === 'sign-in' ? await signIn() : await signUp()

      setIsLoading(false)
      if (error) {
        toast.error(error.message)
        return
      }

      if (action === 'sign-in' || (action === 'sign-up' && (await supabase.auth.getSession()).data.session)) {
        router.refresh()
      } else if (action === 'sign-up' && !error) {
        // Toast for email confirmation already handled in signUp
        // No automatic redirect here, user needs to confirm email
      }
    },
    [action, signIn, signUp, router, supabase]
  )

  return (
    <div className={className} {...props}>
      <form onSubmit={handleOnSubmit}>
        <fieldset className="flex flex-col gap-y-4" disabled={isLoading}>
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formState.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={
                  action === 'sign-in' ? 'current-password' : 'new-password'
                }
                value={formState.password}
                onChange={handleInputChange}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {action === 'sign-up' && (
              <PasswordStrengthMeter password={formState.password} />
            )}
          </div>
        </fieldset>

        <div className="mt-4 flex items-center">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <IconSpinner className="mr-2 animate-spin" />}
            {action === 'sign-in' ? 'Sign In' : 'Sign Up'}
          </Button>
          <p className="ml-4 text-sm">
            {action === 'sign-in' ? (
              <>
                Don't have an account?{' '}
                <Link
                  href="/sign-up"
                  className="font-medium text-primary hover:underline"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link
                  href="/sign-in"
                  className="font-medium text-primary hover:underline"
                >
                  Sign In
                </Link>
              </>
            )}
          </p>
        </div>
      </form>
    </div>
  )
}
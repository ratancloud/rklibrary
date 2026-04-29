"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import Image from "next/image"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
})

export default function SignUpForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const { data, error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      })

      if (error || !data?.user) {
        toast.error(error?.message || "Something went wrong.")
        return
      }

      toast.success("Account created successfully!")
      form.reset()
      router.push("/setup")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md rounded-4xl bg-white/80 backdrop-blur-2xl inset-ring-1 inset-ring-gray-200/50 shadow-2xl shadow-gray-200/50 border-0">
      {/* HEADER */}
      <CardHeader className="space-y-6 text-center pt-10 pb-4">
        <div className="flex justify-center">
          <Link
          href="/"
          className="flex items-center py-0.5 gap-2.5 font-bold tracking-tight transition-transform hover:scale-102"
        >
          <Image src="/RKLibrary/Logo.png" alt="RKLibrary Logo" width={150} height={20} className="rounded-full" />
        </Link>
        </div>

        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-950">
            Create an account
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 max-w-xs mx-auto">
            Register to manage students and seat.
          </CardDescription>
        </div>
      </CardHeader>

      {/* FORM */}
      <CardContent className="px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 transition-colors group-focus-within:text-primary" />
                      <Input
                        className="pl-10 h-12 rounded-xl bg-gray-50/50 inset-ring-1 inset-ring-gray-200 focus-visible:bg-white transition-colors text-gray-950"
                        placeholder="John Doe"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 transition-colors group-focus-within:text-primary" />
                      <Input
                        className="pl-10 h-12 rounded-xl bg-gray-50/50 inset-ring-1 inset-ring-gray-200 focus-visible:bg-white transition-colors text-gray-950"
                        placeholder="name@example.com"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 transition-colors group-focus-within:text-primary" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10 h-12 rounded-xl bg-gray-50/50 inset-ring-1 inset-ring-gray-200 focus-visible:bg-white transition-colors text-gray-950"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium rounded-xl shadow-md mt-4 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex justify-center pb-10 pt-4">
        <p className="text-sm text-gray-500 font-medium">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
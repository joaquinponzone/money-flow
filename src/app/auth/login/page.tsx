import AuthForm from "@/components/auth/auth-form";


export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">Enter your email to sign in to your account</p>
      </div>
      <AuthForm />
    </div>
  )
} 
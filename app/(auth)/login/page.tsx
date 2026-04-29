import LoginForm from "@/components/auth/login-form";

export const metadata = {
  title: "Login",
  description: "Login to securely manage student records.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      
      {/* ---------- BACKGROUND DECORATION ---------- */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Soft Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px]" />

        {/* Gradient Glow - Fixed Tailwind Dimensions */}
        <div className="absolute top-0 md:-top-24 h-75 w-75 md:h-125 md:w-125 rounded-full bg-primary/20 blur-[100px] md:blur-[120px]" />
      </div>

      {/* ---------- CONTENT ---------- */}
      <div className="relative w-full max-w-md z-10">
        <LoginForm />
      </div>
      
    </div>
  );
}
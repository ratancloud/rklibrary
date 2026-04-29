import SignUpForm from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up",
  description: "Create an account to manage student records and seat.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      
      {/* ---------- BACKGROUND DECORATION ---------- */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Soft Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px]" />

        {/* Gradient Glow */}
        <div className="absolute top-0 md:-top-24 h-75 w-75 md:h-125 md:w-125 rounded-full bg-primary/20 blur-[100px] md:blur-[120px]" />
      </div>

      {/* ---------- CONTENT ---------- */}
      <div className="relative w-full max-w-md z-10 py-10">
        <SignUpForm />
      </div>
      
    </div>
  );
}
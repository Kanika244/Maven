import LoginForm from "../../components/auth/LoginForm";
import Logo from "../../components/common/Logo";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 items-center gap-16">

        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col gap-6">
          <Logo />

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-slate-900">
              Smarter investing starts here
            </h1>

            <p className="text-slate-500 text-lg leading-relaxed">
              MAVEN uses AI-driven analysis and market intelligence
              to help you make confident investment decisions.
            </p>
          </div>

          {/* subtle visual element */}
          <div className="h-64 w-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200" />
        </div>

        {/* Right Side - Form */}
        <div className="flex justify-center lg:justify-end">
          <LoginForm />
        </div>

      </div>
    </div>
  );
}
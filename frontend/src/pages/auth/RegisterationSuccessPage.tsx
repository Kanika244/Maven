import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import Logo from "../../components/common/Logo";

export default function RegistrationSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Success Icon */}
        <div className="mt-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2
              size={42}
              className="text-emerald-600"
            />
          </div>
        </div>

        {/* Heading */}
        <div className="mt-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            Account Created Successfully
          </h1>

          <p className="mt-3 text-slate-500">
            Welcome to <span className="font-medium">MAVEN</span>.
            <br />
            Your account has been created and your investor profile is
            ready.
          </p>
        </div>

        {/* Summary */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="font-semibold text-slate-900">
            What's next?
          </h2>

          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>✓ Explore your personalized investment dashboard.</li>

            <li>✓ View recommendations based on your risk profile.</li>

            <li>✓ Start building your investment portfolio.</li>
          </ul>
        </div>

        {/* CTA */}
        <Link
          to="/dashboard"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800"
        >
          Go to Dashboard

          <ArrowRight size={18} />
        </Link>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Thank you for choosing MAVEN.
        </p>
      </div>
    </main>
  );
}
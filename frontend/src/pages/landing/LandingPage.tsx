import { Link } from "react-router-dom";
import Logo from "../../components/common/Logo";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6">

        <Logo />

        <h2 className="mt-8 max-w-3xl text-center text-5xl font-semibold tracking-tight text-slate-900">
          AI-powered portfolio intelligence
          <br />
          for smarter investing.
        </h2>

        <p className="mt-6 max-w-xl text-center text-lg leading-8 text-slate-500">
          Personalized recommendations, market insights and explainable AI —
          all in one intelligent wealth management platform.
        </p>

        <div className="mt-12 flex gap-4">
          <Link
            to="/login"
            className="rounded-xl bg-slate-900 px-8 py-3 text-white transition hover:bg-slate-800"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-slate-900 transition hover:bg-slate-100"
          >
            Create Account
          </Link>
        </div>

      </div>
    </main>
  );
}
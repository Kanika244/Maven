import { Link } from "react-router-dom";

export default function LoginCard() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Welcome Back
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Access your intelligent wealth dashboard.
        </p>
      </div>

      {/* Body */}
      <div className="space-y-5 p-6">
        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email Address
          </label>

          <input
            type="email"
            placeholder="name@company.com"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>

            <button className="text-sm text-slate-500 hover:text-slate-900">
              Forgot?
            </button>
          </div>

          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </div>

        {/* Login Button */}
        <button className="w-full rounded-lg bg-slate-900 py-3 font-medium text-white transition hover:bg-slate-800">
          Login to MAVEN
        </button>

        {/* Register */}
        <p className="text-center text-sm text-slate-500">
          New to MAVEN?{" "}
          <Link
            to="/register"
            className="font-medium text-slate-900 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
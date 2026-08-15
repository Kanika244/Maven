import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  IdCard,
  Loader2,
  Mail,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cx } from "@/lib/format";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { OnboardingFlow } from "@/components/auth/OnboardingFlow";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — MAVEN" }] }),
  component: RegisterPage,
});

type StepId = "account" | "personal" | "pan" | "aadhaar";

const STEPS: { id: StepId; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "personal", label: "Personal" },
  { id: "pan", label: "PAN" },
  { id: "aadhaar", label: "Aadhaar" },
];

type VerifyState = "idle" | "verifying" | "verified";

type FormState = {
  email: string;
  password: string;
  confirm: string;
  fullName: string;
  phone: string;
  city: string;
  pan: string;
  panFile: string | null;
  aadhaar: string;
  aadhaarFile: string | null;
};

const initialForm: FormState = {
  email: "",
  password: "",
  confirm: "",
  fullName: "",
  phone: "",
  city: "",
  pan: "",
  panFile: null,
  aadhaar: "",
  aadhaarFile: null,
};

function RegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    const onboardingMode = sessionStorage.getItem("maven_onboarding_mode") === "1";
    sessionStorage.removeItem("maven_onboarding_mode");
    return onboardingMode;
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const current = STEPS[step].id;
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  async function submitProfile() {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        full_name: form.fullName,
        phone: form.phone,
        city: form.city,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail ?? "Could not save your profile");
    }
    setShowOnboarding(true);
  }

  return showOnboarding ? (
    <OnboardingFlow />
  ) : (
    <AuthLayout
      wide
      title="Create your account"
      subtitle="A quick, guided onboarding to personalise MAVEN for you."
    >
      <Stepper step={step} />

      <div className="mt-6">
        {current === "account" && <AccountStep form={form} set={set} onNext={next} />}
        {current === "personal" && (
          <PersonalStep form={form} set={set} onNext={next} onBack={back} />
        )}
        {current === "pan" && <PanStep form={form} set={set} onNext={next} onBack={back} />}
        {current === "aadhaar" && (
          <AadhaarStep form={form} set={set} onBack={back} onSubmit={submitProfile} />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={s.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cx(
                  "grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary/15 text-primary",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cx(
                  "hidden text-[10px] font-medium sm:block",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cx(
                  "mx-1 mb-4 h-0.5 flex-1 rounded-full sm:mx-2",
                  i < step ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepNav({
  onBack,
  nextLabel = "Continue",
  nextDisabled,
}: {
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      {onBack && (
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      )}
      <Button type="submit" className="flex-1" disabled={nextDisabled}>
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

type StepProps = {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onNext: () => void;
  onBack?: () => void;
};

function AccountStep({ form, set, onNext }: StepProps) {
  const [phase, setPhase] = useState<"email" | "otp" | "password">("email");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/send_email_otp", {
        method: "POST",
        body: JSON.stringify({ email: form.email }),
      });
      setPhase("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ email: form.email, otp }),
      });
      setPhase("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/setup-password", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      localStorage.setItem("access_token", loginData.access_token);
      localStorage.setItem("user_name", loginData.name ?? "");
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account");
    } finally {
      setLoading(false);
    }
  }

  if (phase === "email") {
    return (
      <form className="space-y-4" onSubmit={sendCode}>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@example.in"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            We'll send a 6-digit verification code to this email.
          </p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {loading ? "Sending..." : "Send code"}
        </Button>
      </form>
    );
  }

  if (phase === "otp") {
    return (
      <form className="space-y-4" onSubmit={verifyCode}>
        <div className="space-y-2">
          <Label>Enter verification code</Label>
          <p className="text-xs text-muted-foreground">
            Sent to{" "}
            <span className="font-medium text-foreground">{form.email || "your email"}</span>.
          </p>
          <div className="pt-1">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => {
              setPhase("email");
              setError(null);
            }}
          >
            Change email
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={otp.length < 6 || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Verifying..." : "Verify code"}
        </Button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={submitPassword}>
      <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-positive/25 bg-positive/10 px-3 py-1 text-xs font-medium text-positive">
        <BadgeCheck className="h-3.5 w-3.5" /> Email verified
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Set password</Label>
        <Input
          id="password"
          type="password"
          required
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          type="password"
          required
          placeholder="••••••••"
          value={form.confirm}
          onChange={(e) => set("confirm", e.target.value)}
        />
        {form.confirm && form.password !== form.confirm && (
          <p className="text-xs text-negative">Passwords do not match.</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        className="w-full"
        disabled={!form.password || form.password !== form.confirm || loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        {loading ? "Creating account..." : "Continue"}
      </Button>
    </form>
  );
}

function PersonalStep({ form, set, onNext, onBack }: StepProps) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          required
          placeholder="Aarav Sharma"
          value={form.fullName}
          onChange={(e) => set("fullName", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <div className="flex gap-2">
          <span className="inline-flex items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
            +91
          </span>
          <Input
            id="phone"
            required
            inputMode="numeric"
            maxLength={10}
            placeholder="98765 43210"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          placeholder="Mumbai"
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
        />
      </div>
      <StepNav onBack={onBack} nextDisabled={!form.fullName || form.phone.length < 10} />
    </form>
  );
}

function DocVerify({
  icon: Icon,
  docType,
  docLabel,
  fieldLabel,
  placeholder,
  format,
  value,
  onValue,
  file,
  onFile,
  valid,
  onNext,
  onBack,
}: {
  icon: typeof CreditCard;
  docType: "pan" | "aadhaar";
  docLabel: string;
  fieldLabel: string;
  placeholder: string;
  format: (v: string) => string;
  value: string;
  onValue: (v: string) => void;
  file: string | null;
  onFile: (name: string | null) => void;
  valid: boolean;
  onNext: () => void;
  onBack?: () => void;
}) {
  const [state, setState] = useState<VerifyState>(file ? "verified" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [justAutofilled, setJustAutofilled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runVerify = async () => {
    if (!localFile) return;
    setState("verifying");
    setError(null);

    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("doc_type", docType);
    formData.append("file", localFile);

    try {
      const res = await fetch(`${API_BASE_URL}/api/kyc/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? `Could not verify ${docLabel}`);
      }
      const data = await res.json();
      if (data.extracted_id_number) {
        onValue(format(data.extracted_id_number));
        setJustAutofilled(true);
        setTimeout(() => setJustAutofilled(false), 1200);
      }
      setState("verified");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : `Could not verify ${docLabel}`);
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <div className="space-y-2">
        <Label>{fieldLabel}</Label>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onValue(format(e.target.value));
            if (state === "verified") setState("idle");
          }}
          className={cx(
            "transition-colors duration-500",
            justAutofilled && "border-positive ring-2 ring-positive/40 bg-positive/5",
          )}
        />
        <p className="text-xs text-muted-foreground">
          Auto-filled from your upload - double-check it matches your document.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Upload {docLabel} (image or PDF)</Label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cx(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
            file ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/40",
          )}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
            {file ? <Icon className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
          </span>
          <span className="text-sm font-medium">{file ?? `Click to upload ${docLabel}`}</span>
          <span className="text-xs text-muted-foreground">JPG, PNG, or PDF up to 10MB</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setLocalFile(f);
              onFile(f.name);
              setState("idle");
              setError(null);
            }
          }}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {state === "idle" && (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={!localFile}
          onClick={runVerify}
        >
          <ShieldCheck className="h-4 w-4" /> Verify {docLabel}
        </Button>
      )}
      {state === "verifying" && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Reading {docLabel}...
        </div>
      )}
      {state === "verified" && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-positive/25 bg-positive/10 px-4 py-2.5 text-sm font-medium text-positive">
          <BadgeCheck className="h-4 w-4" /> {docLabel} verified successfully
        </div>
      )}

      <StepNav
        onBack={onBack}
        nextLabel="Continue to onboarding"
        nextDisabled={state !== "verified" || !valid}
      />
    </form>
  );
}

function PanStep({ form, set, onNext, onBack }: StepProps) {
  return (
    <DocVerify
      icon={CreditCard}
      docType="pan"
      docLabel="PAN"
      fieldLabel="PAN number"
      placeholder="ABCDE1234F"
      format={(v) =>
        v
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 10)
      }
      value={form.pan}
      onValue={(v) => set("pan", v)}
      file={form.panFile}
      onFile={(n) => set("panFile", n)}
      valid={form.pan.length === 10}
      onNext={onNext}
      onBack={onBack}
    />
  );
}

function AadhaarStep({
  form,
  set,
  onBack,
  onSubmit,
}: Omit<StepProps, "onNext"> & { onSubmit: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <DocVerify
        icon={IdCard}
        docType="aadhaar"
        docLabel="Aadhaar"
        fieldLabel="Aadhaar number"
        placeholder="1234 5678 9012"
        format={(v) => {
          const d = v.replace(/\D/g, "").slice(0, 12);
          return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
        }}
        value={form.aadhaar}
        onValue={(v) => set("aadhaar", v)}
        file={form.aadhaarFile}
        onFile={(n) => set("aadhaarFile", n)}
        valid={form.aadhaar.replace(/\s/g, "").length === 12}
        onNext={async () => {
          setError(null);
          setSaving(true);
          try {
            await onSubmit();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not save your profile");
          } finally {
            setSaving(false);
          }
        }}
        onBack={onBack}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {saving && (
        <p className="text-xs text-muted-foreground">Saving profile and opening onboarding...</p>
      )}
    </div>
  );
}

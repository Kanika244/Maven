import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { inr } from "@/lib/format";
import { PageHeader } from "@/components/maven/primitives";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Investor Profile — MAVEN" }] }),
  component: ProfilePage,
});

type Profile = {
  name: string;
  email: string;
  member_since: string;
  phone: string | null;
  city: string | null;
  risk: string | null;
  goal: string | null;
  horizon: string | null;
  experience: string | null;
  age: number | null;
  annual_income: number | null;
  monthly_expenses: number | null;
  goals: string[];
  investment_horizon: string | null;
  emergency_fund: number | null;
  debt: number | null;
  investment_behaviour: string | null;
  existing_investments: Record<string, unknown>;
  persona_name: string | null;
  investment_style: string | null;
  risk_score: number | null;
};

type Persona = {
  persona_name?: string;
  investment_style?: string;
  risk_category?: string;
  llm_summary?: string;
};

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "M"
  );
}

function display(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Not provided" : String(value);
}

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, onboardingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/profile`, { headers }),
        fetch(`${API_BASE_URL}/api/onboarding/status`, { headers }),
      ]);
      if (!profileRes.ok) throw new Error("Could not load your profile");
      const data: Profile = await profileRes.json();
      setProfile(data);
      setName(data.name || "");
      setPhone(data.phone || "");
      setCity(data.city || "");
      if (onboardingRes.ok) {
        const onboarding = await onboardingRes.json();
        setPersona(onboarding.persona ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function saveProfile() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: name, phone, city }),
      });
      if (!res.ok) throw new Error("Could not save your profile");
      setProfile((current) => (current ? { ...current, name, phone, city } : current));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  if (!profile)
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
        {error || "Profile unavailable"}
      </div>
    );

  const activePersona = persona || {
    persona_name: profile.persona_name,
    investment_style: profile.investment_style,
    risk_category: profile.risk,
    llm_summary: undefined,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Your investor identity"
        title="Investor Profile"
        subtitle="Your account and the financial context captured during onboarding."
        actions={
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{" "}
            {saving ? "Saving..." : "Save changes"}
          </Button>
        }
      />
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-positive/25 bg-positive/10 px-4 py-3 text-sm text-positive">
          <CheckCircle2 className="h-4 w-4" /> Profile changes saved.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/15 text-lg font-semibold text-primary">
                  {initials(name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">{display(name)}</div>
                <div className="text-sm text-muted-foreground">
                  Member since {display(profile.member_since)}
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-muted/30 px-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-phone"
                    className="pl-9"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-city">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-city"
                    className="pl-9"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Investor identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Persona</div>
                <div className="font-medium">{display(activePersona.persona_name)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
              <BriefcaseBusiness className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Investment style</div>
                <div className="font-medium">{display(activePersona.investment_style)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Risk profile</div>
                <div className="font-medium">
                  {display(activePersona.risk_category || profile.risk)}
                  {profile.risk_score != null && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {profile.risk_score}/100
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Financial context</CardTitle>
          <p className="text-xs text-muted-foreground">
            Your answers from the MAVEN onboarding conversation.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Age" value={profile.age != null ? `${profile.age} years` : null} />
          <Info
            label="Annual income"
            value={profile.annual_income != null ? inr(profile.annual_income) : null}
          />
          <Info
            label="Monthly expenses"
            value={profile.monthly_expenses != null ? inr(profile.monthly_expenses) : null}
          />
          <Info
            label="Emergency fund"
            value={profile.emergency_fund != null ? inr(profile.emergency_fund) : null}
          />
          <Info label="Outstanding debt" value={profile.debt != null ? inr(profile.debt) : null} />
          <Info label="Experience" value={profile.experience} />
          <Info label="Investment horizon" value={profile.investment_horizon || profile.horizon} />
          <Info
            label="Goals"
            value={profile.goals?.length ? profile.goals.join(", ") : profile.goal}
          />
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Market behaviour</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="rounded-lg bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              {display(profile.investment_behaviour)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Persona summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {display(activePersona.llm_summary)}
            </p>
            {profile.goals?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.goals.map((goal) => (
                  <Badge key={goal} variant="secondary">
                    {goal}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {Object.keys(profile.existing_investments || {}).length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Existing investments</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(profile.existing_investments).map(([key, value]) => (
              <Info
                key={key}
                label={key.replaceAll("_", " ")}
                value={typeof value === "number" ? inr(value) : String(value)}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/15 p-3">
      <div className="text-xs capitalize text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{display(value)}</div>
    </div>
  );
}

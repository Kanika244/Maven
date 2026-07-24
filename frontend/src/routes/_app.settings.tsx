import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Database, Download, KeyRound, Loader2, Plug, SlidersHorizontal, UserCog } from "lucide-react";
import { PageHeader } from "@/components/maven/primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — MAVEN" }] }),
  component: SettingsPage,
});

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {children}
    </div>
  );
}

const apis = [
  { name: "Market Data Feed (NSE)", status: "Connected", on: true },
  { name: "Broker — Zerodha Kite", status: "Connected", on: true },
  { name: "News & Sentiment API", status: "Connected", on: true },
  { name: "Google Sign-In", status: "Not connected", on: false },
];

function SettingsPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not load your profile");
        const data = await res.json();
        setName(data.name || "");
        setEmail(data.email || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load your profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: name }),
      });
      if (!res.ok) throw new Error("Could not save your profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  }

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  async function handleChangePassword() {
    setPwSaving(true);
    setPwError(null);
    setPwSuccess(false);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail ?? "Could not update password");
      setCurrentPassword("");
      setNewPassword("");
      setPwSuccess(true);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setPwSaving(false);
    }
  }

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExportJson() {
    setExporting(true);
    setExportError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/auth/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not export your data");
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "maven-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Could not export your data");
    } finally {
      setExporting(false);
    }
  }

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "This will permanently delete your account and all associated data. This cannot be undone. Continue?"
    );
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/auth/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not delete your account");

      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_name");
      navigate({ to: "/login" });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete your account");
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Configuration" title="Settings" subtitle="Manage your account, security and platform preferences." />

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs defaultValue="profile">
        <TabsList className="mb-4 flex flex-wrap gap-1">
          <TabsTrigger value="profile"><UserCog className="mr-1.5 h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="security"><KeyRound className="mr-1.5 h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1.5 h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="preferences"><SlidersHorizontal className="mr-1.5 h-4 w-4" /> Preferences</TabsTrigger>
          <TabsTrigger value="apis"><Plug className="mr-1.5 h-4 w-4" /> Connected APIs</TabsTrigger>
          <TabsTrigger value="data"><Database className="mr-1.5 h-4 w-4" /> Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card><CardHeader><CardTitle>Profile Settings</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {loading ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground sm:col-span-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-2"><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input value={email} disabled /></div>
                  <div className="space-y-2"><Label>Language</Label><Input defaultValue="English (India)" /></div>
                  <div className="space-y-2"><Label>Base currency</Label><Input defaultValue="INR (₹)" /></div>
                  <div className="sm:col-span-2">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? "Saving..." : "Save profile"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card><CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border/60">
              <div className="space-y-4 pb-4">
                {pwError && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{pwError}</div>
                )}
                {pwSuccess && (
                  <div className="rounded-md bg-positive/10 px-3 py-2 text-sm text-positive">Password updated successfully.</div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Current password</Label>
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>New password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleChangePassword} disabled={pwSaving || !currentPassword || !newPassword}>
                  {pwSaving ? "Updating..." : "Update password"}
                </Button>
              </div>
              <Row title="Two-factor authentication" desc="Add an extra layer of security with OTP."><Switch defaultChecked /></Row>
              <Row title="Biometric login" desc="Use fingerprint or face unlock on mobile."><Switch /></Row>
              <Row title="Active sessions" desc="Bengaluru · Chrome · this device"><Button variant="outline" size="sm">Sign out all</Button></Row>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card><CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border/60">
              <Row title="AI recommendations" desc="New Buy/Hold/Sell calls for your holdings"><Switch defaultChecked /></Row>
              <Row title="Price alerts" desc="When a holding moves beyond your threshold"><Switch defaultChecked /></Row>
              <Row title="Rebalancing nudges" desc="When allocation drifts from target"><Switch defaultChecked /></Row>
              <Row title="Market news digest" desc="Daily AI-summarised news email"><Switch /></Row>
              <Row title="Weekly portfolio report" desc="Performance summary every Monday"><Switch defaultChecked /></Row>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card><CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border/60">
              <Row title="Explainable recommendations" desc="Always show reasoning with every call"><Switch defaultChecked /></Row>
              <Row title="Show confidence scores" desc="Display AI confidence on cards"><Switch defaultChecked /></Row>
              <Row title="Compact number format" desc="Show ₹ values as Cr / L / K"><Switch defaultChecked /></Row>
              <Row title="Auto-refresh market data" desc="Live updates during market hours"><Switch defaultChecked /></Row>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis">
          <Card><CardHeader><CardTitle>Connected APIs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {apis.map((a) => (
                <div key={a.name} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted"><Plug className="h-4 w-4" /></span>
                    <div>
                      <div className="text-sm font-medium">{a.name}</div>
                      <Badge variant={a.on ? "secondary" : "outline"} className="mt-0.5">{a.status}</Badge>
                    </div>
                  </div>
                  <Button variant={a.on ? "outline" : "default"} size="sm">{a.on ? "Manage" : "Connect"}</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card><CardHeader><CardTitle>Data Export</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Download your portfolio, holdings history and AI recommendation logs.</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline"><Download className="h-4 w-4" /> Export holdings (CSV)</Button>
                <Button variant="outline"><Download className="h-4 w-4" /> Export recommendations (PDF)</Button>
                <Button variant="outline"><Download className="h-4 w-4" /> Full data (JSON)</Button>
              </div>
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div className="text-sm font-medium text-destructive">Delete account</div>
                <p className="mt-1 text-xs text-muted-foreground">Permanently remove your data. This cannot be undone.</p>
                <Button variant="destructive" size="sm" className="mt-3">Delete account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
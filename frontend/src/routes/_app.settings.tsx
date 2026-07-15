import { createFileRoute } from "@tanstack/react-router";
import { Bell, Database, Download, KeyRound, Plug, SlidersHorizontal, UserCog } from "lucide-react";
import { investor } from "@/lib/mock-data";
import { PageHeader } from "@/components/maven/primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  return (
    <div>
      <PageHeader eyebrow="Configuration" title="Settings" subtitle="Manage your account, security and platform preferences." />

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
              <div className="space-y-2"><Label>Display name</Label><Input defaultValue={investor.name} /></div>
              <div className="space-y-2"><Label>Email</Label><Input defaultValue={investor.email} /></div>
              <div className="space-y-2"><Label>Language</Label><Input defaultValue="English (India)" /></div>
              <div className="space-y-2"><Label>Base currency</Label><Input defaultValue="INR (₹)" /></div>
              <div className="sm:col-span-2"><Button>Save profile</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card><CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border/60">
              <div className="grid gap-4 pb-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Current password</Label><Input type="password" defaultValue="password" /></div>
                <div className="space-y-2"><Label>New password</Label><Input type="password" /></div>
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
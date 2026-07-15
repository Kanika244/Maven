import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Target, TrendingUp, Wallet } from "lucide-react";
import { holdings, investor, preferredSectors, withHoldingMetrics } from "@/lib/mock-data";
import { inr } from "@/lib/format";
import { PageHeader } from "@/components/maven/primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cx } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Investor Profile — MAVEN" }] }),
  component: ProfilePage,
});

const allSectors = ["Information Technology", "Financials", "Auto", "Pharma", "FMCG", "Energy", "Metals", "Realty", "Telecom"];
const riskLabels = ["Conservative", "Cautious", "Moderate", "Growth", "Aggressive"];

function ProfilePage() {
  const [risk, setRisk] = useState([3]);
  const [sectors, setSectors] = useState<string[]>(preferredSectors);
  const rows = holdings.map(withHoldingMetrics);

  const toggle = (s: string) =>
    setSectors((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div>
      <PageHeader
        eyebrow="Your investor DNA"
        title="Investor Profile"
        subtitle="MAVEN uses this profile to personalise every recommendation."
        actions={<Button><Save className="h-4 w-4" /> Save Changes</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/20 text-lg font-semibold text-primary">{investor.initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{investor.name}</div>
                <div className="text-sm text-muted-foreground">Member since {investor.memberSince} · {investor.city}</div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Full name</Label><Input defaultValue={investor.name} /></div>
              <div className="space-y-2"><Label>Email</Label><Input defaultValue={investor.email} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input defaultValue="+91 98765 43210" /></div>
              <div className="space-y-2"><Label>City</Label><Input defaultValue={investor.city} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Investment Snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { icon: Target, k: "Primary goal", v: "Wealth creation" },
              { icon: TrendingUp, k: "Risk profile", v: riskLabels[risk[0] - 1] },
              { icon: Wallet, k: "Monthly SIP", v: inr(35000) },
            ].map((m) => (
              <div key={m.k} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <span className="flex items-center gap-2 text-muted-foreground"><m.icon className="h-4 w-4" /> {m.k}</span>
                <span className="font-medium">{m.v}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Goals & Horizon</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary investment goal</Label>
              <Select defaultValue="wealth">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wealth">Long-term wealth creation</SelectItem>
                  <SelectItem value="retirement">Retirement planning</SelectItem>
                  <SelectItem value="income">Regular income</SelectItem>
                  <SelectItem value="tax">Tax-efficient growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Investment horizon</Label>
              <Select defaultValue="long">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short term (&lt; 3 years)</SelectItem>
                  <SelectItem value="medium">Medium term (3–7 years)</SelectItem>
                  <SelectItem value="long">Long term (7+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monthly investment amount (₹)</Label>
              <Input type="number" defaultValue={35000} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Risk Tolerance</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your risk appetite</span>
                <span className="rounded-md bg-primary/12 px-2.5 py-1 text-sm font-semibold text-primary">{riskLabels[risk[0] - 1]}</span>
              </div>
              <Slider value={risk} onValueChange={setRisk} min={1} max={5} step={1} />
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>Conservative</span><span>Aggressive</span>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Preferred sectors</Label>
              <div className="flex flex-wrap gap-2">
                {allSectors.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    className={cx(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      sectors.includes(s) ? "border-primary bg-primary/12 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle>Current Holdings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((h) => (
              <div key={h.symbol} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <div className="text-sm font-medium">{h.symbol}</div>
                  <div className="text-xs text-muted-foreground">{h.qty} shares · {h.sector}</div>
                </div>
                <div className="text-right">
                  <div className="font-num text-sm">{inr(h.current, { compact: true })}</div>
                  <div className={cx("font-num text-xs", h.pnl >= 0 ? "text-positive" : "text-negative")}>
                    {h.pnl >= 0 ? "+" : ""}{h.pnlPct.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
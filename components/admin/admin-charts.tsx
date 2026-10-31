"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatMonth(monthStr: string) {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" }).format(date);
}

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "decimal", maximumFractionDigits: 0 }).format(n) + " F";
}

export function AdminCharts({ usersHistory, revenueHistory }: { usersHistory: any[], revenueHistory: any[] }) {
  const formattedUsers = usersHistory.map(d => ({ ...d, label: formatMonth(d.month) }));
  const formattedRevenue = revenueHistory.map(d => ({ ...d, label: formatMonth(d.month) }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Nouveaux inscrits</CardTitle>
          <CardDescription>Évolution des inscriptions sur les 6 derniers mois.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedUsers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="count" name="Inscriptions" fill="var(--brand)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenus encaissés</CardTitle>
          <CardDescription>Volume des paiements reçus par mois.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={formatFCFA} width={80} />
              <Tooltip 
                contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(value) => [formatFCFA(Number(value ?? 0)), "Total"]}
              />
              <Area type="monotone" dataKey="total" stroke="var(--brand)" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
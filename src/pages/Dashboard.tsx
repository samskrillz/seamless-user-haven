import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>This is your dashboard overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your content will appear here in the next iteration.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
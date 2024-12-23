import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Settings interface will go here */}
            <p>Settings interface to be implemented.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


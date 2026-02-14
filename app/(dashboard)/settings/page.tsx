import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-muted-foreground">Manage your account settings</p>

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settingsEmail">Email</Label>
              <Input
                id="settingsEmail"
                type="email"
                placeholder="your@email.com"
                disabled
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <p className="text-sm text-muted-foreground">
                Language settings will be available in a future update.
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Theme settings will be available in a future update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold">ตั้งค่า</h1>
      <p className="mt-1 text-muted-foreground">จัดการการตั้งค่าบัญชีของคุณ</p>

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>โปรไฟล์</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">ชื่อที่แสดง</Label>
              <Input id="displayName" placeholder="ชื่อของคุณ" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settingsEmail">อีเมล</Label>
              <Input
                id="settingsEmail"
                type="email"
                placeholder="your@email.com"
                disabled
              />
            </div>
            <Button>บันทึกการเปลี่ยนแปลง</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การตั้งค่า</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ภาษา</Label>
              <p className="text-sm text-muted-foreground">
                การตั้งค่าภาษาจะพร้อมใช้งานในอัปเดตถัดไป
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>ธีม</Label>
              <p className="text-sm text-muted-foreground">
                การตั้งค่าธีมจะพร้อมใช้งานในอัปเดตถัดไป
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

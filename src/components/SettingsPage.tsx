import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { User, Bell, Globe, Users, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

export function SettingsPage() {
  const [parentName, setParentName] = useState('Ahmed');
  const [email, setEmail] = useState('ahmed@example.com');
  const [language, setLanguage] = useState('english');
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    progressUpdates: true,
    achievements: true,
    tips: false,
  });

  const children = [
    { id: 1, name: 'Ali', age: 8, avatar: '👦' },
    { id: 2, name: 'Umer', age: 6, avatar: '🧒' },
    { id: 3, name: 'Usman', age: 10, avatar: '👨' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#FFF8E1] to-white min-h-screen pt-20 lg:pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-[#2D5F3F] mb-2 text-2xl sm:text-3xl lg:text-4xl">Settings & Profile</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Parent Profile Section */}
        <Card className="p-4 sm:p-6 rounded-3xl mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-[#A8E6CF]" />
            <h2 className="text-gray-800 text-lg sm:text-xl">Parent Profile</h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#B3E5FC] flex items-center justify-center text-3xl sm:text-4xl">
                👨‍👩‍👧‍👦
              </div>
              <Button variant="outline" className="rounded-xl w-full sm:w-auto">
                Change Photo
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="pst">
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="bg-[#A8E6CF] hover:bg-[#8BD4AE] text-[#2D5F3F] rounded-xl">
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Children Management */}
        <Card className="p-4 sm:p-6 rounded-3xl mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#B3E5FC]" />
              <h2 className="text-gray-800 text-lg sm:text-xl">Manage Children</h2>
            </div>
            <Button className="bg-[#B3E5FC] hover:bg-[#81D4FA] text-[#1E4F6F] rounded-xl w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </div>

          <div className="space-y-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-[#FFF8E1] to-white rounded-2xl border-2 border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#B3E5FC] flex items-center justify-center text-2xl">
                    {child.avatar}
                  </div>
                  <div>
                    <p className="text-gray-800">{child.name}</p>
                    <p className="text-sm text-gray-600">{child.age} years old</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-4 sm:p-6 rounded-3xl mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFE082]" />
            <h2 className="text-gray-800 text-lg sm:text-xl">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-gray-800">Daily Reminders</p>
                <p className="text-sm text-gray-600">Get reminders for daily activities</p>
              </div>
              <Switch
                checked={notifications.dailyReminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, dailyReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-gray-800">Progress Updates</p>
                <p className="text-sm text-gray-600">Weekly progress reports for your children</p>
              </div>
              <Switch
                checked={notifications.progressUpdates}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, progressUpdates: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-gray-800">Achievement Alerts</p>
                <p className="text-sm text-gray-600">Notifications when children earn badges</p>
              </div>
              <Switch
                checked={notifications.achievements}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, achievements: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-gray-800">Parenting Tips</p>
                <p className="text-sm text-gray-600">Islamic parenting tips and advice</p>
              </div>
              <Switch
                checked={notifications.tips}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, tips: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Language & Preferences */}
        <Card className="p-4 sm:p-6 rounded-3xl mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-[#CE93D8]" />
            <h2 className="text-gray-800 text-lg sm:text-xl">Language & Preferences</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">App Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">🇬🇧 English</SelectItem>
                  <SelectItem value="urdu">🇵🇰 Urdu</SelectItem>
                  <SelectItem value="roman">🔤 Roman Urdu</SelectItem>
                  <SelectItem value="arabic">🇸🇦 Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme Preference</Label>
              <Select defaultValue="light">
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">☀️ Light Mode</SelectItem>
                  <SelectItem value="dark">🌙 Dark Mode</SelectItem>
                  <SelectItem value="auto">🔄 Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-4 sm:p-6 rounded-3xl bg-red-50 border-2 border-red-100">
          <h3 className="text-gray-800 mb-4 text-base sm:text-lg">Danger Zone</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full rounded-xl border-red-300 text-red-600 hover:bg-red-50 text-sm sm:text-base">
              Reset All Progress
            </Button>
            <Button variant="outline" className="w-full rounded-xl border-red-300 text-red-600 hover:bg-red-50 text-sm sm:text-base">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Bell, Globe, Users, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as settingsApi from '../api/settingsApi';
import ChildForm from './ChildForm';

export function SettingsPage() {
  // Parent profile state
  const [parentProfile, setParentProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileEdit, setProfileEdit] = useState<any>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Children state
  const [children, setChildren] = useState<any[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [childrenError, setChildrenError] = useState('');
  
  // Child modal state
  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [childForm, setChildForm] = useState({
    username: '',
    password: '',
    name: '',
    age: '',
    gender: '',
    school: '',
    class_name: '',
    temperament: '',
  });
  const [childSaving, setChildSaving] = useState(false);
  const [childError, setChildError] = useState('');
  const [childModalKey, setChildModalKey] = useState(0);

  // Notification and language (local only)
  const [language, setLanguage] = useState('english');
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    progressUpdates: true,
    achievements: true,
    tips: false,
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!showChildModal) {
      setChildForm({
        username: '',
        password: '',
        name: '',
        age: '',
        gender: '',
        school: '',
        class_name: '',
        temperament: '',
      });
      setEditingChild(null);
      setChildError('');
    }
  }, [showChildModal]);

  // Fetch parent profile and children on mount
  useEffect(() => {
    setProfileLoading(true);
    setProfileError('');
    settingsApi.getParentProfile()
      .then((data: any) => {
        setParentProfile(data);
        setProfileEdit({
          name: data.name || '',
          phone: data.profile?.phone || '',
          country: data.profile?.country || '',
          city: data.profile?.city || '',
          father_age: data.profile?.father_age || '',
          mother_age: data.profile?.mother_age || '',
          married_since: data.profile?.married_since || '',
          is_single_parent: data.profile?.is_single_parent || false,
        });
      })
      .catch((_err: any) => {
        setProfileError('Failed to load parent profile');
      })
      .finally(() => setProfileLoading(false));

    setChildrenLoading(true);
    setChildrenError('');
    settingsApi.getAllChildren()
      .then((data: any) => setChildren(data.children || []))
      .catch(() => setChildrenError('Failed to load children'))
      .finally(() => setChildrenLoading(false));
  }, []);

  // Handle parent profile field change
  const handleProfileChange = (key: string, value: any) => {
    setProfileEdit((prev: any) => ({ ...prev, [key]: value }));
  };

  // Save parent profile
  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      await settingsApi.updateParentProfile(profileEdit);
      setProfileSuccess('Profile updated successfully!');
      // Refetch profile
      const data = await settingsApi.getParentProfile();
      setParentProfile(data);
    } catch (err) {
      setProfileError('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowChildModal(false);
    setEditingChild(null);
    setChildError('');
    setChildForm({
      username: '',
      password: '',
      name: '',
      age: '',
      gender: '',
      school: '',
      class_name: '',
      temperament: '',
    });
  };

  // Open modal to add new child
  const handleAddChild = () => {
    setEditingChild(null);
    setChildError('');
    setChildForm({
      username: '',
      password: '',
      name: '',
      age: '',
      gender: '',
      school: '',
      class_name: '',
      temperament: '',
    });
    setChildModalKey(prev => prev + 1); // Change key to force remount
    setShowChildModal(true);
  };

  // Open modal to edit existing child
  const handleEditChild = (child: any) => {
    setEditingChild(child);
    setChildForm({
      username: '', // Always clear username
      password: '', // Always clear password
      name: child.name || '',
      age: child.age || '',
      gender: child.gender || '',
      school: child.school || '',
      class_name: child.class_name || '',
      temperament: child.temperament || '',
    });
    setChildError('');
    setChildModalKey(prev => prev + 1); // Force remount to clear any stale state
    setShowChildModal(true);
  };

  // Save child (add or update)
  const handleSaveChild = async () => {
    setChildSaving(true);
    setChildError('');
    try {
      if (editingChild) {
        // Update existing child
        await settingsApi.updateChild(editingChild.id, childForm);
      } else {
        // Add new child
        await settingsApi.addChild(childForm);
      }
      // Refetch children (passwords are never returned by backend for security)
      const data = await settingsApi.getAllChildren();
      setChildren(data.children || []);
      
      // Clear form and close modal
      setChildForm({
        username: '',
        password: '',
        name: '',
        age: '',
        gender: '',
        school: '',
        class_name: '',
        temperament: '',
      });
      setEditingChild(null);
      setChildError('');
      setShowChildModal(false);
    } catch (err: any) {
      setChildError(err?.response?.data?.detail || err?.response?.data?.message || 'Failed to save child');
    } finally {
      setChildSaving(false);
    }
  };

  // Delete child
  const handleDeleteChild = async (childId: number) => {
    if (!confirm('Are you sure you want to delete this child? This action cannot be undone.')) {
      return;
    }
    try {
      await settingsApi.deleteChild(childId);
      // Refetch children
      const data = await settingsApi.getAllChildren();
      setChildren(data.children || []);
    } catch (err) {
      alert('Failed to delete child');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#FFF8E1] to-white pt-20 lg:pt-8">
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
          {profileLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : profileError ? (
            <div className="text-red-600">{profileError}</div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {parentProfile?.picture || parentProfile?.photo_url ? (
                  <img 
                    src={parentProfile.picture || parentProfile.photo_url} 
                    alt={parentProfile.name || 'Parent'} 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#A8E6CF]"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#B3E5FC] flex items-center justify-center text-3xl sm:text-4xl ${parentProfile?.picture || parentProfile?.photo_url ? 'hidden' : ''}`}>
                  👨‍👩‍👧‍👦
                </div>
                <Button variant="outline" className="rounded-xl w-full sm:w-auto" disabled>
                  Change Photo
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileEdit.name || ''}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={parentProfile?.email || ''}
                    disabled
                    className="rounded-xl bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileEdit.phone || ''}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profileEdit.country || ''}
                    onChange={(e) => handleProfileChange('country', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profileEdit.city || ''}
                    onChange={(e) => handleProfileChange('city', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="father_age">Father Age</Label>
                  <Input
                    id="father_age"
                    type="number"
                    value={profileEdit.father_age || ''}
                    onChange={(e) => handleProfileChange('father_age', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mother_age">Mother Age</Label>
                  <Input
                    id="mother_age"
                    type="number"
                    value={profileEdit.mother_age || ''}
                    onChange={(e) => handleProfileChange('mother_age', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="married_since">Married Since (year)</Label>
                  <Input
                    id="married_since"
                    type="number"
                    value={profileEdit.married_since || ''}
                    onChange={(e) => handleProfileChange('married_since', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="is_single_parent"
                    type="checkbox"
                    checked={!!profileEdit.is_single_parent}
                    onChange={(e) => handleProfileChange('is_single_parent', e.target.checked)}
                  />
                  <Label htmlFor="is_single_parent">Single Parent?</Label>
                </div>
              </div>
              {profileSuccess && <div className="text-green-600">{profileSuccess}</div>}
              {profileError && <div className="text-red-600">{profileError}</div>}
              <Button
                className="bg-[#A8E6CF] hover:bg-[#8BD4AE] text-[#2D5F3F] rounded-xl"
                onClick={handleProfileSave}
                disabled={profileSaving}
              >
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </Card>

        {/* Children Management */}
        <Card className="p-4 sm:p-6 rounded-3xl mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#B3E5FC]" />
              <h2 className="text-gray-800 text-lg sm:text-xl">Manage Children</h2>
            </div>
            <Button className="bg-[#B3E5FC] hover:bg-[#81D4FA] text-[#1E4F6F] rounded-xl w-full sm:w-auto" onClick={handleAddChild}>
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
                    {child.name?.[0]?.toUpperCase() || '👦'}
                  </div>
                  <div>
                    <p className="text-gray-800">{child.name}</p>
                    <p className="text-sm text-gray-600">{child.age} years old</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={() => handleEditChild(child)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg text-red-600 hover:text-red-700" onClick={() => handleDeleteChild(child.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
        {/* Child Add/Edit Modal */}
        {showChildModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div key={childModalKey} className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative border border-gray-200 animate-fadeIn mx-2">
              <button className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700" onClick={handleCloseModal} aria-label="Close">&times;</button>
              <h3 className="text-lg font-semibold mb-4 text-center">{editingChild ? 'Edit Child' : 'Add Child'}</h3>
              {childError && <div className="text-red-600 mb-2 text-center">{childError}</div>}
              <div className="max-w-full mx-auto">
                <ChildForm
                  key={childModalKey}
                  index={0}
                  child={childForm}
                  onChange={(_idx, updated) => setChildForm(updated)}
                  onRemove={editingChild ? undefined : null}
                  hideHeader={!editingChild}
                />
              </div>
              <Button className="mt-6 w-full bg-[#B3E5FC] hover:bg-[#81D4FA] text-[#1E4F6F] rounded-xl" onClick={handleSaveChild} disabled={childSaving}>
                {childSaving ? 'Saving...' : (editingChild ? 'Save Changes' : 'Add Child')}
              </Button>
            </div>
          </div>
        )}
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
                onCheckedChange={(checked: boolean) =>
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
                onCheckedChange={(checked: boolean) =>
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
                onCheckedChange={(checked: boolean) =>
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
                onCheckedChange={(checked: boolean) =>
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

// File: src/components/blocks/account-details/ProfileSettings.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { Settings, Bell, Shield, Eye, Trash2, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

interface User {
  id: string;
  email: string;
  username: string;
  accountId: string;
  accountType: string;
  createdAt: Date;
  // Make settings properties optional with default values
  emailNotifications?: boolean;
  profileVisibility?: boolean;
  twoFactorAuth?: boolean;
  marketingEmails?: boolean;
}

interface ProfileSettingsProps {
  user: User;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const [settings, setSettings] = useState({
    // Provide default values if properties are undefined
    emailNotifications: user.emailNotifications ?? true,
    profileVisibility: user.profileVisibility ?? false,
    twoFactorAuth: user.twoFactorAuth ?? false,
    marketingEmails: user.marketingEmails ?? false,
  });
  const [deletePassword, setDeletePassword] = useState("");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const updateSettingsMutation = api.profile.updateSettings.useMutation();
  const deleteAccountMutation = api.profile.deleteAccount.useMutation();

  const handleSettingChange = async (
    key: keyof typeof settings,
    value: boolean,
  ) => {
    const prevValue = settings[key];
    setSettings((prev) => ({ ...prev, [key]: value }));

    try {
      await updateSettingsMutation.mutateAsync({ [key]: value });
      toast({
        title: "Setting Updated",
        description: "Your preference has been saved",
      });
    } catch (error: unknown) {
      setSettings((prev) => ({ ...prev, [key]: prevValue }));
      const message =
        error instanceof Error ? error.message : "Failed to update setting";
      toast({
        title: "Error",
        description: message,
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync({ password: deletePassword });

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      });

      // Redirect to home page
      window.location.href = "/";
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete account";
      toast({
        title: "Error",
        description: message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Account Settings
        </CardTitle>
        <CardDescription>
          Manage your account preferences and privacy settings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Appearance Settings */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <Palette className="h-4 w-4" />
            Appearance
          </h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred interface theme
              </p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <Bell className="h-4 w-4" />
            Notifications
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange("emailNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional emails and newsletters
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={settings.marketingEmails}
                onCheckedChange={(checked) =>
                  handleSettingChange("marketingEmails", checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <Eye className="h-4 w-4" />
            Privacy
          </h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile-visibility">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch
              id="profile-visibility"
              checked={settings.profileVisibility}
              onCheckedChange={(checked) =>
                handleSettingChange("profileVisibility", checked)
              }
            />
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <Shield className="h-4 w-4" />
            Security
          </h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) =>
                handleSettingChange("twoFactorAuth", checked)
              }
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t pt-6">
          <h3 className="mb-4 text-lg font-medium text-destructive">
            Danger Zone
          </h3>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full md:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove all of your data from our servers.
                  Please enter your password to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                type="password"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="mt-4"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteAccountMutation.isPending || !deletePassword}
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export { ProfileSettings };

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import SidebarNav from "@/components/layout/sidebar-nav";
import TopNav from "@/components/layout/top-nav";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Bell, User, Shield, HelpCircle, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logoutMutation.mutate();
    }
  };

  return (
    <div className="flex h-screen bg-neutral">
      {/* Sidebar (Desktop) */}
      <SidebarNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNav title="Settings" />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral p-4">
          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-dark">Settings</h2>
            <p className="text-sm text-gray-500">Manage your account and application preferences</p>
          </div>

          {/* Settings Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <Card className="md:col-span-1">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${activeTab === "profile" ? "bg-primary/10 text-primary" : ""}`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${activeTab === "notifications" ? "bg-primary/10 text-primary" : ""}`}
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${activeTab === "security" ? "bg-primary/10 text-primary" : ""}`}
                    onClick={() => setActiveTab("security")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${activeTab === "help" ? "bg-primary/10 text-primary" : ""}`}
                    onClick={() => setActiveTab("help")}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </Button>
                  <Separator className="my-2" />
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-danger"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings Content Area */}
            <div className="md:col-span-3">
              {activeTab === "profile" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={user?.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={user?.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue={user?.username} disabled />
                      <p className="text-sm text-gray-500">Username cannot be changed</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              )}

              {activeTab === "notifications" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage when and how you get notified</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">FD Maturity Reminders</p>
                        <p className="text-sm text-gray-500">Get notified when your FDs are about to mature</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Monthly Budget Reports</p>
                        <p className="text-sm text-gray-500">Receive monthly summaries of your income and expenses</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Investment Tips</p>
                        <p className="text-sm text-gray-500">Get personalized investment recommendations</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">App Updates</p>
                        <p className="text-sm text-gray-500">Be notified about new features and updates</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              )}

              {activeTab === "security" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Update Password</Button>
                  </CardFooter>
                </Card>
              )}

              {activeTab === "help" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Help & Support</CardTitle>
                    <CardDescription>Get help with your account and app usage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Frequently Asked Questions</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">How do I add a new FD?</p>
                          <p className="text-sm text-gray-500">You can add a new FD from the dashboard by clicking the "Add New FD" button.</p>
                        </div>
                        <div>
                          <p className="font-medium">Can I export my data?</p>
                          <p className="text-sm text-gray-500">Yes, you can export your data from the FD Records page by clicking the "Export" button.</p>
                        </div>
                        <div>
                          <p className="font-medium">How accurate are the projections?</p>
                          <p className="text-sm text-gray-500">Projections are based on current interest rates and may vary based on market conditions.</p>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Need more help? Feel free to reach out to our support team.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="Enter subject" />
                      </div>
                      <div className="space-y-2 mt-2">
                        <Label htmlFor="message">Message</Label>
                        <textarea
                          id="message"
                          placeholder="Describe your issue"
                          className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                        ></textarea>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Send Message</Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}

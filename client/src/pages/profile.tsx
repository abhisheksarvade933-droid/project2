import { useAuth } from '@/components/auth/auth-context';
import { Navigation } from '@/components/layout/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, ArrowLeft, Edit } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient': return 'role-patient';
      case 'donor': return 'role-donor';
      case 'doctor': return 'role-doctor';
      case 'admin': return 'role-admin';
      default: return 'role-patient';
    }
  };

  const goBack = () => {
    setLocation(`/${user?.role}`);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="profile-page">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={goBack}
              className="mr-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">User Profile</h1>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Basic Information
                  </CardTitle>
                  <Button variant="outline" data-testid="button-edit">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">First Name</label>
                    <div className="font-medium" data-testid="text-firstName">{user?.firstName}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Last Name</label>
                    <div className="font-medium" data-testid="text-lastName">{user?.lastName}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Email Address</label>
                  <div className="font-medium" data-testid="text-email">{user?.email}</div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Role</label>
                  <div>
                    <Badge className={user?.role ? getRoleColor(user.role) : 'role-patient'} data-testid="badge-role">
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Blood Type</label>
                    <div className="font-medium" data-testid="text-bloodType">Not specified</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Age</label>
                    <div className="font-medium" data-testid="text-age">Not specified</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Weight</label>
                    <div className="font-medium" data-testid="text-weight">Not specified</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Height</label>
                    <div className="font-medium" data-testid="text-height">Not specified</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Medical Conditions</label>
                  <div className="font-medium" data-testid="text-medicalConditions">None specified</div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Phone Number</label>
                  <div className="font-medium" data-testid="text-phone">Not specified</div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Address</label>
                  <div className="font-medium" data-testid="text-address">Not specified</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">City</label>
                    <div className="font-medium" data-testid="text-city">Not specified</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">State</label>
                    <div className="font-medium" data-testid="text-state">Not specified</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">ZIP Code</label>
                    <div className="font-medium" data-testid="text-zipCode">Not specified</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Emergency Contact Name</label>
                  <div className="font-medium" data-testid="text-emergencyContact">Not specified</div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Emergency Contact Phone</label>
                  <div className="font-medium" data-testid="text-emergencyPhone">Not specified</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/layout/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/auth';
import { 
  Users, 
  Heart, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Download,
  Eye,
  Edit,
  UserX
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  activeDonors: number;
  pendingRequests: number;
  successfulMatches: number;
}

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const { data: stats, isLoading: statsLoading } = useQuery<SystemStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users', selectedRole === 'all' ? undefined : selectedRole],
  });

  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ['/api/organ-requests'],
  });

  const { data: pledges = [] } = useQuery({
    queryKey: ['/api/organ-pledges'],
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}/status`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User status updated",
        description: "The user status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSuspendUser = (userId: string) => {
    updateUserStatusMutation.mutate({ userId, isActive: false });
  };

  const handleActivateUser = (userId: string) => {
    updateUserStatusMutation.mutate({ userId, isActive: true });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient': return 'role-patient';
      case 'donor': return 'role-donor';
      case 'doctor': return 'role-doctor';
      case 'admin': return 'role-admin';
      default: return 'role-patient';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'status-approved' : 'status-rejected';
  };

  // Calculate pending approvals from requests and users
  const pendingApprovals = [
    ...requests.filter((r: any) => r.status === 'pending').map((r: any) => ({
      type: 'Transplant Request',
      description: `Patient request for ${r.organType}`,
      submittedTime: r.createdAt,
      id: r.id,
      category: 'request'
    })),
    // Add other approval types as needed
  ];

  // Organ inventory mock data (would come from a separate endpoint in real implementation)
  const organInventory = [
    { type: 'Heart', bloodType: 'O+', available: 3, icon: Heart },
    { type: 'Kidney', bloodType: 'A+', available: 7, icon: Heart },
    { type: 'Liver', bloodType: 'B-', available: 2, icon: Heart },
  ];

  if (statsLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* System Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-totalUsers">
                      {stats?.totalUsers || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="text-secondary">↑ 12%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Donors</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-activeDonors">
                      {stats?.activeDonors || 0}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="text-secondary">↑ 8%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Pending Requests</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-pendingRequests">
                      {stats?.pendingRequests || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="text-destructive">↑ 5%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Successful Matches</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-successfulMatches">
                      {stats?.successfulMatches || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-secondary" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="text-secondary">↑ 15%</span> from last month
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals & Organ Inventory */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Approvals</CardTitle>
                  <Badge className="status-pending" data-testid="text-pendingCount">
                    {pendingApprovals.length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-8" data-testid="empty-approvals">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.slice(0, 3).map((approval: any) => (
                      <div key={approval.id} className="border-l-4 border-yellow-500 pl-4 py-2" data-testid={`approval-${approval.id}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{approval.type}</h4>
                            <p className="text-sm text-muted-foreground">{approval.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Submitted {new Date(approval.submittedTime).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                              data-testid={`button-approve-${approval.id}`}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              data-testid={`button-reject-${approval.id}`}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-primary hover:text-primary/80"
                  data-testid="button-viewAllApprovals"
                >
                  View All Pending Approvals →
                </Button>
              </CardContent>
            </Card>

            {/* Organ Inventory */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Organ Inventory</CardTitle>
                  <Button 
                    size="sm"
                    data-testid="button-updateInventory"
                  >
                    Update Stock
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {organInventory.map((organ) => (
                    <div key={organ.type} className="flex items-center justify-between p-3 bg-accent rounded-lg" data-testid={`inventory-${organ.type.toLowerCase()}`}>
                      <div className="flex items-center space-x-3">
                        <organ.icon className="h-5 w-5 text-red-500" />
                        <div>
                          <h4 className="font-medium text-foreground">{organ.type}</h4>
                          <p className="text-sm text-muted-foreground">Blood Type: {organ.bloodType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">{organ.available}</div>
                        <div className="text-xs text-muted-foreground">Available</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex space-x-2">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-32" data-testid="select-userRole">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="patient">Patients</SelectItem>
                      <SelectItem value="donor">Donors</SelectItem>
                      <SelectItem value="doctor">Doctors</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm"
                    data-testid="button-exportUsers"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-users">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-border" data-testid={`row-user-${user.id}`}>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(user.isActive)}>
                              {user.isActive ? 'Active' : 'Suspended'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                data-testid={`button-view-${user.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                data-testid={`button-edit-${user.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user.isActive ? (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleSuspendUser(user.id)}
                                  disabled={updateUserStatusMutation.isPending}
                                  data-testid={`button-suspend-${user.id}`}
                                >
                                  <UserX className="h-4 w-4 text-destructive" />
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleActivateUser(user.id)}
                                  disabled={updateUserStatusMutation.isPending}
                                  data-testid={`button-activate-${user.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 text-secondary" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

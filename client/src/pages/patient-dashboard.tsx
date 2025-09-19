import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/layout/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/auth';
import { ClipboardList, CheckCircle, Clock, Star, Heart, Cat, Eye, Plus } from 'lucide-react';

export default function PatientDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: requests = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/organ-requests'],
  });

  const getOrganIcon = (organType: string) => {
    switch (organType) {
      case 'heart': return Heart;
      case 'kidney': return Cat;
      case 'cornea': return Eye;
      default: return Heart;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'matched': return 'status-matched';
      default: return 'status-pending';
    }
  };

  const stats = {
    activeRequests: requests.filter((r: any) => ['pending', 'approved'].includes(r.status)).length,
    matched: requests.filter((r: any) => r.status === 'matched').length,
    waitingDays: 127, // This would be calculated based on oldest request
    priorityScore: 8.5,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
    <div className="min-h-screen bg-background" data-testid="patient-dashboard">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Requests</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-activeRequests">
                      {stats.activeRequests}
                    </p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Matched</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-matched">
                      {stats.matched}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Waiting Days</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-waitingDays">
                      {stats.waitingDays}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Priority Score</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-priorityScore">
                      {stats.priorityScore}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Requests */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Requests</CardTitle>
                <Button onClick={() => setLocation('/patient/requests/new')} data-testid="button-newRequest">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-requests">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No organ requests found</p>
                  <p className="text-sm text-muted-foreground">Create your first request to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Organ Type</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Request Date</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Priority</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request: any) => {
                        const OrganIcon = getOrganIcon(request.organType);
                        return (
                          <tr key={request.id} className="border-b border-border" data-testid={`row-request-${request.id}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <OrganIcon className="h-5 w-5 text-red-500 mr-2" />
                                <span className="capitalize">{request.organType}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusColor(request.status)}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-foreground font-medium capitalize">{request.priority}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="sm" data-testid={`button-view-${request.id}`}>
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Blood Type:</span>
                    <span className="text-foreground font-medium" data-testid="text-bloodType">O+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span className="text-foreground font-medium" data-testid="text-age">34</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="text-foreground font-medium" data-testid="text-weight">75 kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medical Condition:</span>
                    <span className="text-foreground font-medium" data-testid="text-condition">Heart Failure</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-foreground text-sm">Medical evaluation completed</p>
                      <p className="text-muted-foreground text-xs">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                    <div>
                      <p className="text-foreground text-sm">Potential match found</p>
                      <p className="text-muted-foreground text-xs">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-foreground text-sm">Request submitted</p>
                      <p className="text-muted-foreground text-xs">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

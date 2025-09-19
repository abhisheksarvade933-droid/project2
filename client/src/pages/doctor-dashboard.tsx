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
import { ClipboardList, CheckCircle, Heart, BarChart, Search, Cat, Eye } from 'lucide-react';

export default function DoctorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: ['/api/organ-requests'],
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery<any[]>({
    queryKey: ['/api/organ-matches'],
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const response = await apiRequest('PATCH', `/api/organ-requests/${id}/status`, { status, notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organ-requests'] });
      toast({
        title: "Request updated",
        description: "The patient request has been updated successfully.",
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-600';
      case 'high': return 'status-matched';
      case 'medium': return 'status-pending';
      case 'low': return 'status-approved';
      default: return 'status-pending';
    }
  };

  const stats = {
    pendingReviews: requests.filter((r: any) => r.status === 'pending').length,
    approvedToday: requests.filter((r: any) => r.status === 'approved').length,
    matchesFound: matches.length,
    successRate: '94%',
  };

  const handleApprove = (requestId: string) => {
    updateRequestMutation.mutate({ id: requestId, status: 'approved' });
  };

  const handleReject = (requestId: string) => {
    updateRequestMutation.mutate({ id: requestId, status: 'rejected', notes: 'Rejected by doctor' });
  };

  if (requestsLoading || matchesLoading) {
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
    <div className="min-h-screen bg-background" data-testid="doctor-dashboard">
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
                    <p className="text-muted-foreground text-sm">Pending Reviews</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-pendingReviews">
                      {stats.pendingReviews}
                    </p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Approved Today</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-approvedToday">
                      {stats.approvedToday}
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
                    <p className="text-muted-foreground text-sm">Matches Found</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-matchesFound">
                      {stats.matchesFound}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-successRate">
                      {stats.successRate}
                    </p>
                  </div>
                  <BarChart className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Requests Review */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Patient Requests for Review</CardTitle>
                <div className="flex space-x-2">
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Organs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organs</SelectItem>
                      <SelectItem value="heart">Heart</SelectItem>
                      <SelectItem value="kidney">Cat</SelectItem>
                      <SelectItem value="liver">Liver</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-requests">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No patient requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Patient</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Organ</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Priority</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request: any) => {
                        const OrganIcon = getOrganIcon(request.organType);
                        return (
                          <tr key={request.id} className="border-b border-border" data-testid={`row-request-${request.id}`}>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-foreground">Patient #{request.patientId.slice(-6)}</div>
                                <div className="text-sm text-muted-foreground">ID: {request.id.slice(-8)}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <OrganIcon className="h-5 w-5 text-red-500 mr-2" />
                                <span className="capitalize">{request.organType}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getPriorityColor(request.priority)}>
                                {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusColor(request.status)}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                {request.status === 'pending' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      onClick={() => handleApprove(request.id)}
                                      disabled={updateRequestMutation.isPending}
                                      data-testid={`button-approve-${request.id}`}
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleReject(request.id)}
                                      disabled={updateRequestMutation.isPending}
                                      data-testid={`button-reject-${request.id}`}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  data-testid={`button-details-${request.id}`}
                                >
                                  Details
                                </Button>
                              </div>
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

          {/* Potential Matches */}
          <Card>
            <CardHeader>
              <CardTitle>Potential Donor-Patient Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-matches">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No potential matches found</p>
                  <p className="text-sm text-muted-foreground">Matches will appear here when available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match: any) => (
                    <Card key={match.id} className="border border-border" data-testid={`card-match-${match.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-secondary rounded-full"></div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                Match #{match.id.slice(-6)}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Compatibility: {match.compatibilityScore || '85'}% • 
                                Status: {match.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" data-testid={`button-recommend-${match.id}`}>
                              Recommend
                            </Button>
                            <Button size="sm" variant="outline" data-testid={`button-view-match-${match.id}`}>
                              Details
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Request ID: {match.requestId.slice(-8)} • 
                          Pledge ID: {match.pledgeId.slice(-8)} • 
                          Created: {new Date(match.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

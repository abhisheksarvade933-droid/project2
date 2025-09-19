import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/layout/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/auth';
import { ClipboardList, Heart, Cat, Eye, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function DoctorRequests() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/organ-requests'],
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

  const handleApprove = (requestId: string) => {
    updateRequestMutation.mutate({ id: requestId, status: 'approved' });
  };

  const handleReject = (requestId: string) => {
    updateRequestMutation.mutate({ id: requestId, status: 'rejected', notes: 'Rejected after medical review' });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="doctor-requests-page">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/doctor')}
              className="mr-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Patient Requests</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  All Patient Requests
                </CardTitle>
                <div className="flex space-x-2">
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12" data-testid="empty-requests">
                  <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No requests found</h3>
                  <p className="text-muted-foreground">No patient requests available for review at this time.</p>
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
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Submitted</th>
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
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
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
        </main>
      </div>
    </div>
  );
}
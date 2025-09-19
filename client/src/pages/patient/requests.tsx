import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/layout/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Plus, Heart, Cat, Eye, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function PatientRequests() {
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

  return (
    <div className="min-h-screen bg-background" data-testid="patient-requests-page">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/patient')}
              className="mr-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">My Organ Requests</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  All Requests
                </CardTitle>
                <Button onClick={() => setLocation('/patient/requests/new')} data-testid="button-newRequest">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
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
                  <p className="text-muted-foreground mb-6">You haven't submitted any organ requests yet.</p>
                  <Button onClick={() => setLocation('/patient/requests/new')} data-testid="button-createFirst">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Request
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
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
                              <div className="flex items-center">
                                <OrganIcon className="h-5 w-5 text-red-500 mr-2" />
                                <span className="capitalize">{request.organType}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className="capitalize">{request.priority}</Badge>
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
                              <Button variant="ghost" size="sm" data-testid={`button-view-${request.id}`}>
                                View Details
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
        </main>
      </div>
    </div>
  );
}
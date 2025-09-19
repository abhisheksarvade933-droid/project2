import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/layout/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Plus, Heart, Cat, Eye, ArrowLeft, History } from 'lucide-react';
import { useLocation } from 'wouter';

export default function DonorPledges() {
  const [, setLocation] = useLocation();

  const { data: pledges = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/organ-pledges'],
  });

  const getOrganIcon = (organType: string) => {
    switch (organType) {
      case 'heart': return Heart;
      case 'kidney': return Cat;
      case 'cornea': return Eye;
      default: return Heart;
    }
  };

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable ? 'status-approved' : 'status-matched';
  };

  return (
    <div className="min-h-screen bg-background" data-testid="donor-pledges-page">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/donor')}
              className="mr-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">My Organ Pledges</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Donation History
                </CardTitle>
                <Button onClick={() => setLocation('/donor/pledges/new')} data-testid="button-newPledge">
                  <Plus className="h-4 w-4 mr-2" />
                  New Pledge
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : pledges.length === 0 ? (
                <div className="text-center py-12" data-testid="empty-pledges">
                  <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No pledges found</h3>
                  <p className="text-muted-foreground mb-6">You haven't made any organ pledges yet.</p>
                  <Button onClick={() => setLocation('/donor/pledges/new')} data-testid="button-createFirst">
                    <Plus className="h-4 w-4 mr-2" />
                    Make Your First Pledge
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pledges.map((pledge: any) => {
                    const OrganIcon = getOrganIcon(pledge.organType);
                    return (
                      <Card key={pledge.id} className="border border-border" data-testid={`card-pledge-${pledge.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <OrganIcon className="h-5 w-5 text-red-500 mr-2" />
                              <h3 className="font-medium text-foreground capitalize">{pledge.organType}</h3>
                            </div>
                            <Badge className={getStatusColor(pledge.isAvailable)}>
                              {pledge.isAvailable ? 'Available' : 'Matched'}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Type:</span>
                              <span className="text-foreground capitalize">{pledge.donationType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Pledged:</span>
                              <span className="text-foreground">
                                {new Date(pledge.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {pledge.medicalNotes && (
                              <div className="mt-2 pt-2 border-t">
                                <span className="text-muted-foreground text-xs">Notes:</span>
                                <p className="text-foreground text-xs mt-1">{pledge.medicalNotes}</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-4 pt-3 border-t">
                            <Button variant="outline" size="sm" className="w-full" data-testid={`button-details-${pledge.id}`}>
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/layout/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Heart, Star, CheckCircle, Plus, Cat, Eye } from 'lucide-react';

export default function DonorDashboard() {
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

  const stats = {
    organsPledged: pledges.length,
    livesSaved: pledges.filter((p: any) => !p.isAvailable).length,
    donorScore: 9.8,
    status: 'Active',
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
    <div className="min-h-screen bg-background" data-testid="donor-dashboard">
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
                    <p className="text-muted-foreground text-sm">Organs Pledged</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-organsPledged">
                      {stats.organsPledged}
                    </p>
                  </div>
                  <Gift className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Lives Saved</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-livesSaved">
                      {stats.livesSaved}
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
                    <p className="text-muted-foreground text-sm">Donor Score</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-donorScore">
                      {stats.donorScore}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Status</p>
                    <p className="text-sm font-bold text-secondary" data-testid="stat-status">
                      {stats.status}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pledge Management */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Organ Pledges</CardTitle>
                <Button onClick={() => setLocation('/donor/pledges/new')} data-testid="button-addPledge">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pledge
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pledges.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-pledges">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No organ pledges found</p>
                  <p className="text-sm text-muted-foreground">Create your first pledge to help save lives</p>
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
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Information and Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Blood Type:</span>
                    <span className="text-foreground font-medium" data-testid="text-bloodType">AB+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span className="text-foreground font-medium" data-testid="text-age">28</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Health Status:</span>
                    <span className="text-secondary font-medium" data-testid="text-healthStatus">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Checkup:</span>
                    <span className="text-foreground font-medium" data-testid="text-lastCheckup">Mar 1, 2024</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  data-testid="button-updateMedicalInfo"
                >
                  Update Medical Info
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-secondary/10 rounded-lg">
                    <div className="text-3xl font-bold text-secondary" data-testid="text-totalLives">3</div>
                    <div className="text-muted-foreground text-sm">Lives Potentially Saved</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Heart Recipients:</span>
                      <span className="text-foreground font-medium" data-testid="text-heartRecipients">1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cat Recipients:</span>
                      <span className="text-foreground font-medium" data-testid="text-kidneyRecipients">2</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Waiting List Impact:</span>
                      <span className="text-secondary font-medium" data-testid="text-waitingListImpact">High</span>
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

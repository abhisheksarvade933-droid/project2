import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Heart, Users, UserCheck, Shield, ChevronRight } from 'lucide-react';

const roles = [
  {
    id: 'patient',
    title: 'Patient',
    description: 'I need an organ transplant',
    icon: Users,
    color: 'text-blue-500',
    details: [
      'Submit organ requests',
      'Track request status',
      'View matching progress',
      'Access medical records'
    ]
  },
  {
    id: 'donor',
    title: 'Donor',
    description: 'I want to donate organs',
    icon: Heart,
    color: 'text-red-500',
    details: [
      'Pledge organ donations',
      'Manage donation preferences',
      'View donation history',
      'Help save lives'
    ]
  },
  {
    id: 'doctor',
    title: 'Medical Professional',
    description: 'I am a doctor or medical professional',
    icon: UserCheck,
    color: 'text-green-500',
    details: [
      'Review patient requests',
      'Verify medical information',
      'Match organs with recipients',
      'Manage medical records'
    ]
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'I manage the organ transplantation website',
    icon: Shield,
    color: 'text-purple-500',
    details: [
      'Oversee website operations',
      'Manage user accounts',
      'View website analytics',
      'Handle approvals'
    ]
  }
];

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await apiRequest('PATCH', '/api/auth/role', { role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Role selected successfully",
        description: "Welcome to the organ transplantation website!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to set role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleConfirm = () => {
    if (selectedRole) {
      updateRoleMutation.mutate(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Organ Transplantation Website</h1>
          <p className="text-lg text-muted-foreground">
            Please select your role to get started with the appropriate dashboard and features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleRoleSelect(role.id)}
                data-testid={`card-role-${role.id}`}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`h-8 w-8 ${role.color}`} />
                    <div>
                      <CardTitle className="text-xl">{role.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    {isSelected && (
                      <ChevronRight className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.details.map((detail, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 bg-current rounded-full mr-2"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleConfirm}
            disabled={!selectedRole || updateRoleMutation.isPending}
            size="lg"
            className="px-8"
            data-testid="button-confirm"
          >
            {updateRoleMutation.isPending ? 'Setting up...' : 'Continue'}
          </Button>
          
          {selectedRole && (
            <p className="text-sm text-muted-foreground mt-4">
              You selected: <span className="font-medium text-foreground">
                {roles.find(r => r.id === selectedRole)?.title}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
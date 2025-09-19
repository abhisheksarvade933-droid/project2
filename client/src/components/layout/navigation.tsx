import { useAuth } from '@/components/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Heart, LogOut } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient': return 'role-patient';
      case 'donor': return 'role-donor';
      case 'doctor': return 'role-doctor';
      case 'admin': return 'role-admin';
      default: return 'role-patient';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'patient': return 'fas fa-user-injured';
      case 'donor': return 'fas fa-hand-holding-heart';
      case 'doctor': return 'fas fa-user-md';
      case 'admin': return 'fas fa-shield-alt';
      default: return 'fas fa-user';
    }
  };

  return (
    <nav className="bg-card border-b border-border px-6 py-4" data-testid="navigation">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-full">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground" data-testid="page-title">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </h1>
            <span className={`role-indicator ${getRoleColor(user.role)}`} data-testid="user-role">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-muted-foreground" data-testid="user-name">
            {user.firstName} {user.lastName}
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}

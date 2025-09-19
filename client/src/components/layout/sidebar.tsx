import { Link, useLocation } from 'wouter';
import { useAuth } from '@/components/auth/auth-context';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  ClipboardList, 
  Heart, 
  History, 
  Plus, 
  Search, 
  Settings, 
  Users, 
  FileText,
  Gift,
  CheckCircle,
  UserCheck
} from 'lucide-react';

interface SidebarItem {
  href: string;
  label: string;
  icon: any;
}

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getSidebarItems = (): SidebarItem[] => {
    const basePath = `/${user.role}`;
    
    switch (user.role) {
      case 'patient':
        return [
          { href: `${basePath}`, label: 'Dashboard', icon: BarChart3 },
          { href: `${basePath}/requests/new`, label: 'New Request', icon: Plus },
          { href: `${basePath}/requests`, label: 'My Requests', icon: ClipboardList },
          { href: `${basePath}/profile`, label: 'Profile', icon: Settings },
        ];
      case 'donor':
        return [
          { href: `${basePath}`, label: 'Dashboard', icon: BarChart3 },
          { href: `${basePath}/pledges/new`, label: 'Pledge Organs', icon: Gift },
          { href: `${basePath}/pledges`, label: 'Donation History', icon: History },
          { href: `${basePath}/profile`, label: 'Profile', icon: Settings },
        ];
      case 'doctor':
        return [
          { href: `${basePath}`, label: 'Dashboard', icon: BarChart3 },
          { href: `${basePath}/requests`, label: 'Patient Requests', icon: CheckCircle },
          { href: `${basePath}/matches`, label: 'Find Matches', icon: Search },
          { href: `${basePath}/records`, label: 'Medical Records', icon: FileText },
        ];
      case 'admin':
        return [
          { href: `${basePath}`, label: 'Dashboard', icon: BarChart3 },
          { href: `${basePath}/users`, label: 'User Management', icon: Users },
          { href: `${basePath}/inventory`, label: 'Organ Inventory', icon: Heart },
          { href: `${basePath}/approvals`, label: 'Approvals', icon: UserCheck },
          { href: `${basePath}/analytics`, label: 'Analytics', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen sidebar-transition" data-testid="sidebar">
      <nav className="p-6">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location === item.href || 
              (item.href !== `/${user.role}` && location.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md transition-colors",
                    isActive 
                      ? "text-foreground bg-accent" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

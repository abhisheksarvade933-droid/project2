import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import RoleSelection from "@/pages/role-selection";
import PatientDashboard from "@/pages/patient-dashboard";
import DonorDashboard from "@/pages/donor-dashboard";
import DoctorDashboard from "@/pages/doctor-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import Profile from "@/pages/profile";
import NewRequest from "@/pages/patient/new-request";
import PatientRequests from "@/pages/patient/requests";
import NewPledge from "@/pages/donor/new-pledge";
import DonorPledges from "@/pages/donor/pledges";
import DoctorRequests from "@/pages/doctor/requests";
import AdminUsers from "@/pages/admin/users";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Show landing page for non-authenticated users */}
      {!isAuthenticated ? (
        <>
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </>
      ) : !user?.role ? (
        /* Show role selection for authenticated users without a role */
        <Route path="/" component={RoleSelection} />
      ) : (
        /* Authenticated routes with role-based access */
        <>
          {/* Redirect to role dashboard by default */}
          <Route path="/">
            {user.role === 'patient' && <PatientDashboard />}
            {user.role === 'donor' && <DonorDashboard />}
            {user.role === 'doctor' && <DoctorDashboard />}
            {user.role === 'admin' && <AdminDashboard />}
          </Route>
          
          {/* Patient routes */}
          {user.role === 'patient' && (
            <>
              <Route path="/patient" component={PatientDashboard} />
              <Route path="/patient/requests/new" component={NewRequest} />
              <Route path="/patient/requests" component={PatientRequests} />
              <Route path="/patient/profile" component={Profile} />
            </>
          )}
          
          {/* Donor routes */}
          {user.role === 'donor' && (
            <>
              <Route path="/donor" component={DonorDashboard} />
              <Route path="/donor/pledges/new" component={NewPledge} />
              <Route path="/donor/pledges" component={DonorPledges} />
              <Route path="/donor/profile" component={Profile} />
            </>
          )}
          
          {/* Doctor routes */}
          {(user.role === 'doctor' || user.role === 'admin') && (
            <>
              <Route path="/doctor" component={DoctorDashboard} />
              <Route path="/doctor/requests" component={DoctorRequests} />
              <Route path="/doctor/matches" component={DoctorDashboard} />
              <Route path="/doctor/records" component={DoctorDashboard} />
            </>
          )}
          
          {/* Admin routes */}
          {user.role === 'admin' && (
            <>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/inventory" component={AdminDashboard} />
              <Route path="/admin/approvals" component={AdminDashboard} />
              <Route path="/admin/analytics" component={AdminDashboard} />
            </>
          )}
        </>
      )}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
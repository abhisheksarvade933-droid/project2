import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Shield, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-red-500 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Organ Transplantation Website</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Connecting patients, donors, and medical professionals to save lives through efficient organ transplantation management.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>For Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Submit organ requests, track your status, and get matched with compatible donors efficiently.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle>For Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Pledge organ donations and help save lives. Your generosity can make a difference.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>For Medical Professionals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Manage requests, verify matches, and oversee the organ transplantation process.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Why Choose Our Website?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Secure & Compliant</h3>
                <p className="text-gray-600 dark:text-gray-300">HIPAA compliant with end-to-end encryption for all medical data.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Efficient Matching</h3>
                <p className="text-gray-600 dark:text-gray-300">Advanced algorithms for optimal organ-recipient matching.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Real-time Updates</h3>
                <p className="text-gray-600 dark:text-gray-300">Stay informed with instant notifications and status updates.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Professional Support</h3>
                <p className="text-gray-600 dark:text-gray-300">24/7 support from medical professionals and coordinators.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Access Your Website</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Select your role to access the transplantation website
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700"
              data-testid="button-patient-login"
            >
              Patient Website
            </Button>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="text-lg px-8 py-4 bg-red-600 hover:bg-red-700"
              data-testid="button-donor-login"
            >
              Donor Website
            </Button>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="text-lg px-8 py-4 bg-green-600 hover:bg-green-700"
              data-testid="button-admin-login"
            >
              Admin Website
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
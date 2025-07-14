import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { 
  Search, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  Star, 
  Play, 
  ArrowRight,
  UserPlus,
  Briefcase,
  Camera,
  Music,
  Theater,
  Mic
} from "lucide-react";

export default function HowItWorks() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              How It Works
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Connect with top talent or find your next opportunity in just a few simple steps
            </p>
          </div>

          {/* For Talent Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              For Talent
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    1. Create Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Build a professional profile with your portfolio, skills, and experience
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Theater className="w-5 h-5 text-gray-500" />
                    <Music className="w-5 h-5 text-gray-500" />
                    <Camera className="w-5 h-5 text-gray-500" />
                    <Mic className="w-5 h-5 text-gray-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    2. Get Discovered
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Be found by producers, casting directors, and managers looking for your talents
                  </p>
                  <div className="flex justify-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    3. Land Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Connect with industry professionals and secure your next big break
                  </p>
                  <div className="flex justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* For Producers Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              For Producers & Managers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    1. Post Your Gig
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Create detailed job postings with requirements and compensation
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    2. Find Perfect Talent
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Search through verified profiles and portfolios to find the right fit
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    3. Connect & Collaborate
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Message directly and manage projects seamlessly
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of entertainment professionals already using our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="gradient-bg-primary text-white hover:opacity-90 transition-opacity"
                onClick={() => window.location.href = "/api/login"}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.location.href = "/"}
              >
                Learn More
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Search, 
  ArrowLeft, 
  Users, 
  Briefcase, 
  Star,
  MessageCircle,
  Settings,
  HelpCircle,
  Compass
} from "lucide-react";
import { ThemeProvider } from "@/components/ui/theme-provider";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const quickLinks = [
    {
      icon: Home,
      label: "Home",
      description: "Return to homepage",
      path: "/",
      color: "bg-blue-500"
    },
    {
      icon: Search,
      label: "Browse Talents",
      description: "Discover talented professionals",
      path: "/browse-talents",
      color: "bg-purple-500"
    },
    {
      icon: Briefcase,
      label: "Browse Jobs",
      description: "Find opportunities",
      path: "/browse-jobs",
      color: "bg-green-500"
    },
    {
      icon: Users,
      label: "Featured Talents",
      description: "View our top performers",
      path: "/featured-talents",
      color: "bg-orange-500"
    },
    {
      icon: MessageCircle,
      label: "Login",
      description: "Access your account",
      path: "/auth",
      color: "bg-indigo-500"
    },
    {
      icon: Star,
      label: "Register",
      description: "Join our platform",
      path: "/auth",
      color: "bg-pink-500"
    }
  ];

  const helpOptions = [
    {
      icon: HelpCircle,
      label: "Help Center",
      description: "Get support and answers"
    },
    {
      icon: Compass,
      label: "Site Map",
      description: "Explore all pages"
    },
    {
      icon: Settings,
      label: "Contact Support",
      description: "Get direct assistance"
    }
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Talents & Stars</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="relative">
              {/* Large 404 */}
              <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 select-none">
                404
              </h1>
              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Compass className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Oops! Page Not Found
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md">
                    The page you're looking for seems to have taken a different role. 
                    Let's get you back on stage!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Options */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Where would you like to go?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => (
                <Card 
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-700"
                  onClick={() => setLocation(link.path)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <link.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {link.label}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-700">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Need More Help?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our support team is here to help you find what you're looking for
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {helpOptions.map((option, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <option.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Error Details */}
          <div className="mt-8 text-center">
            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
              Error Code: 404 - Page Not Found
            </Badge>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              If you believe this is an error, please contact our support team
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 Talents & Stars. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

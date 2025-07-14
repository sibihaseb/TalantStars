import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Star, Search, Briefcase, Plus, Menu, Calendar } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Find Talent", href: "/search", icon: Search },
    { name: "Browse Jobs", href: "/jobs", icon: Briefcase },
    { name: "Post Gig", href: "/post-gig", icon: Plus },
    { name: "How it Works", href: "/how-it-works", icon: null },
  ];

  const isActive = (href: string) => location === href;

  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-yellow-500 fill-current" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Talents & Stars
              </h1>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                    isActive(item.href)
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/meetings">
                  <Button variant="ghost" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Meetings
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 text-sm font-medium p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        isActive(item.href)
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  
                  {isAuthenticated && (
                    <>
                      <Link
                        href="/meetings"
                        className={`flex items-center space-x-2 text-sm font-medium p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          isActive("/meetings")
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Meetings</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        className={`flex items-center space-x-2 text-sm font-medium p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          isActive("/dashboard")
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        className={`flex items-center space-x-2 text-sm font-medium p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          isActive("/profile")
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <span>Profile</span>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}

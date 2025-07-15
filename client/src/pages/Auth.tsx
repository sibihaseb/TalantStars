import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Lock, 
  Star,
  Theater,
  Music,
  Camera,
  Mic,
  Briefcase,
  Settings,
  Crown
} from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["talent", "manager", "agent", "producer", "admin"]),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Auth() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "talent",
    },
  });

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    // Redirect based on role
    switch (user.role) {
      case "admin":
        window.location.href = "/admin";
        break;
      case "talent":
        window.location.href = "/talent-dashboard";
        break;
      case "producer":
        window.location.href = "/producer-dashboard";
        break;
      case "manager":
        window.location.href = "/manager-dashboard";
        break;
      default:
        window.location.href = "/dashboard";
    }
    return null;
  }

  const onLogin = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const userData = await response.json();
        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${userData.username}`,
        });
        
        // Redirect based on role
        switch (userData.role) {
          case "admin":
            window.location.href = "/admin";
            break;
          case "talent":
            window.location.href = "/talent-dashboard";
            break;
          case "producer":
            window.location.href = "/producer-dashboard";
            break;
          case "manager":
            window.location.href = "/manager-dashboard";
            break;
          default:
            window.location.href = "/dashboard";
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Login failed",
          description: errorData.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const userData = await response.json();
        toast({
          title: "Account created!",
          description: `Welcome to the platform, ${userData.firstName}!`,
        });
        
        // Redirect to onboarding for new users
        window.location.href = "/onboarding";
      } else {
        const errorData = await response.json();
        toast({
          title: "Registration failed",
          description: errorData.message || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "talent":
        return <Star className="h-4 w-4" />;
      case "manager":
        return <Settings className="h-4 w-4" />;
      case "agent":
        return <Briefcase className="h-4 w-4" />;
      case "producer":
        return <Camera className="h-4 w-4" />;
      case "admin":
        return <Crown className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full px-4">
            {/* Hero Section */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Join the Entertainment Revolution
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Connect with talent, discover opportunities, and build your career in the entertainment industry.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <Theater className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">For Talent</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Showcase your skills</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <Briefcase className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">For Producers</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Find perfect matches</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <Settings className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">For Managers</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Manage your roster</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Smart matching</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Form */}
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  {activeTab === "login" ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription className="text-center">
                  {activeTab === "login" 
                    ? "Sign in to your account" 
                    : "Join the entertainment community"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="register">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="username"
                            placeholder="Enter your username"
                            className="pl-10"
                            {...loginForm.register("username")}
                          />
                        </div>
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                            {...loginForm.register("password")}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="First name"
                            {...registerForm.register("firstName")}
                          />
                          {registerForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500">
                              {registerForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Last name"
                            {...registerForm.register("lastName")}
                          />
                          {registerForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500">
                              {registerForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="username"
                            placeholder="Choose a username"
                            className="pl-10"
                            {...registerForm.register("username")}
                          />
                        </div>
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            {...registerForm.register("email")}
                          />
                        </div>
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="pl-10 pr-10"
                            {...registerForm.register("password")}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select 
                          value={registerForm.watch("role")} 
                          onValueChange={(value) => registerForm.setValue("role", value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="talent">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 mr-2" />
                                Talent
                              </div>
                            </SelectItem>
                            <SelectItem value="manager">
                              <div className="flex items-center">
                                <Settings className="h-4 w-4 mr-2" />
                                Manager
                              </div>
                            </SelectItem>
                            <SelectItem value="agent">
                              <div className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-2" />
                                Agent
                              </div>
                            </SelectItem>
                            <SelectItem value="producer">
                              <div className="flex items-center">
                                <Camera className="h-4 w-4 mr-2" />
                                Producer
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {registerForm.formState.errors.role && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.role.message}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
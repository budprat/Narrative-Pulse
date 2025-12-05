import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getNarratives, getNarrativeStats } from "@/services/narrative.service";
import type { Narrative, NarrativeStats } from "@/types/api";
import {
  Sparkles,
  Plus,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  Brain,
  TrendingUp,
  Clock,
  Image,
  User,
} from "lucide-react";

const toneIcons: Record<string, React.ReactNode> = {
  activist: <Zap className="h-4 w-4" />,
  scientific: <Brain className="h-4 w-4" />,
  political: <TrendingUp className="h-4 w-4" />,
  inspirational: <Sparkles className="h-4 w-4" />,
};

const toneColors: Record<string, string> = {
  activist: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  scientific: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  political: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  inspirational: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
};

const Dashboard = () => {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [stats, setStats] = useState<NarrativeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        const [narrativesResult, statsResult] = await Promise.all([
          getNarratives({ limit: 10, sortOrder: "desc" }),
          getNarrativeStats(),
        ]);

        if (!("error" in narrativesResult)) {
          setNarratives(narrativesResult.narratives);
        }

        if (!("error" in statsResult)) {
          setStats(statsResult);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, toast]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold gradient-text">NarrativePulse</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>{user?.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1">
            Transform your data into compelling narratives
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Narratives</p>
                <p className="text-2xl font-bold">{stats?.totalNarratives || 0}</p>
              </div>
            </CardContent>
          </Card>

          {Object.entries(stats?.toneBreakdown || {}).slice(0, 3).map(([tone, count]) => (
            <Card key={tone}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${toneColors[tone]}`}>
                  {toneIcons[tone]}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground capitalize">{tone}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="narratives" className="space-y-6">
          <TabsList>
            <TabsTrigger value="narratives" className="gap-2">
              <FileText className="h-4 w-4" />
              My Narratives
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Narratives Tab */}
          <TabsContent value="narratives">
            <Card>
              <CardHeader>
                <CardTitle>Recent Narratives</CardTitle>
                <CardDescription>
                  Your most recently generated narratives
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : narratives.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't created any narratives yet
                    </p>
                    <Link to="/#demo">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Narrative
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {narratives.map((narrative) => (
                      <div
                        key={narrative.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={toneColors[narrative.tone]}>
                                {toneIcons[narrative.tone]}
                                <span className="ml-1 capitalize">{narrative.tone}</span>
                              </Badge>
                              {narrative.hasVisual && (
                                <Badge variant="outline" className="gap-1">
                                  <Image className="h-3 w-3" />
                                  Visual
                                </Badge>
                              )}
                              {narrative.humanReviewed && (
                                <Badge variant="secondary">Reviewed</Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground line-clamp-2">
                              {narrative.outputText}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(narrative.createdAt).toLocaleDateString()}
                              </span>
                              <span>{narrative.generationTime}ms</span>
                              {narrative.tokenCount && (
                                <span>{narrative.tokenCount} tokens</span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Narrative</CardTitle>
                <CardDescription>
                  Use the demo on the homepage or upgrade to access full features
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Try our narrative generator on the homepage
                </p>
                <Link to="/#demo">
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Go to Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Track your narrative performance and impact
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Analytics dashboard coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Profile</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p>{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p>{user?.email}</p>
                    </div>
                    {user?.organization && (
                      <div>
                        <p className="text-muted-foreground">Organization</p>
                        <p>{user.organization.name}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Brand Voice</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure your organization's brand voice for consistent narratives
                  </p>
                  <Button variant="outline">Configure Brand Voice</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;

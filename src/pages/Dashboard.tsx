import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, Car } from "lucide-react";
import { BookRide } from "@/components/dashboard/BookRide";
import { RideHistory } from "@/components/dashboard/RideHistory";
import { DriverDashboard } from "@/components/dashboard/DriverDashboard";

export default function Dashboard() {
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function getUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserType(profile.user_type);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    getUserProfile();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userType === 'driver') {
    return <DriverDashboard />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <Tabs defaultValue="book" className="w-full">
        <TabsList>
          <TabsTrigger value="book">Book a Ride</TabsTrigger>
          <TabsTrigger value="history">Ride History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="book" className="space-y-4">
          <BookRide />
        </TabsContent>
        
        <TabsContent value="history">
          <RideHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
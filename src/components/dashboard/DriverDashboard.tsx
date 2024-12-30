import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ActiveRideCard } from "./ActiveRideCard";
import { AvailableRideCard } from "./AvailableRideCard";

interface Ride {
  id: string;
  created_at: string;
  status: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  estimated_price: number;
  passenger_id: string;
}

export function DriverDashboard() {
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvailableRides = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        // First check if driver has an active ride
        const { data: activeRides } = await supabase
          .from('rides')
          .select('*')
          .eq('driver_id', user.id)
          .in('status', ['accepted', 'in_progress'])
          .single();

        if (activeRides) {
          setActiveRide(activeRides);
        }

        const { data, error } = await supabase
          .from('rides')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAvailableRides(data || []);
      } catch (error) {
        console.error('Error fetching available rides:', error);
        toast({
          title: "Error",
          description: "Failed to load available rides",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableRides();

    // Subscribe to new rides and updates
    const channel = supabase
      .channel('public:rides')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rides' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
            setAvailableRides(current => [payload.new as Ride, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedRide = payload.new as Ride;
            setAvailableRides(current => 
              current.filter(ride => ride.id !== updatedRide.id)
            );
            if (['accepted', 'in_progress'].includes(updatedRide.status)) {
              setActiveRide(updatedRide);
            } else if (updatedRide.status === 'completed') {
              setActiveRide(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const acceptRide = async (rideId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('rides')
        .update({ 
          driver_id: user.id,
          status: 'accepted'
        })
        .eq('id', rideId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ride accepted successfully!",
      });
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast({
        title: "Error",
        description: "Failed to accept ride",
        variant: "destructive",
      });
    }
  };

  const updateRideStatus = async (status: string) => {
    if (!activeRide) return;

    try {
      const { error } = await supabase
        .from('rides')
        .update({ status })
        .eq('id', activeRide.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Ride ${status.replace('_', ' ')} successfully!`,
      });
    } catch (error) {
      console.error('Error updating ride status:', error);
      toast({
        title: "Error",
        description: "Failed to update ride status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activeRide) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Active Ride</h1>
        <ActiveRideCard ride={activeRide} onUpdateStatus={updateRideStatus} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Driver Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Rides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableRides.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No available rides at the moment</p>
            </div>
          ) : (
            availableRides.map((ride) => (
              <AvailableRideCard 
                key={ride.id} 
                ride={ride} 
                onAccept={acceptRide}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
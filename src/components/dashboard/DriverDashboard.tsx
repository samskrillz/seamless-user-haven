import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Ride {
  id: string;
  created_at: string;
  status: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  estimated_price: number;
}

export function DriverDashboard() {
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvailableRides = async () => {
      try {
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

    // Subscribe to new rides
    const channel = supabase
      .channel('public:rides')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'rides' },
        (payload) => {
          setAvailableRides(current => [payload.new as Ride, ...current]);
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

      setAvailableRides(current => 
        current.filter(ride => ride.id !== rideId)
      );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              <Card key={ride.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-2 h-4 w-4" />
                      {new Date(ride.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                      <span>
                        ({ride.pickup_latitude.toFixed(4)}, {ride.pickup_longitude.toFixed(4)})
                        {" → "}
                        ({ride.dropoff_latitude.toFixed(4)}, {ride.dropoff_longitude.toFixed(4)})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        ${ride.estimated_price || "N/A"}
                      </div>
                    </div>
                    <Button onClick={() => acceptRide(ride.id)}>
                      Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
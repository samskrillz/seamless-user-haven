import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";
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
  final_price: number;
}

export function RideHistory() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRides() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { data, error } = await supabase
          .from('rides')
          .select('*')
          .eq('passenger_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRides(data || []);
      } catch (error) {
        console.error('Error fetching rides:', error);
        toast({
          title: "Error",
          description: "Failed to load ride history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRides();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (rides.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Car className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No rides yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rides.map((ride) => (
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
            <div className="text-right">
              <div className="font-semibold">
                ${ride.final_price || ride.estimated_price || "N/A"}
              </div>
              <div className="text-sm text-gray-500 capitalize">{ride.status}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
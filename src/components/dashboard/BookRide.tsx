import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function BookRide() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBookRide = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // For now, we'll use dummy coordinates
      const ride = {
        passenger_id: user.id,
        pickup_latitude: 40.7128,
        pickup_longitude: -74.0060,
        dropoff_latitude: 40.7589,
        dropoff_longitude: -73.9851,
        status: "pending",
        vehicle_type: "standard",
      };

      const { error } = await supabase
        .from('rides')
        .insert([ride]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your ride has been booked!",
      });

      setPickup("");
      setDropoff("");
    } catch (error) {
      console.error('Error booking ride:', error);
      toast({
        title: "Error",
        description: "Failed to book ride",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Ride</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pickup">Pickup Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="pickup"
              placeholder="Enter pickup location"
              className="pl-10"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dropoff">Dropoff Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="dropoff"
              placeholder="Enter dropoff location"
              className="pl-10"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
            />
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleBookRide}
          disabled={loading || !pickup || !dropoff}
        >
          {loading ? (
            <span className="flex items-center">
              <Car className="mr-2 h-4 w-4 animate-bounce" />
              Booking...
            </span>
          ) : (
            <span className="flex items-center">
              <Car className="mr-2 h-4 w-4" />
              Book Ride
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
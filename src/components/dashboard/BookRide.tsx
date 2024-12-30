import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LocationMap } from "../map/LocationMap";

export function BookRide() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const { toast } = useToast();

  const calculateEstimatedPrice = (pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }) => {
    // Simple price estimation based on distance
    const R = 6371; // Earth's radius in km
    const dLat = (dropoff.lat - pickup.lat) * Math.PI / 180;
    const dLon = (dropoff.lng - pickup.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pickup.lat * Math.PI / 180) * Math.cos(dropoff.lat * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Base price + price per km
    return Math.round((5 + distance * 2) * 100) / 100;
  };

  const handleBookRide = async () => {
    try {
      if (!pickupCoords || !dropoffCoords) {
        toast({
          title: "Error",
          description: "Please select pickup and dropoff locations on the map",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const ride = {
        passenger_id: user.id,
        pickup_latitude: pickupCoords.lat,
        pickup_longitude: pickupCoords.lng,
        dropoff_latitude: dropoffCoords.lat,
        dropoff_longitude: dropoffCoords.lng,
        status: "pending",
        vehicle_type: "standard",
        estimated_price: estimatedPrice,
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
      setPickupCoords(null);
      setDropoffCoords(null);
      setEstimatedPrice(null);
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

  const handlePickupSelect = (lat: number, lng: number) => {
    setPickupCoords({ lat, lng });
    if (dropoffCoords) {
      const price = calculateEstimatedPrice({ lat, lng }, dropoffCoords);
      setEstimatedPrice(price);
    }
  };

  const handleDropoffSelect = (lat: number, lng: number) => {
    setDropoffCoords({ lat, lng });
    if (pickupCoords) {
      const price = calculateEstimatedPrice(pickupCoords, { lat, lng });
      setEstimatedPrice(price);
    }
  };

  const markers = [
    ...(pickupCoords ? [{ ...pickupCoords, color: '#00FF00' }] : []),
    ...(dropoffCoords ? [{ ...dropoffCoords, color: '#FF0000' }] : []),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Ride</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LocationMap 
          markers={markers}
          onLocationSelect={(lat, lng) => {
            if (!pickupCoords) {
              handlePickupSelect(lat, lng);
            } else if (!dropoffCoords) {
              handleDropoffSelect(lat, lng);
            }
          }}
        />

        <div className="space-y-2">
          <Label htmlFor="pickup">Pickup Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="pickup"
              placeholder="Click on map to select pickup location"
              className="pl-10"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              disabled
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dropoff">Dropoff Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="dropoff"
              placeholder="Click on map to select dropoff location"
              className="pl-10"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              disabled
            />
          </div>
        </div>

        {estimatedPrice && (
          <div className="text-lg font-semibold text-center">
            Estimated Price: ${estimatedPrice}
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={handleBookRide}
          disabled={loading || !pickupCoords || !dropoffCoords}
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
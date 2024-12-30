import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";
import { LocationMap } from "../map/LocationMap";

interface Ride {
  id: string;
  created_at: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  estimated_price: number;
}

interface AvailableRideCardProps {
  ride: Ride;
  onAccept: (rideId: string) => void;
}

export function AvailableRideCard({ ride, onAccept }: AvailableRideCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <LocationMap 
          markers={[
            { lat: ride.pickup_latitude, lng: ride.pickup_longitude, color: '#00FF00' },
            { lat: ride.dropoff_latitude, lng: ride.dropoff_longitude, color: '#FF0000' },
          ]}
          center={[ride.pickup_longitude, ride.pickup_latitude]}
        />
        
        <div className="flex items-center justify-between">
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
                ${ride.estimated_price}
              </div>
            </div>
            <Button onClick={() => onAccept(ride.id)}>
              Accept
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
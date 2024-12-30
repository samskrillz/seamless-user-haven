import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";
import { LocationMap } from "../map/LocationMap";

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

interface ActiveRideCardProps {
  ride: Ride;
  onUpdateStatus: (status: string) => void;
}

export function ActiveRideCard({ ride, onUpdateStatus }: ActiveRideCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Ride</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <div className="text-right">
            <div className="font-semibold">
              ${ride.estimated_price}
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {ride.status.replace('_', ' ')}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {ride.status === 'accepted' && (
            <Button 
              className="flex-1"
              onClick={() => onUpdateStatus('in_progress')}
            >
              Start Ride
            </Button>
          )}
          {ride.status === 'in_progress' && (
            <Button 
              className="flex-1"
              onClick={() => onUpdateStatus('completed')}
            >
              Complete Ride
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
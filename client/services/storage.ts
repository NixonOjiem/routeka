import { Ride, RouteRequest } from "../types";

const STORAGE_KEYS = {
  REQUESTS: "route_ka_requests",
  RIDES: "route_ka_rides",
};

export const storageService = {
  // Simulated email dispatch function
  sendEmailNotification: async (
    recipient: string,
    subject: string,
    data: any,
  ) => {
    console.log(
      `%c[SIMULATED EMAIL SERVICE] Dispatching to ${recipient}`,
      "color: #497487; font-weight: bold; border: 1px solid #497487; padding: 4px; border-radius: 4px;",
    );
    console.log(`Subject: ${subject}`);
    console.log(`Payload:`, data);

    // Simulate network latency for the "email" being sent
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true };
  },

  // Route Requests (The "Backend" for the Arrange Route form)
  saveRouteRequest: async (
    request: Omit<RouteRequest, "id" | "status" | "createdAt">,
  ): Promise<RouteRequest> => {
    const requests = storageService.getRouteRequests();
    const newRequest: RouteRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Persist locally for the session
    const updatedRequests = [newRequest, ...requests];
    localStorage.setItem(
      STORAGE_KEYS.REQUESTS,
      JSON.stringify(updatedRequests),
    );

    // Dispatch email to team
    await storageService.sendEmailNotification(
      "team@routeka.com",
      `New Route Request: ${newRequest.name} (${newRequest.frequency})`,
      newRequest,
    );

    return newRequest;
  },

  getRouteRequests: (): RouteRequest[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  // Custom Rides
  saveRide: async (ride: Ride): Promise<void> => {
    const rides = storageService.getCustomRides();
    const updatedRides = [ride, ...rides];
    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(updatedRides));

    // Dispatch email to team
    await storageService.sendEmailNotification(
      "team@routeka.com",
      `New Ride Offer: ${ride.driver.name} from ${ride.origin}`,
      ride,
    );
  },

  getCustomRides: (): Ride[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RIDES);
    return data ? JSON.parse(data) : [];
  },
};

export type ViewState = "home" | "request" | "rides" | "profile";
export type NotificationType = "success" | "error";

export enum CommunityGroup {
  UNIVERSITY = "University",
  CORPORATE_PARK = "Corporate Park",
  NEIGHBORHOOD = "Neighborhood",
  RESIDENTIAL = "Residential Complex",
}

export interface Driver {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  community: CommunityGroup;
  verified: boolean;
}

export interface Ride {
  id: string;
  driver: Driver;
  origin: string;
  destination: string;
  date: string; // ISO string
  time: string; // "08:30 AM"
  seatsAvailable: number;
  costPerSeat: number; // 0 for free
  description: string;
  tags: string[];
}

export interface RouteRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  frequency: string;
  pickup: string;
  dropoff: string;
  status: "pending" | "matched" | "completed";
  createdAt: string;
}

export interface GeminiMatchResponse {
  matchedRideIds: string[];
  reasoning: string;
}

import axios from "axios";
import { useState } from "react";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface RideRequestData {
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  commute_time: string;
  frequency: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
}

interface ApiRideRequestData {
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  commute_time: string;
  frequency: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  user_id?: string | null;
  name?: string;
  email?: string;
  phone?: string;
  category: string;
}

export const rideRequestService = {
  /**
   * Submit a ride request to the API
   */
  /**
   * Retrieves or generates a Guest ID from localStorage
   */
  getOrCreateGuestId() {
    let guestId = localStorage.getItem("chat_guest_id");
    if (!guestId) {
      guestId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("chat_guest_id", guestId);
    }
    return guestId;
  },

  async submitRideRequest(data: ApiRideRequestData) {
    try {
      const payload = {
        pickup: { lat: data.pickup_lat, lng: data.pickup_lng },
        dropoff: { lat: data.dropoff_lat, lng: data.dropoff_lng },
        commute_time: this.formatCommuteTime(data.commute_time),
        frequency: this.capitalizeFrequency(data.frequency),
        category: data.category,
        // No guest fields sent anymore
      };

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/rides/request`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      // Check if the error is 401 (Unauthorized/Expired)
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect to signin
        window.location.href = "/signin";
      }

      // Check for unverified email (403)
      if (error.response?.status === 403) {
        console.error("Email not verified");
      }

      throw error;
    }
  },

  /**
   * Get user's ride requests
   */
  async getUserRideRequests(userId: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/ride-requests`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch ride requests:", error);
      throw error;
    }
  },

  /**
   * Format datetime to match API expected format
   */
  formatCommuteTime(datetimeLocal: string): string {
    if (!datetimeLocal) return "";

    // Convert from "YYYY-MM-DDTHH:MM" to "YYYY-MM-DD HH:MM:00"
    const date = new Date(datetimeLocal);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:00`;
  },

  /**
   * Capitalize frequency for API
   */
  capitalizeFrequency(frequency: string): string {
    if (!frequency) return "";
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  },

  /**
   * Cancel a ride request
   */
  async cancelRideRequest(requestId: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/ride-requests/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to cancel ride request:", error);
      throw error;
    }
  },
};

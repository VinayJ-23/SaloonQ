// utils/BarberStorage.web.ts - Web version using localStorage
import { auth, getData, signOut } from "@/firebase";
import { router } from "expo-router";

export interface BarberData {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  storeName: string;
  servicesPro: string[];
  status: string;
  updatedAt?: string;
}

const BARBER_STORAGE_KEY = "barberData";

export class BarberStorage {
  // ✅ Save barber data to localStorage
  static async saveBarberData(barberData: BarberData): Promise<void> {
    try {
      localStorage.setItem(BARBER_STORAGE_KEY, JSON.stringify(barberData));
      console.log("✅ Barber data saved (web localStorage)");
    } catch (error) {
      console.error("Error saving barber data:", error);
    }
  }

  // ✅ Get barber data from localStorage
  static async getBarberData(): Promise<BarberData | null> {
    try {
      const barberData = localStorage.getItem(BARBER_STORAGE_KEY);
      return barberData ? JSON.parse(barberData) : null;
    } catch (error) {
      console.error("Error getting barber data:", error);
      return null;
    }
  }

  // ✅ Fetch fresh barber data from Firestore and save locally
  static async fetchAndSaveBarberData(uid: string): Promise<BarberData | null> {
    try {
      const barberSnap = await getData("barber", uid);

      if (barberSnap.exists()) {
        const { uid: _ignore, ...rest } = barberSnap.data() as BarberData;
        const barberData: BarberData = {
          uid,
          ...rest,
        };
        await this.saveBarberData(barberData);
        return barberData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching barber data:", error);
      return null;
    }
  }

  // ✅ Clear barber data
  static async clearBarberData(): Promise<void> {
    try {
      localStorage.removeItem(BARBER_STORAGE_KEY);
      console.log("✅ Barber data cleared (web)");
    } catch (error) {
      console.error("Error clearing barber data:", error);
    }
  }

  // ✅ Logout function
  static async logout(): Promise<void> {
    try {
      await this.clearBarberData();
      await signOut(auth);
      console.log("✅ Barber logged out (web)");
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  }

  // ✅ Update specific barber data fields in local storage
  static async updateBarberData(updates: Partial<BarberData>): Promise<void> {
    try {
      const currentData = await this.getBarberData();
      if (currentData) {
        const updatedData = { ...currentData, ...updates };
        await this.saveBarberData(updatedData);
      }
    } catch (error) {
      console.error("Error updating barber data:", error);
    }
  }

  // ✅ Check if barber is logged in
  static async isLoggedIn(): Promise<boolean> {
    const barberData = await this.getBarberData();
    return barberData !== null;
  }
}

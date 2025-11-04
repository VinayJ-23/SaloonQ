// utils/UserStorage.web.ts
import { auth, signOut } from "@/firebase";
import { router } from "expo-router";

export interface UserData {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
}

const USER_STORAGE_KEY = "userData";

export class UserStorage {
  // Save user data to localStorage (web)
  static async saveUserData(userData: UserData): Promise<void> {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      console.log("✅ User data saved locally (web)");
    } catch (error) {
      console.error("Error saving user data (web):", error);
    }
  }

  // Get user data from localStorage (web)
  static async getUserData(): Promise<UserData | null> {
    try {
      const userData = localStorage.getItem(USER_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data (web):", error);
      return null;
    }
  }

  // Clear user data (for logout)
  static async clearUserData(): Promise<void> {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      console.log("✅ User data cleared (web)");
    } catch (error) {
      console.error("Error clearing user data (web):", error);
    }
  }

  // Logout function
  static async logout(): Promise<void> {
    try {
      await this.clearUserData();
      await signOut(auth); // Web modular signOut
      console.log("✅ User logged out successfully (web)");
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout (web):", error);
      throw error;
    }
  }

  // Update specific user data fields
  static async updateUserData(updates: Partial<UserData>): Promise<void> {
    try {
      const currentData = await this.getUserData();
      if (currentData) {
        const updatedData = { ...currentData, ...updates };
        await this.saveUserData(updatedData);
      }
    } catch (error) {
      console.error("Error updating user data (web):", error);
    }
  }

  // Check if user is logged in (has local data)
  static async isLoggedIn(): Promise<boolean> {
    const userData = await this.getUserData();
    return userData !== null;
  }
}

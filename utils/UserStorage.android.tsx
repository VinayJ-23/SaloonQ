// utils/UserStorage.tsx - Native SDK version with safe UID handling
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { auth, signOut } from "../firebase";

export interface UserData {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
}

const USER_STORAGE_KEY = "userData";

export class UserStorage {
  // Save user data to AsyncStorage
  static async saveUserData(userData: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      console.log("✅ User data saved locally");
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  }

  // Get user data from AsyncStorage
  static async getUserData(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Clear user data (for logout)
  static async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      console.log("✅ User data cleared");
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  }

  // Logout function
  static async logout(): Promise<void> {
    try {
      await this.clearUserData();
      await signOut(auth); // Native modular signOut
      console.log("✅ User logged out successfully");
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  }

  // Update specific user data fields in local storage
  static async updateUserData(updates: Partial<UserData>): Promise<void> {
    try {
      const currentData = await this.getUserData();
      if (currentData) {
        const updatedData = { ...currentData, ...updates };
        await this.saveUserData(updatedData);
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  }

  // Check if user is logged in (has local data)
  static async isLoggedIn(): Promise<boolean> {
    const userData = await this.getUserData();
    return userData !== null;
  }
}

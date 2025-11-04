import { showActionToast } from "@/components/GlobalActionToast";
import { Toast } from '@/components/ToastContainer';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Modular imports (web-style API)
import { firestore, getData, setData, updateData, } from "@/firebase";
import {
  doc,
  onSnapshot
} from '@react-native-firebase/firestore';

import MyInput from "@/components/MyInput";
import { BarberData, BarberStorage } from '@/utils/BarberStorage';

interface Customer {
  name: string;
  phone: string;
  email?: string;
  joinedAt: string;
  services?: string[];
}

export default function BarberHome() {
  const [queueStarted, setQueueStarted] = useState(false);
  const [barberData, setBarberData] = useState<BarberData | null>(null);
  const [waitingCount, setWaitingCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);


  // Form state interface for type safety
  interface CustomerForm {
    name: string;
    phone: string;
    email: string;
    services: string[];
  }

  const [custForm, setCustForm] = useState<CustomerForm>({
    name: "",
    phone: "",
    email: "",
    services: [],
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadBarber = async () => {
      try {
        const data = await BarberStorage.getBarberData();
        if (data) {
          setBarberData(data);
          await checkQueueStatus(data.uid);
          unsubscribe = listenToQueue(data.uid);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading barber data:", error);
        setLoading(false);
      }
    };

    loadBarber();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const checkQueueStatus = async (uid: string) => {
    try {
      const docSnap = await getData("barber", uid);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
          setQueueStarted(data.status === "open");
        }
      }
    } catch (err) {
      console.error("Error checking queue status", err);
    }
  };

  const listenToQueue = (uid: string) => {
    const qDocRef = doc(firestore, "queue", uid);
    return onSnapshot(qDocRef, (snapshot) => {
      const data = snapshot.data();
      const customersArr: Customer[] = (data?.customers as Customer[]) ?? [];
      setWaitingCount(customersArr.length);
    });
  };

  const handleStartQueue = async () => {
    if (!barberData) return;

    showActionToast({
      message: "Exit Queue? ",
      onConfirm: async () => {
        try {
          const updateValue = { status: "open" }
          await updateData("barber", barberData.uid, updateValue);

          // ensure queue document exists
          const barberObj = {
            barberId: barberData.uid,
            createdAt: new Date().toISOString(),
          }
          await setData("queue", barberData.uid, barberObj);

          setQueueStarted(true);
        } catch (err) {
          console.error("Error updating queue status to open:", err);
          Toast.error("Failed to start queue. Please try again.");
        }
      },
    });
  };

  const handleStopQueue = async () => {
    if (!barberData) return;

    showActionToast({
      message: "Stop Queue? ",
      onConfirm: async () => {
        try {
          const statusClosed = {
            status: "closed",
          }
          await updateData("barber", barberData.uid, statusClosed);
          setQueueStarted(false);
        } catch (err) {
          console.error("Error updating queue status to closed:", err);
          Toast.error("Failed to stop queue. Please try again.");
        }
      },
    }
    );
  };

  const clearForm = () => {
    setCustForm({ name: "", phone: "", email: "", services: [] });
  };

  const closeModal = () => {
    setModalVisible(false);
    clearForm();
  };

  const handleAddCustomer = async () => {
    if (!barberData) return;

    if (!custForm.name.trim() || !custForm.phone.trim()) {
      Toast.error("Customer name and phone number are required.");
      return;
    }

    try {
      const nowISO = new Date().toISOString();

      const entry = {
        name: "💈" + custForm.name.trim(),
        phone: custForm.phone.trim(),
        joinedAt: nowISO,
        ...(custForm.services.length > 0 && { services: custForm.services }),
      };

      const snap = await getData("queue", barberData.uid);

      if (!snap.exists()) {
        // Queue does not exist yet — create new one
        const createBarberq = {
          barberId: barberData.uid,
          createdAt: nowISO,
          customers: [entry],
        }
        await setData("queue", barberData.uid, createBarberq);
      } else {
        const data = snap.data()!;
        const arr = Array.isArray(data.customers) ? [...data.customers] : [];

        // Prevent duplicate join
        const phoneExists = arr.some(c => c.phone === custForm.phone.trim());
        if (phoneExists) {
          throw new Error("CUSTOMER_ALREADY_EXISTS");
        }

        arr.push(entry);
        await updateData("queue", barberData.uid, { customers: arr });
      }

      Toast.success('Customer has been added to the queue.');
      closeModal();

    } catch (err: any) {
      if (err.message === "CUSTOMER_ALREADY_EXISTS") {
        Toast.error('Customer already present in queue.');
      } else {
        console.error("Error adding customer", err);
        Toast.error("Failed to add customer. Please try again.");
      }
    }
  };

  const handleViewQueue = () => {
    router.replace("/barber_queue");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000ff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {barberData?.storeName || "Barber Dashboard"}
        </Text>

        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: queueStarted ? "#00ff08ff" : "#F44336" }
            ]} />
            <Text style={styles.statusText}>
              {queueStarted ? "Queue Open" : "Queue Closed"}
            </Text>
          </View>

          {waitingCount > 0 && (
            <View style={styles.waitingBadge}>
              <Ionicons name="people-outline" size={20} color="#000000ff" />
              <Text style={styles.waitingText}>{waitingCount} </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.mainContent}>
        {!queueStarted ? (
          <View style={styles.startContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="play-circle" size={80} color="#202020ff" />
            </View>
            <Text style={styles.startTitle}>Ready to Start?</Text>
            <Text style={styles.startDescription}>
              Open your queue to start accepting customer bookings
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={handleStartQueue}>
              <Ionicons name="play" size={20} color="#0a0a0f" />
              <Text style={styles.startButtonText}>Start Queue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeContainer}>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionCard} onPress={handleViewQueue}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="list" size={32} color="#474747ff" style={styles.rotatedIcon} />
                </View>
                <Text style={styles.actionTitle}>View Queue</Text>
                <Text style={styles.actionDescription}>
                  See all {waitingCount} customers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setModalVisible(true)}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="person-add" size={32} color="#474747ff" />
                </View>
                <Text style={styles.actionTitle}>Add Customer</Text>
                <Text style={styles.actionDescription}>
                  Walk-in customer
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.stopButton} onPress={handleStopQueue}>
              <Ionicons name="stop" size={20} color="#F44336" />
              <Text style={styles.stopButtonText}>Stop Queue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add Customer Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Walk-in Customer</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
              >
                <Ionicons name="close" size={24} color="#9aa0a6" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <MyInput
                  placeholder="Enter full name"
                  value={custForm.name}
                  icon="person-outline"
                  onChangeText={(t) => setCustForm({ ...custForm, name: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <MyInput
                  placeholder="Enter phone number"
                  value={custForm.phone}
                  keyboardType="phone-pad"
                  icon="call-outline"
                  onChangeText={(t) => setCustForm({ ...custForm, phone: t })}
                />
              </View>

              {barberData?.servicesPro && barberData.servicesPro.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Services</Text>
                  <FlatList
                    data={barberData.servicesPro}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.servicesContainer}
                    renderItem={({ item }) => {
                      const isSelected = custForm.services.includes(item);
                      return (
                        <TouchableOpacity
                          style={[
                            styles.serviceChip,
                            isSelected && styles.serviceChipActive,
                          ]}
                          onPress={() => {
                            const newServices = isSelected
                              ? custForm.services.filter(s => s !== item)
                              : [...custForm.services, item];
                            setCustForm({ ...custForm, services: newServices });
                          }}
                        >
                          <Text
                            style={[
                              styles.serviceText,
                              isSelected && styles.serviceTextActive,
                            ]}
                          >
                            {item}
                          </Text>

                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddCustomer}
              >
                <Ionicons name="checkmark" size={20} color="#0a0a0f" />
                <Text style={styles.saveButtonText}>Add     </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    color: "#1e40af",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 20,
    fontFamily:"b"
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    elevation: 2,
  },
  statusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  waitingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff4fdff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    elevation: 2,
  },
  waitingText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e3a8a",
  },

  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Start Queue State
  startContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  startDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 6,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },

  // Active Queue State
  activeContainer: {
    flex: 1,
    paddingTop: 40,
  },
  actionGrid: {
    flexDirection: "column",
    gap: 16,
  },

  actionCard: {
    flex: 1,
    backgroundColor: "#f4f9ffff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 140
  },
  actionIconContainer: {
    marginBottom: 16,
  },
  rotatedIcon: {
    transform: [{ rotate: '90deg' }],
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },

  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f87171",
    gap: 8,
    marginTop: "auto",
    marginBottom: 40,
    bottom: 50,
    elevation: 2,
    shadowColor: "#000000ff",
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#dc2626",
    letterSpacing: 0.5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    elevation: 15,
    borderWidth: 4,
    borderColor: "#6da8ffff",
    maxHeight: '90%',
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1.5,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  servicesContainer: {
    gap: 8,
  },
  serviceChip: {
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
  },
  serviceChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#1e40af",
  },
  serviceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  serviceTextActive: {
    color: "#ffffff",
  },
  modalActions: {
    flexDirection: "row",
    gap: 6,
    padding: 10,
    borderTopWidth: 1.5,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6b7280",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000000ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
    borderColor: "#ecececff",
    borderWidth: 1.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Error Modal Styles
  errorModalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    elevation: 20,
    borderWidth: 2,
    borderColor: "#f87171",
    maxWidth: 320,
    alignSelf: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  errorHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#dc2626",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
    shadowColor: "#b91c1c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
});
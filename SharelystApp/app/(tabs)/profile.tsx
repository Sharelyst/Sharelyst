// app/(tabs)/profile.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      <View style={styles.pfpLarge}>
        <Text style={styles.pfpLargeText}>MZ</Text>
      </View>

      <Text style={styles.username}>Muhammad Zamin</Text>
      <Text style={styles.email}>example@email.com</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 80 },
  pfpLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  pfpLargeText: { color: "#fff", fontSize: 40, fontWeight: "700" },
  username: { fontSize: 22, fontWeight: "700", marginTop: 20 },
  email: { fontSize: 16, color: "#777", marginBottom: 40 },
  logoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
  },
  logoutBtnText: { color: "white", fontSize: 16, fontWeight: "600" },
});

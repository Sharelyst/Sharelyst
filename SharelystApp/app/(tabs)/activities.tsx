// app/(tabs)/activities.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivitiesScreen() {
  const activities = [
    { id: 1, title: "Dinner at GrillHouse", amount: "$42.50", people: ["MZ", "AB"] },
    { id: 2, title: "Coffee Run", amount: "$8.00", people: ["JK"] },
    { id: 3, title: "Snacks & Drinks", amount: "$19.25", people: ["RS", "TT"] },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Recent Activity</Text>

      {activities.map((a) => (
        <View key={a.id} style={styles.card}>
          <Text style={styles.cardTitle}>{a.title}</Text>
          <Text style={styles.cardAmount}>{a.amount}</Text>

          <View style={styles.pfpRow}>
            {a.people.map((p, index) => (
              <View key={index} style={styles.pfp}>
                <Text style={styles.pfpText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  card: {
    backgroundColor: "#f1f1f1",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  cardAmount: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  pfpRow: { flexDirection: "row", gap: 10 },
  pfp: {
    width: 40,
    height: 40,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  pfpText: { color: "#fff", fontWeight: "600" },
});

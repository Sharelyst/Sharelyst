// app/(tabs)/home.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  // Placeholder
  const people = ["MZ", "AB", "JK", "RS", "TT"]; // > 4 will show ...

  const recentActivities = [
    {
      id: 1,
      title: "Dinner at GrillHouse",
      people: ["MZ", "AB"],
      amount: "$42.50",
    },
    {
      id: 2,
      title: "Coffee Run",
      people: ["JK"],
      amount: "$8.00",
    },
  ];

  const displayedPeople = people.slice(0, 4);
  const hasOverflow = people.length > 4;

  return (
    <ScrollView style={styles.container}>
      {/* Top Total Bill Image Background */}
      <ImageBackground
        source={{ uri: "https://picsum.photos/800/400" }}
        style={styles.billBackground}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.billOverlay}>
          <Text style={styles.billTitle}>Total Bill</Text>
          <Text style={styles.billAmount}>$123.45</Text>

          <TouchableOpacity
            style={styles.splitButton}
            onPress={() => router.push("/split-bill")}
          >
            <Text style={styles.splitButtonText}>Split Bill</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* List of People */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>List of People</Text>
          <TouchableOpacity onPress={() => router.push("/people")}>
            <Text style={styles.linkText}>More</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.peopleRow}>
          {displayedPeople.map((p, index) => (
            <View key={index} style={styles.pfpCircle}>
              <Text style={styles.pfpText}>{p}</Text>
            </View>
          ))}

          {hasOverflow && (
            <View style={styles.pfpCircle}>
              <Text style={styles.pfpText}>...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push("/activities")}>
            <Text style={styles.linkText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentActivities.map((item) => (
          <View key={item.id} style={styles.activityCard}>
            <View style={styles.activityPeopleRow}>
              {item.people.map((p, index) => (
                <View key={index} style={styles.pfpSmall}>
                  <Text style={styles.pfpSmallText}>{p}</Text>
                </View>
              ))}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.activityTitle}>{item.title}</Text>
            </View>

            <Text style={styles.activityAmount}>{item.amount}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  billBackground: {
    height: 200,
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  billOverlay: {
    padding: 16,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  billAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 4,
  },
  splitButton: {
    alignSelf: "flex-end",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 6,
  },
  splitButtonText: {
    color: "#007AFF",
    fontWeight: "600",
  },

  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  linkText: {
    fontSize: 14,
    color: "#007AFF",
  },

  peopleRow: {
    flexDirection: "row",
    gap: 10,
  },
  pfpCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  pfpText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    marginBottom: 12,
  },
  activityPeopleRow: {
    flexDirection: "row",
    marginRight: 10,
  },
  pfpSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  pfpSmallText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
});

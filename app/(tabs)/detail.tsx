import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const API_ENDPOINT = "https://672263622108960b9cc43af6.mockapi.io/players";

const DetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { playerId } = params;
  const [playerDetail, setPlayerDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null); // State for filter rating

  useEffect(() => {
    const fetchPlayerDetail = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/${playerId}`);
        setPlayerDetail(response.data);
      } catch (error) {
        setError("Failed to load art details. Please try again later.");
      }
    };

    const fetchData = async () => {
      setLoading(true);
      setPlayerDetail(null);
      setError(null);

      if (playerId) {
        await Promise.all([fetchPlayerDetail()]);
      } else {
        setError("Player ID is undefined. Please try again.");
      }

      setLoading(false);
    };

    fetchData();
  }, [playerId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#252f3e" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#252f3e" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image
            source={{ uri: playerDetail.image }}
            style={styles.image}
            resizeMode="contain"
          />

          {playerDetail.isCaptain && (
            <View
              style={[
                styles.captainFlag,
                { flexDirection: "row", alignItems: "center" },
              ]}
            >
              <Ionicons name="ribbon" size={24} color="#252f3e" />
              <Text
                style={{ marginLeft: 5, color: "#252f3e", fontWeight: "bold" }}
              >
                Captain
              </Text>
            </View>
          )}

          <Text style={styles.playerName}>{playerDetail.playerName} </Text>

          <Text style={styles.brand}>{playerDetail.teamName} Club</Text>

          <Text style={styles.position}>{playerDetail.position}</Text>
          <Text style={styles.age}>Age | {playerDetail.age}</Text>
          <Text style={styles.accuracy}>
            Accuracy | {playerDetail.passingAccuracy} %
          </Text>
          <Text style={styles.minPlayed}>
            Played | {playerDetail.minutesPlayed} minutes
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 15,
    borderBottomColor: "#ddd",
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  backButtonText: { fontSize: 16, marginLeft: 5 },
  scrollContainer: { flexGrow: 1, padding: 20 },
  container: { alignItems: "flex-start" },
  image: { width: 200, height: 200, marginBottom: 20, alignSelf: "center", borderRadius: 12 },
  playerName: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "left",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  originalPrice: {
    fontSize: 18,
    color: "#333",
    textDecorationLine: "line-through",
    marginRight: 10,
    fontWeight: "600",
  },
  position: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "left",
    overflow: "hidden",
    padding: 5,
    marginBottom: 5,
    backgroundColor: "#CCC",
    borderRadius: 4,
  },
  accuracy: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "left",
    overflow: "hidden",
    marginBottom: 5,
  },
  minPlayed: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "left",
    overflow: "hidden",
    marginBottom: 5,
  },
  captainFlag: {
    alignItems: "center",
    height: 24,
  },
  age: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "left",
    overflow: "hidden",
    paddingBottom: 5,
  },
  discountedPrice: { fontSize: 18, color: "red", fontWeight: "600" },
  saleIcon: { marginLeft: 5 },
  description: { fontSize: 16, textAlign: "left", marginBottom: 10 },
  brand: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 10,
    textAlign: "left",
    fontWeight: "600",
  },
  error: { color: "red", textAlign: "center", margin: 20 },
  ratingSection: { marginTop: 20, width: "100%", textAlign: "right" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "left",
  },
  stars: { flexDirection: "row" },
  star: { fontSize: 18 },
  commentsSection: { marginTop: 20, width: "100%" },
  commentCard: {
    backgroundColor: "#FFD69950",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: "#ddd",
  },
  commentRating: { fontSize: 16, textAlign: "left", fontWeight: "600" },
  commentText: { fontSize: 16, marginTop: 5 },
  filterSection: { marginTop: 20, width: "100%" },
  filter: { fontSize: 16, paddingVertical: 10 },
  selectedFilter: {
    fontSize: 16,
    paddingVertical: 10,
    fontWeight: "bold",
    color: "blue",
  },
});

export default DetailScreen;

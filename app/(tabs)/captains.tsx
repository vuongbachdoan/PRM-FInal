import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useMyData from "@/hooks/useMyData";

type CaptainsScreenProps = {
  navigation: NavigationProp<any>;
};

const CaptainsScreen: React.FC<CaptainsScreenProps> = () => {
  const { players } = useMyData();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [captains, setCaptains] = useState(players);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadFavorites();
    filterAndSortCaptains();
  }, [players]);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load favorites", error);
      setLoading(false);
    }
  };

  const storeFavorites = async (updatedFavorites: string[]) => {
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error("Failed to save favorites", error);
    }
  };

  const filterAndSortCaptains = () => {
    const filteredCaptains = players
      .filter((player) => player.isCaptain && player.age > 34)
      .sort((a, b) => a.minutesPlayed - b.minutesPlayed);
    setCaptains(filteredCaptains);
  };

  const toggleFavorite = (id: string) => {
    const isFavorite = favorites.includes(id);
    const action = isFavorite ? "remove from" : "add to";

    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${action} favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            const updatedFavorites = isFavorite
              ? favorites.filter((fav) => fav !== id)
              : [...favorites, id];
            setFavorites(updatedFavorites);
            storeFavorites(updatedFavorites);
          },
        },
      ]
    );
  };

  const clearFavorites = () => {
    Alert.alert(
      "Clear Favorites",
      "Are you sure you want to remove all players from favorites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            setFavorites([]);
            storeFavorites([]);
          },
        },
      ]
    );
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const filteredCaptains = players.filter((player) =>
        player.playerName.toLowerCase().includes(text.toLowerCase())
      );
      setCaptains(filteredCaptains);
    } else {
      filterAndSortCaptains();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const renderCaptain = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() =>
        router.push({ pathname: "/detail", params: { playerId: item.id } })
      }
      accessibilityLabel={`View details of ${item.playerName}`}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        accessibilityLabel="Player image"
      />
      <Text style={styles.playerName} numberOfLines={2}>
        {item.playerName}
      </Text>
      <View style={styles.textContainer}>
        <View style={styles.detailsContainer}>
          <Text style={styles.teamName} numberOfLines={1}>
            Age: {item.age}
          </Text>
          <Text style={styles.teamName} numberOfLines={1}>
            Minutes Played: {item.minutesPlayed}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.favoriteIcon}
        onPress={() => toggleFavorite(item.id)}
        accessibilityLabel={`Mark ${item.playerName} as favorite`}
      >
        <Ionicons
          name={favorites.includes(item.id) ? "heart" : "heart-outline"}
          size={24}
          color="#FF9900"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TextInput
        style={styles.searchBox}
        placeholder="Search captains..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <FlatList
            data={captains}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCaptain}
            ListEmptyComponent={
              <Text style={styles.emptyMessage}>No captains found!</Text>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
              <TouchableOpacity
                style={styles.clearFavoritesButton}
                onPress={clearFavorites}
              >
                <Text style={styles.clearFavoritesText}>
                  Clear All Favorites
                </Text>
              </TouchableOpacity>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  searchBox: {
    height: 40,
    borderRadius: 8,
    margin: 10,
    paddingHorizontal: 10,
    backgroundColor: "#FAFAFA",
  },
  cardContainer: {
    flex: 1,
    margin: 10,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 5,
    resizeMode: "contain",
  },
  textContainer: {
    alignItems: "flex-start",
    marginBottom: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    overflow: "hidden",
    paddingBottom: 5,
    marginTop: 5,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  teamName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#808080",
    overflow: "hidden",
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  clearFavoritesButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#FF9900",
    alignItems: "center",
    borderRadius: 8,
    margin: 8,
  },
  clearFavoritesText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CaptainsScreen;

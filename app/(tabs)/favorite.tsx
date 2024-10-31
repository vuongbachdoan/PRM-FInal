import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import useMyData from "@/hooks/useMyData";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Player {
  id: string;
  playerName: string;
  teamName: string;
  position: string;
  age: number;
  passingAccuracy: number;
  minutesPlayed: number;
  image: string;
}

const FavoriteScreen: React.FC = () => {
  const router = useRouter();
  const { players } = useMyData();
  const [favoriteItems, setFavoriteItems] = useState<Player[]>([]);
  const [allFavoriteItems, setAllFavoriteItems] = useState<Player[]>([]); // New state for all favorites
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getData();
  }, [])

  // Fetch favorite items when the screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log("Favorite Focus")
      getData();
    }, [])
  );

  // Function to get favorites from AsyncStorage
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("favorites");
      const favoriteIds = jsonValue ? JSON.parse(jsonValue) : [];
      const items = players.filter((item) => favoriteIds.includes(item.id));
      setFavoriteItems(items);
      setAllFavoriteItems(items); // Store all favorites for search purposes
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  // Handle search functionality
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const filteredItems = allFavoriteItems.filter((item) =>
        item.playerName.toLowerCase().includes(text.toLowerCase())
      );
      setFavoriteItems(filteredItems);
    } else {
      setFavoriteItems(allFavoriteItems); // Reset to all favorites if search is cleared
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getData().then(() => setRefreshing(false));
  }, []);

  // Confirmation dialog for toggling favorites
  const confirmToggleFavorite = (itemId: string) => {
    Alert.alert(
      "Remove from Favorites",
      "Are you sure you want to remove this item from your favorites?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => toggleFavorite(itemId), style: "destructive" },
      ],
      { cancelable: true }
    );
  };

    const filterFavoriteItems = (favoriteIds: string[]) => {
    const items = players.filter((item) => favoriteIds.includes(item.id));
    setFavoriteItems(items);
  };

  // Function to toggle favorite status
  const toggleFavorite = async (itemId: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem("favorites");
      const favoriteIds = jsonValue ? JSON.parse(jsonValue) : [];

      const updatedFavorites = favoriteIds.includes(itemId)
        ? favoriteIds.filter((id: string) => id !== itemId)
        : [...favoriteIds, itemId];

      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      filterFavoriteItems(updatedFavorites); // Refresh the favorite items list
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  // Render each item in the list
  const renderItem = ({ item }: { item: Player }) => {
    const isFavorite = favoriteItems.some((fav) => fav.id === item.id);
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => router.push({ pathname: "/detail", params: { artId: item.id } })}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.playerName} numberOfLines={2}>{item.playerName}</Text>
        <View style={[styles.textContainer, { flexDirection: "row", alignItems: "flex-start" }]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.teamName} numberOfLines={2}>Club: {item.teamName}</Text>
            <Text style={styles.teamName} numberOfLines={2}>Position: {item.position}</Text>
          </View>
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={styles.teamName} numberOfLines={2}>Age: {item.age}</Text>
            <Text style={styles.teamName} numberOfLines={2}>Passing Accuracy: {item.passingAccuracy}%</Text>
            <Text style={styles.teamName} numberOfLines={2}>Minutes Played: {item.minutesPlayed}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => confirmToggleFavorite(item.id)}
        >
          <View style={styles.iconBackground}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color="#FF9900" />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TextInput
        style={styles.searchBox}
        placeholder="Search your favorites..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={favoriteItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No favorites yet!</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
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
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    overflow: "hidden",
    paddingBottom: 5,
    marginTop: 5,
    width: "100%",
  },
  teamName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#808080",
    textAlign: "left",
    width: "100%",
    overflow: "hidden",
    paddingBottom: 5,
  },
  emptyMessage: {
    textAlign: "left",
    fontSize: 18,
    color: "#888",
    marginLeft: 12,
    marginTop: 20,
  },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    marginRight: 2,
    marginTop: 2,
  },
  iconBackground: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
});

export default FavoriteScreen;

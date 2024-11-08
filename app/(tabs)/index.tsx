import React, { useState, useEffect, useCallback } from "react";
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
  ActivityIndicator,
  Alert,
  ScrollView,  // Import ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useMyData from "@/hooks/useMyData";

type HomeScreenProps = {
  navigation: NavigationProp<any>;
};

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { players, filterByTeam } = useMyData();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArtTools, setFilteredArtTools] = useState(players);
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    loadFavorites();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Home Focus")
      loadFavorites();
    }, [])
  )

  useEffect(() => {
    filterArtTools();
  }, [searchTerm, players]);

  useEffect(() => {
    filterByTeam(selectedTeam === "All" ? "" : selectedTeam);
  }, [selectedTeam]);

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
    } catch (error) {
      console.error("Failed to save favorites", error);
    }
  };

  const toggleFavorite = (id: string) => {
    const isFavorite = favorites.includes(id);
    const action = isFavorite ? "remove from" : "add to";

    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${action} favorites?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
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

  const filterArtTools = () => {
    const filtered = players.filter((item) =>
      item.playerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0 && searchTerm) {
      console.warn("No player found matching your search.");
    }

    setFilteredArtTools(filtered);
  };

  const handleTeamFilter = (brand: string) => {
    setSelectedTeam(brand);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => {
          router.push({ pathname: "/detail", params: { playerId: item.id } });
        }}
        accessibilityLabel={`View details of ${item.artName}`}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.playerName} numberOfLines={2}>
            {item.playerName}
          </Text>
          <Text style={styles.teamName} numberOfLines={2}>
            {item.teamName}
          </Text>
          <Text style={styles.position} numberOfLines={2}>
            {item.position}
          </Text>
          <Text style={styles.age} numberOfLines={2}>
            {item.age} yrs
          </Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => toggleFavorite(item.id)}
          accessibilityLabel={`Mark ${item.artName} as favorite`}
        >
          <View style={styles.iconBackground}>
            <Ionicons
              name={favorites.includes(item.id) ? "heart" : "heart-outline"}
              size={24}
              color="#FF9900"
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Player"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <FlatList
            data={filteredArtTools}
            keyExtractor={(item) => item.playerName}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            ListHeaderComponent={
              <View style={styles.brandFilterContainer}>
                <Text style={styles.filterTitle}>Filter</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.tagContainer}>
                    {["All", "Manchester City", "Liverpool", "Chelsea", "Manchester United", "Arsenal", "Tottenham Hotspur"].map(
                      (teamName) => (
                        <TouchableOpacity
                          key={teamName}
                          style={[
                            styles.tag,
                            selectedTeam === teamName && styles.selectedTag,
                          ]}
                          onPress={() => handleTeamFilter(teamName)}
                          accessibilityLabel={`Filter by ${teamName}`}
                        >
                          <Text
                            style={[
                              styles.tagText,
                              selectedTeam === teamName && styles.selectedTagText,
                            ]}
                          >
                            {teamName}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </ScrollView>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  cardContainer: {
    flex: 1,
    margin: 5,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 10,
    flexBasis: "48%",
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: "flex-start",
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
    overflow: "hidden",
    paddingBottom: 5,
  },
  teamName: {
    fontSize: 14,
    fontWeight: "600",
    color: '#808080',
    textAlign: "left",
    overflow: "hidden",
    paddingBottom: 5,
  },
  position: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "left",
    overflow: "hidden",
    padding: 5,
    marginBottom: 5,
    backgroundColor: '#CCC',
    borderRadius: 4
  },
  age: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "left",
    overflow: "hidden",
    paddingBottom: 5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    marginTop: 5,
  },
  priceOld: {
    fontSize: 14,
    color: "#888",
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  salePrice: {
    fontSize: 14,
    color: "green",
    fontWeight: "600",
    marginLeft: 8,
  },
  dealContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  priceDeal: {
    fontSize: 14,
    color: "red",
    fontWeight: "600",
  },
  brandFilterContainer: {
    marginVertical: 10,
    marginHorizontal: 15,
  },
  filterTitle: {
    fontWeight: "600",
    fontSize: 24,
    marginBottom: 15,
    color: "#252f3e",
  },
  tagContainer: {
    flexDirection: "row",
  },
  tag: {
    borderWidth: 2,
    borderColor: "#FF9900",
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  selectedTag: {
    backgroundColor: "#FF9900",
  },
  tagText: {
    fontWeight: "600",
    color: "#FF9900",
  },
  selectedTagText: {
    color: "#FFF",
  },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  iconBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 50,
    padding: 5,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    margin: 15,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between", 
    marginVertical: 10, 
  },
});

export default HomeScreen;

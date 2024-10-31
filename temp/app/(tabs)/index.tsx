import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import useArtData from "@/hooks/useArtData";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type HomeScreenProps = {
  navigation: NavigationProp<any>;
};

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { artTools, filterByBrand } = useArtData();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArtTools, setFilteredArtTools] = useState(artTools);
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  const router = useRouter();

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    filterArtTools();
  }, [searchTerm, artTools]);

  useEffect(() => {
    filterByBrand(selectedBrand === "All" ? "" : selectedBrand);
  }, [selectedBrand]);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      setLoading(false); // Set loading to false after favorites are loaded
    } catch (error) {
      console.error("Failed to load favorites", error);
      setLoading(false); // Ensure loading is set to false on error
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
    const updatedFavorites = favorites.includes(id)
      ? favorites.filter((fav) => fav !== id)
      : [...favorites, id];

    setFavorites(updatedFavorites);
    storeFavorites(updatedFavorites);
  };

  const filterArtTools = () => {
    const filtered = artTools.filter((item) =>
      item.artName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0 && searchTerm) {
      console.warn("No art tools found matching your search.");
    }

    setFilteredArtTools(filtered);
  };

  const handleBrandFilter = (brand: string) => {
    setSelectedBrand(brand);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate fetching new data from an API
    setTimeout(() => {
      setRefreshing(false);
      // Refresh logic here, such as re-fetching data or resetting filters
    }, 2000);
  };

  const renderItem = ({ item }: { item: any }) => {
    const salePrice =
      item.limitedTimeDeal > 0
        ? item.price * (1 - item.limitedTimeDeal)
        : item.price;

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => {
          router.push({ pathname: "/detail", params: { artId: item.id } });
        }}
        accessibilityLabel={`View details of ${item.artName}`} // Accessibility label
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.artName} numberOfLines={2}>
            {item.artName}
          </Text>
          <View style={styles.priceContainer}>
            {item.limitedTimeDeal > 0 ? (
              <>
                <Text style={styles.priceOld}>${item.price.toFixed(2)}</Text>
                <Text style={styles.salePrice}> ${salePrice.toFixed(2)}</Text>
              </>
            ) : (
              <Text style={styles.salePrice}>Price: ${item.price.toFixed(2)}</Text>
            )}
          </View>

          {item.limitedTimeDeal > 0 && (
            <View style={styles.dealContainer}>
              <Ionicons name="pricetag" size={16} color="#FF9900" />
              <Text style={styles.priceDeal}>
                {" "}
                - ${Math.round(item.price * item.limitedTimeDeal).toFixed(2)}
              </Text>
            </View>
          )}
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
            placeholder="Search Art Tools"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <FlatList
            data={filteredArtTools}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            ListHeaderComponent={
              <View style={styles.brandFilterContainer}>
                <Text style={styles.filterTitle}>Filter</Text>
                <View style={styles.tagContainer}>
                  {["All", "Arteza", "Color Splash", "Edding", "KingArt"].map(
                    (brand) => (
                      <TouchableOpacity
                        key={brand}
                        style={[
                          styles.tag,
                          selectedBrand === brand && styles.selectedTag,
                        ]}
                        onPress={() => handleBrandFilter(brand)}
                        accessibilityLabel={`Filter by ${brand}`}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            selectedBrand === brand && styles.selectedTagText,
                          ]}
                        >
                          {brand}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
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
  artName: {
    fontSize: 16,
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
    flexWrap: "wrap",
  },
  tag: {
    borderWidth: 2,
    borderColor: "#FF9900",
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: "#FF9900",
  },
  tagText: {
    fontSize: 16,
    color: "#FF9900",
    fontWeight: "600",
  },
  selectedTagText: {
    color: "#fff",
  },
  row: {
    justifyContent: "space-between",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    margin: 10,
    paddingLeft: 10,
  },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  iconBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    padding: 5,
  },
});

export default HomeScreen;

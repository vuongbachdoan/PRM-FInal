import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import useArtData from '@/hooks/useArtData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoriteScreen: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { artTools } = useArtData();
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch favorite items when screen is focused
  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );

  const getData = async () => {
    const jsonValue = await AsyncStorage.getItem('favorites');
    const favoriteIds = jsonValue != null ? JSON.parse(jsonValue) : [];
    filterFavoriteItems(favoriteIds);
  };

  const filterFavoriteItems = (favoriteIds: string[]) => {
    const items = artTools.filter((item) => favoriteIds.includes(item.id));
    setFavoriteItems(items);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      // Filter based on search query
      const filteredItems = favoriteItems.filter((item) =>
        item.artName.toLowerCase().includes(text.toLowerCase())
      );
      setFavoriteItems(filteredItems);
    } else {
      // Reset the favorite items when search query is cleared
      getData();
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getData().then(() => setRefreshing(false));
  }, []);

  const toggleFavorite = async (itemId: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem('favorites');
      const favoriteIds = jsonValue != null ? JSON.parse(jsonValue) : [];

      let updatedFavorites;
      if (favoriteIds.includes(itemId)) {
        // Remove item from favorites
        updatedFavorites = favoriteIds.filter((id: string) => id !== itemId);
      } else {
        // Add item to favorites
        updatedFavorites = [...favoriteIds, itemId];
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      // Refresh the favorite items
      filterFavoriteItems(updatedFavorites);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isFavorite = favoriteItems.some(fav => fav.id === item.id); // Check if the item is in the favorite list
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => {
          router.push({ pathname: "/detail", params: { artId: item.id } });
        }}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.artName} numberOfLines={2}>{item.artName}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.price}>Price: ${item.price.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => toggleFavorite(item.id)} // Toggle favorite on press
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 15,
    borderBottomColor: '#ddd',
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backButtonText: { fontSize: 16, marginLeft: 5 },
  searchBox: {
    height: 40,
    borderRadius: 8,
    margin: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFD69950',
  },
  cardContainer: { 
    flex: 1, 
    margin: 10, 
    backgroundColor: '#fafafa', 
    borderRadius: 8, 
    padding: 10,
  },
  image: { 
    width: '100%', 
    height: 200, 
    borderRadius: 8, 
    marginBottom: 5,
    resizeMode: 'contain'
  },
  textContainer: { 
    alignItems: 'flex-start', 
  },
  artName: { 
    fontSize: 16, 
    fontWeight: '600', 
    textAlign: 'left', 
    overflow: 'hidden', 
    paddingBottom: 5, 
  },
  description: { 
    fontSize: 14, 
    color: '#555',
    textAlign: 'left',
    marginBottom: 5,
  },
  price: { 
    fontSize: 14, 
    color: '#888',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 20,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    marginRight: 2,
    marginTop: 2,
  },
  iconBackground: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
});

export default FavoriteScreen;

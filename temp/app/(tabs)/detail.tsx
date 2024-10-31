import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { artId } = params;
  const [artDetail, setArtDetail] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null); // State for filter rating

  useEffect(() => {
    const fetchArtDetail = async () => {
      try {
        const response = await axios.get(`https://65444ee25a0b4b04436c3f2c.mockapi.io/arts/${artId}`);
        setArtDetail(response.data);
      } catch (error) {
        setError('Failed to load art details. Please try again later.');
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(`https://65444ee25a0b4b04436c3f2c.mockapi.io/comments`);
        const filteredComments = response.data.filter((comment: any) => comment.artId === artId);
        setComments(filteredComments);
      } catch (error) {
        setError('Failed to load comments. Please try again later.');
      }
    };

    const fetchData = async () => {
      setLoading(true);
      setArtDetail(null);
      setComments([]);
      setError(null);

      if (artId) {
        await Promise.all([fetchArtDetail(), fetchComments()]);
      } else {
        setError('Art ID is undefined. Please try again.');
      }

      setLoading(false);
    };

    fetchData();
  }, [artId]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text key={i} style={[styles.star, { color: i < rating ? '#FF9900' : 'gray' }]}>
          ★
        </Text>
      );
    }
    return <View style={styles.stars}>{stars}</View>;
  };

  const calculateAverageRating = (comments: any[]) => {
    const totalRating = comments.reduce((acc, comment) => acc + comment.rating, 0);
    return comments.length > 0 ? (totalRating / comments.length).toFixed(1) : 0;
  };

  // Function to handle filtering comments
  const filteredComments = filterRating !== null 
    ? comments.filter(comment => comment.rating === filterRating) 
    : comments;

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

  const averageRating = calculateAverageRating(comments);
  const originalPrice = artDetail.price;
  const discount = artDetail.limitedTimeDeal || 0;
  const discountedPrice = originalPrice * (1 - discount);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#252f3e" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image source={{ uri: artDetail.image }} style={styles.image} resizeMode="contain" />
          <View style={styles.ratingSection}>
            {renderStars(Number(averageRating))}
            <Text style={{marginBottom: 8}}>{`(${comments.length} comments)`}</Text>
          </View>
          <Text style={styles.artName}>{artDetail.artName} <Text style={styles.brand}>{artDetail.brand}</Text></Text>
          <View style={styles.priceContainer}>
            {discount > 0 ? (
              <>
                <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
                <Text style={styles.discountedPrice}>${discountedPrice.toFixed(2)}</Text>
                <Ionicons name="pricetag" size={16} color="#d9534f" style={styles.saleIcon} />
              </>
            ) : (
              <Text style={styles.discountedPrice}>${originalPrice.toFixed(2)}</Text>
            )}
          </View>
          <Text style={styles.description}>{artDetail.description}</Text>
          <View style={styles.filterSection}>
  <Text style={styles.sectionTitle}>Filter by Rating</Text>
  <View style={styles.stars}>
    {[1, 2, 3, 4, 5].map(rating => (
      <TouchableOpacity key={rating} onPress={() => setFilterRating(rating)}>
        <Text style={[styles.star, { color: filterRating && rating <= filterRating ? '#FF9900' : 'gray' }]}>
          ★
        </Text>
      </TouchableOpacity>
    ))}
  </View>
  <TouchableOpacity onPress={() => setFilterRating(null)}>
    <Text style={styles.filter}>Show All</Text>
  </TouchableOpacity>
</View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comments</Text>
            {filteredComments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <Text style={styles.commentRating}>{`Rating: ${comment.rating}`}</Text>
                {renderStars(comment.rating)}
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  scrollContainer: { flexGrow: 1, padding: 20 },
  container: { alignItems: 'flex-start' },
  image: { width: 200, height: 200, marginBottom: 20, alignSelf: 'center' },
  artName: { fontSize: 22, fontWeight: '600', marginBottom: 10, textAlign: 'left' },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  originalPrice: { fontSize: 18, color: '#333', textDecorationLine: 'line-through', marginRight: 10, fontWeight: '600' },
  discountedPrice: { fontSize: 18, color: 'red', fontWeight: '600' },
  saleIcon: { marginLeft: 5 },
  description: { fontSize: 16, textAlign: 'left', marginBottom: 10 },
  brand: { fontSize: 16, fontStyle: 'italic', marginBottom: 10, textAlign: 'left', fontWeight: '600' },
  error: { color: 'red', textAlign: 'center', margin: 20 },
  ratingSection: { marginTop: 20, width: '100%', textAlign: 'right' },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10, textAlign: 'left' },
  stars: { flexDirection: 'row' },
  star: { fontSize: 18 }, 
  commentsSection: { marginTop: 20, width: '100%' },
  commentCard: { backgroundColor: '#FFD69950', padding: 15, borderRadius: 8, marginBottom: 10, borderColor: '#ddd' },
  commentRating: { fontSize: 16, textAlign: 'left', fontWeight: '600' },
  commentText: { fontSize: 16, marginTop: 5 },
  filterSection: { marginTop: 20, width: '100%' },
  filter: { fontSize: 16, paddingVertical: 10 },
  selectedFilter: { fontSize: 16, paddingVertical: 10, fontWeight: 'bold', color: 'blue' },
});

export default DetailScreen;

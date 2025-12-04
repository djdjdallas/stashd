import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getSavedItems } from '../../lib/storage';
import { SearchBar } from '../../components/SearchBar';
import { SavedItemCard } from '../../components/SavedItemCard';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { colors, typography, spacing } from '../../lib/constants';

export default function SearchScreen() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !user) return;

    Keyboard.dismiss();
    setLoading(true);
    setHasSearched(true);

    const result = await getSavedItems(user.id, {
      searchQuery: query.trim(),
      limit: 50,
    });

    setLoading(false);

    if (result.success) {
      setResults(result.data);
    }
  }, [query, user]);

  const handleItemPress = useCallback((item) => {
    router.push(`/item/${item.id}`);
  }, []);

  const renderItem = useCallback(({ item, index }) => (
    <View style={[styles.cardWrapper, index % 2 === 1 && styles.cardRight]}>
      <SavedItemCard item={item} onPress={() => handleItemPress(item)} />
    </View>
  ), [handleItemPress]);

  const renderEmpty = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (!hasSearched) {
      return (
        <EmptyState
          icon={<Ionicons name="search-outline" size={64} color={colors.textTertiary} />}
          title="Search your saves"
          message="Find screenshots by text content, category, or notes"
        />
      );
    }

    if (hasSearched && results.length === 0) {
      return (
        <EmptyState
          icon={<Ionicons name="document-outline" size={64} color={colors.textTertiary} />}
          title="No results found"
          message={`No saves match "${query}"`}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={handleSearch}
          placeholder="Search extracted text..."
        />
      </View>

      {hasSearched && results.length > 0 && (
        <Text style={styles.resultCount}>
          {results.length} result{results.length !== 1 ? 's' : ''}
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  searchContainer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  resultCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '48%',
  },
  cardRight: {
    marginLeft: spacing.sm,
  },
});

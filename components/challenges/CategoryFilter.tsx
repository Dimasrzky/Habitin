import { ChallengeCategoryFilter } from '@/types/challenge.types';
import { getCategoryIcon, getCategoryLabel } from '@/utils/challengeHelpers';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CategoryFilterProps {
  selectedCategory: ChallengeCategoryFilter;
  onSelectCategory: (category: ChallengeCategoryFilter) => void;
}

const CATEGORIES: ChallengeCategoryFilter[] = ['all', 'physical', 'nutrition', 'lifestyle'];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <TouchableOpacity
            key={category}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelectCategory(category)}
            activeOpacity={0.7}
          >
            {category !== 'all' && (
              <Text style={styles.icon}>{getCategoryIcon(category)}</Text>
            )}
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {getCategoryLabel(category)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  chipSelected: {
    backgroundColor: '#10B981',
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
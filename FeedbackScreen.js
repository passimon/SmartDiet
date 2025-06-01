// FeedbackScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Computes maximum nutrition values based on gender and goal.
const computeMaxNutrition = (gender = 'female', goal = 'maintain weight') => {
  let baseline = {};
  if (gender.toLowerCase() === 'male') {
    baseline = {
      protein: 130,
      carbs: 267,
      fat: 88,
      fiber: 30,
    };
  } else {
    baseline = {
      protein: 100,
      carbs: 205,
      fat: 68,
      fiber: 25,
    };
  }

  let multiplier = 1;
  if (goal.toLowerCase().includes('maintain')) {
    multiplier = 1.1;
  } else if (goal.toLowerCase().includes('gain')) {
    multiplier = 1.2;
  }
  
  return {
    protein: baseline.protein * multiplier,
    carbs: baseline.carbs * multiplier,
    fat: baseline.fat * multiplier,
    fiber: baseline.fiber * multiplier,
    water: 1500, // in ml
    sleep: 8,    // in hours
  };
};

// Helper to format a date similar to HomeScreen
const formatFullDate = (dateObj) => {
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Creates feedback text based on nutrient name and percentage of goal fulfilled.
const getFeedbackText = (nutrient, percentage) => {
  if (percentage > 1) {
    return `Your ${nutrient} intake is too high today. Consider moderating your consumption to avoid overconsumption.`;
  } else if (percentage > 0.66) {
    return `Good job on your ${nutrient} intake. You have reached a high level; keep monitoring to ensure balance.`;
  } else if (percentage >= 0.33) {
    return `Your ${nutrient} intake is moderate. Consider increasing it a bit more if you need extra support for energy or recovery.`;
  } else {
    return `Your ${nutrient} intake is low. ${
      nutrient === 'Protein'
        ? 'Protein is essential for muscle repair and growth.'
        : nutrient === 'Carbs'
        ? 'Carbohydrates supply your body with energy.'
        : nutrient === 'Fat'
        ? 'Healthy fats support cell structure and hormone production.'
        : nutrient === 'Fiber'
        ? 'Fiber aids digestion and overall gut health.'
        : nutrient === 'Water'
        ? 'Staying hydrated is crucial for overall health.'
        : nutrient === 'Sleep'
        ? 'Adequate sleep is important for recovery and well-being.'
        : ''
    } Consider reviewing your meal plan today.`;
  }
};

const FeedbackScreen = () => {
  const [loading, setLoading] = useState(true);
  const [nutrition, setNutrition] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water: 0,
    sleep: 0,
  });
  const [maxNutrition, setMaxNutrition] = useState({
    protein: 100,
    carbs: 205,
    fat: 68,
    fiber: 25,
    water: 1500,
    sleep: 8,
  });

  // Load the user's settings and compute the maximum nutrition targets.
  const loadUserSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      let computedMax = {};
      if (savedSettings) {
        const { goal, gender } = JSON.parse(savedSettings);
        computedMax = computeMaxNutrition(gender, goal);
      } else {
        // Default settings if none are found.
        computedMax = computeMaxNutrition('female', 'maintain weight');
      }
      // Explicitly set sleep if needed.
      computedMax.sleep = 8;
      setMaxNutrition(computedMax);
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  // Load today's nutrition record from AsyncStorage.
  const loadTodayNutritionRecord = async () => {
    try {
      const storedRecords = await AsyncStorage.getItem('nutritionRecords');
      const today = formatFullDate(new Date());
      if (storedRecords) {
        const records = JSON.parse(storedRecords);
        const recordForToday = records.find((record) => record.date === today);
        if (recordForToday) {
          setNutrition(recordForToday.nutrition);
        } else {
          // If no record is found, reset data.
          setNutrition({
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            water: 0,
            sleep: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error loading today’s nutrition record:', error);
      Alert.alert('Error', 'Failed to load today’s nutrition data.');
    }
  };

  // useFocusEffect refreshes the state each time the component comes into focus.
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        setLoading(true);
        await loadUserSettings();
        await loadTodayNutritionRecord();
        setLoading(false);
      };
      refreshData();
    }, [])
  );

  // Calculate the percentage of the daily target for a given nutrient.
  const nutrientPercent = (nutrient) => {
    const current = nutrition[nutrient] || 0;
    const max = maxNutrition[nutrient] || 1; // avoid division by zero
    return current / max;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Daily Feedback</Text>
      {['protein', 'carbs', 'fat', 'fiber', 'water', 'sleep'].map((nutrient) => {
        const percent = nutrientPercent(nutrient);
        const feedback = getFeedbackText(
          nutrient.charAt(0).toUpperCase() + nutrient.slice(1),
          percent
        );
        return (
          <View key={nutrient} style={styles.feedbackCard}>
            <Text style={styles.nutrientName}>
              {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
            </Text>
            <Text style={styles.percentageText}>
              {Math.round(percent * 100)}% of daily target
            </Text>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  feedbackCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  nutrientName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  percentageText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 16,
  },
});

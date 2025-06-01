import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeeklyOverview from './WeeklyOverview';
import ProgressCircle from './ProgressCircle';
import { useFocusEffect } from '@react-navigation/native';

// Import the API key from a separate secrets for security
import { API_KEY } from './secrets';

const BASE_URL = 'https://api.calorieninjas.com/v1/nutrition?query=';

// Computes maximum nutrition values based off gender and goal.
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
    water: 1500,
    sleep: 8,
  };
};

const HomeScreen = ({ navigation }) => {
  // State for nutrition inputs
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [supper, setSupper] = useState('');
  const [waterInput, setWaterInput] = useState('');
  const [sleep, setSleep] = useState('');

  // State for fetched nutrition totals and maximum nutrition (based on settings)
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

  // State to hold the currently selected date
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper function to format date
  const formatFullDate = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDisplayDate = () => {
    return formatFullDate(selectedDate);
  };

  // Fetch nutrition data from API using the nutrition queries
  const fetchNutritionData = async (query) => {
    try {
      const response = await fetch(BASE_URL + encodeURIComponent(query), {
        method: 'GET',
        headers: { 'X-Api-Key': API_KEY },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API error:', error);
      Alert.alert('Error', 'Failed to fetch data from CalorieNinjas API');
      return null;
    }
  };

  // Save the daily nutrition record to AsyncStorage
  const saveRecord = async (record) => {
    try {
      const existingRecords = await AsyncStorage.getItem('nutritionRecords');
      let records = [];
      if (existingRecords !== null) {
        const parsedRecords = JSON.parse(existingRecords);
        records = Array.isArray(parsedRecords) ? parsedRecords : [];
      }
      // Replace any existing record for the same date
      records = records.filter((item) => item.date !== record.date);
      records.push(record);
      await AsyncStorage.setItem('nutritionRecords', JSON.stringify(records));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Handles fetching and calculating nutrition based on the queries.
  const handleGetNutrition = async () => {
    const queries = [];
    if (breakfast.trim()) queries.push(breakfast);
    if (lunch.trim()) queries.push(lunch);
    if (supper.trim()) queries.push(supper);

    if (queries.length === 0 && !waterInput.trim() && !sleep.trim()) {
      Alert.alert(
        'Input Required',
        'Please enter at least one meal, water intake, or sleep amount.',
      );
      return;
    }

    try {
      const results = await Promise.all(
        queries.map((query) => fetchNutritionData(query)),
      );

      const totals = {
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        water: 0,
        sleep: 0,
      };

      results.forEach((result) => {
        if (result && result.items && Array.isArray(result.items)) {
          result.items.forEach((item) => {
            totals.protein += item.protein_g || 0;
            totals.carbs += item.carbohydrates_total_g || 0;
            totals.fat += item.fat_total_g || 0;
            totals.fiber += item.fiber_g || 0;
          });
        }
      });

      totals.water = parseFloat(waterInput) || 0;
      totals.sleep = sleep.trim() ? parseFloat(sleep) : 0;

      setNutrition(totals);

      const record = {
        date: formatFullDate(selectedDate),
        queries: {
          breakfast,
          lunch,
          supper,
          water: waterInput,
          sleep: sleep.trim() ? sleep : '0',
        },
        nutrition: totals,
      };

      await saveRecord(record);
      Alert.alert('Success', 'Nutrition data has been updated and saved.');
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      Alert.alert('Error', 'There was a problem fetching nutrition data.');
    }
  };

  // Loads a saved record for the given date from AsyncStorage.
  const loadRecordForDate = async (dateObj) => {
    try {
      const storedRecords = await AsyncStorage.getItem('nutritionRecords');
      if (storedRecords) {
        const records = JSON.parse(storedRecords);
        const formattedDate = formatFullDate(dateObj);
        const recordForDate = records.find(
          (record) => record.date === formattedDate,
        );
        if (recordForDate) {
          setBreakfast(recordForDate.queries.breakfast);
          setLunch(recordForDate.queries.lunch);
          setSupper(recordForDate.queries.supper);
          setWaterInput(recordForDate.queries.water);
          setSleep(recordForDate.queries.sleep ? recordForDate.queries.sleep : '');
          setNutrition(recordForDate.nutrition);
        } else {
          setBreakfast('');
          setLunch('');
          setSupper('');
          setWaterInput('');
          setSleep('');
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
      console.error('Error loading record for date:', error);
    }
  };

  // Load user settings and calculate maxNutrition from AsyncStorage.
  const loadUserSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        const { goal, gender } = JSON.parse(savedSettings);
        const computedMax = computeMaxNutrition(gender, goal);
        setMaxNutrition({ ...computedMax, sleep: 8 });
      } else {
        // Defaults if no settings found
        setMaxNutrition({ ...computeMaxNutrition('female', 'lose'), sleep: 8 });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  // Handle date press to load records of that day.
  const handleDatePress = (date) => {
    setSelectedDate(date);
    loadRecordForDate(date);
  };

  // When the screen either mounts or re-focuses, fetch settings and records.
  useFocusEffect(
    useCallback(() => {
      loadUserSettings();
      loadRecordForDate(selectedDate);
    }, [selectedDate]),
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <ImageBackground
        source={require('./assets/placeholder-header1.png')}
        style={styles.headerImage}
        imageStyle={styles.headerImageStyle}
      >
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>SmartDiet</Text>
          <Text style={styles.headerSubtitle}>
            Your Daily Food & Nutrition Logger
          </Text>
        </View>
      </ImageBackground>

      {/* Date Display */}
      <Text style={styles.dateText}>{getDisplayDate()}</Text>

      {/* Nutrition Progress Circles */}
      <View style={styles.circlesWrapper}>
        <View style={styles.circlesRow}>
          <ProgressCircle
            progress={Math.min(nutrition.protein / maxNutrition.protein, 1)}
            label="Protein"
            valueText={`${nutrition.protein.toFixed(1)}g`}
          />
          <ProgressCircle
            progress={Math.min(nutrition.carbs / maxNutrition.carbs, 1)}
            label="Carbs"
            valueText={`${nutrition.carbs.toFixed(1)}g`}
          />
          <ProgressCircle
            progress={Math.min(nutrition.fat / maxNutrition.fat, 1)}
            label="Fat"
            valueText={`${nutrition.fat.toFixed(1)}g`}
          />
          <ProgressCircle
            progress={Math.min(nutrition.fiber / maxNutrition.fiber, 1)}
            label="Fiber"
            valueText={`${nutrition.fiber.toFixed(1)}g`}
          />
        </View>
        <View style={styles.circlesRow}>
          <ProgressCircle
            progress={Math.min(nutrition.water / maxNutrition.water, 1)}
            label="Water"
            valueText={`${nutrition.water}ml`}
          />
          <ProgressCircle
            progress={Math.min(nutrition.sleep / maxNutrition.sleep, 1)}
            label="Sleep"
            valueText={`${nutrition.sleep}h`}
          />
        </View>
      </View>

      {/* Weekly Overview */}
      <WeeklyOverview
        currentDate={selectedDate}
        setCurrentDate={handleDatePress}
      />

      {/* Input Form Section */}
      <View style={styles.inputCard}>
        <Text style={styles.inputCardTitle}>Record Your Meals & Goals</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Breakfast</Text>
          <TextInput
            style={styles.input}
            placeholder="What did you have for breakfast?"
            value={breakfast}
            onChangeText={setBreakfast}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Lunch</Text>
          <TextInput
            style={styles.input}
            placeholder="List your lunch details..."
            value={lunch}
            onChangeText={setLunch}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Supper</Text>
          <TextInput
            style={styles.input}
            placeholder="Supper details here..."
            value={supper}
            onChangeText={setSupper}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Water (ml)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500"
            value={waterInput}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9.]/g, '');
              setWaterInput(numericText);
            }}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Sleep (hrs)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 8"
            value={sleep}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9.]/g, '');
              setSleep(numericText);
            }}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleGetNutrition}>
          <Text style={styles.buttonText}>Analyze</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  headerImage: {
    width: '100%',
    height: 220,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImageStyle: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerOverlay: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    color: '#333',
    textAlign: 'center',
  },
  circlesWrapper: {
    width: '90%',
    marginVertical: 10,
  },
  circlesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  inputCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  inputCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#007BFF',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    height: 44,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen;

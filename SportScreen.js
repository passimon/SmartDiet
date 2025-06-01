// SportScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeeklyOverview from './WeeklyOverview';

// Helper to format the date
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function SportScreen() {
  // States for form data
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [dailySteps, setDailySteps] = useState('');
  const [sportActivity, setSportActivity] = useState('');
  const [sportActivityBubbles, setSportActivityBubbles] = useState([]);
  const [wellbeing, setWellbeing] = useState('good');
  const [exerciseDuration, setExerciseDuration] = useState('');

  const wellbeingStates = [
    'excellent',
    'good',
    'energetic',
    'neutral',
    'average',
    'tired',
    'bad',
    'stressed',
  ];

  useEffect(() => {
    loadDataForDate(currentDate);
  }, [currentDate]);

  const saveDataForDate = async (dataObj) => {
    const data = dataObj || {
      weight,
      bodyFat,
      dailySteps,
      sportActivity,
      sportActivityBubbles,
      wellbeing,
      exerciseDuration,
    };

    try {
      await AsyncStorage.setItem(
        `@sportData_${currentDate.toISOString().split('T')[0]}`,
        JSON.stringify(data),
      );
      Alert.alert('Saved!', 'Your sport and body metrics have been saved.');
    } catch (e) {
      console.log('Error saving data:', e);
      Alert.alert('Error', 'Failed to save data.');
    }
  };

  const loadDataForDate = async (date) => {
    try {
      const storedData = await AsyncStorage.getItem(
        `@sportData_${date.toISOString().split('T')[0]}`,
      );
      if (storedData !== null) {
        const data = JSON.parse(storedData);
        setWeight(data.weight);
        setBodyFat(data.bodyFat);
        setDailySteps(data.dailySteps);
        setSportActivity(data.sportActivity);
        setSportActivityBubbles(data.sportActivityBubbles || []);
        setWellbeing(data.wellbeing);
        setExerciseDuration(data.exerciseDuration || '');
      } else {
        // Reset fields if no data found for the selected date.
        setWeight('');
        setBodyFat('');
        setDailySteps('');
        setSportActivity('');
        setSportActivityBubbles([]);
        setWellbeing('good');
        setExerciseDuration('');
      }
    } catch (e) {
      console.log('Error loading data:', e);
    }
  };

  const addActivityBubbles = (input) => {
    const parts = input
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    if (parts.length > 0) {
      let newBubbles = [];
      if (input[input.length - 1] === ',') {
        newBubbles = parts;
      } else {
        newBubbles = parts.slice(0, -1);
      }

      if (newBubbles.length > 0) {
        setSportActivityBubbles((prev) => {
          const updatedBubbles = [...prev, ...newBubbles];
          const updatedData = {
            weight,
            bodyFat,
            dailySteps,
            sportActivity:
              input[input.length - 1] === ',' ? '' : parts[parts.length - 1],
            sportActivityBubbles: updatedBubbles,
            wellbeing,
            exerciseDuration,
          };
          saveDataForDate(updatedData);
          return updatedBubbles;
        });
        const remainder =
          input[input.length - 1] === ',' ? '' : parts[parts.length - 1];
        setSportActivity(remainder);
      } else {
        setSportActivity(input);
      }
    } else {
      setSportActivity(input);
    }
  };

  const removeActivityBubble = (indexToRemove) => {
    const updatedBubbles = sportActivityBubbles.filter(
      (_, index) => index !== indexToRemove,
    );
    setSportActivityBubbles(updatedBubbles);
    const updatedData = {
      weight,
      bodyFat,
      dailySteps,
      sportActivity,
      sportActivityBubbles: updatedBubbles,
      wellbeing,
      exerciseDuration,
    };
    saveDataForDate(updatedData);
  };

  // Helper function to allow only numeric characters (and optionally a single dot)
  const filterNumericInput = (text) => {
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return filtered;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <ImageBackground
        source={require('./assets/placeholder-header2.jpg')} // Replace with your header image.
        style={styles.headerImage}
        imageStyle={styles.headerImageStyle}
      >
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>Sport & Fitness</Text>
          <Text style={styles.headerSubtitle}>
            Track Your Workouts and Wellness
          </Text>
        </View>
      </ImageBackground>

      {/* Date Display */}
      <Text style={styles.dateText}>{formatDate(currentDate)}</Text>

      {/* Weekly Overview */}
      <WeeklyOverview
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />

      {/* Input Card Section */}
      <View style={styles.inputCard}>
        <Text style={styles.inputCardTitle}>Enter Your Metrics</Text>

        {/* Weight Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., 70"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={weight}
            onChangeText={(text) => setWeight(filterNumericInput(text))}
          />
        </View>

        {/* Body Fat Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Body Fat (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., 18"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={bodyFat}
            onChangeText={(text) => setBodyFat(filterNumericInput(text))}
          />
        </View>

        {/* Daily Steps Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Daily Steps</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., 10000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={dailySteps}
            onChangeText={(text) => setDailySteps(filterNumericInput(text))}
          />
        </View>

        {/* Exercise Duration Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Exercise Duration (mins)</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., 45"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={exerciseDuration}
            onChangeText={(text) => {
              const filtered = filterNumericInput(text);
              setExerciseDuration(filtered);
              saveDataForDate({
                weight,
                bodyFat,
                dailySteps,
                sportActivity,
                sportActivityBubbles,
                wellbeing,
                exerciseDuration: filtered,
              });
            }}
          />
        </View>

        {/* Well-being Section */}
        <View style={[styles.inputGroup, { marginBottom: 15 }]}>
          <Text style={styles.inputLabel}>Well-being</Text>
          <View style={styles.wellbeingRow}>
            {wellbeingStates.map((state) => (
              <TouchableOpacity
                key={state}
                style={[
                  styles.wellbeingButton,
                  wellbeing === state && styles.activeWellbeing,
                ]}
                onPress={() => {
                  setWellbeing(state);
                  saveDataForDate();
                }}
              >
                <Text style={styles.wellbeingButtonText}>
                  {state.charAt(0).toUpperCase() + state.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sports Activity Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Sports Activity</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., Running, Cycling"
            placeholderTextColor="#999"
            value={sportActivity}
            onChangeText={addActivityBubbles}
          />
          <View style={styles.bubbleContainer}>
            {sportActivityBubbles.map((activity, index) => (
              <View key={index} style={styles.bubble}>
                <Text style={styles.bubbleText}>{activity}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeActivityBubble(index)}
                >
                  <Text style={styles.deleteButtonText}>x</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Save Data Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => saveDataForDate()}
        >
          <Text style={styles.buttonText}>Save Metrics</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

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
    backgroundColor: 'rgba(0,0,0,0.2)',
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#333',
  },
  wellbeingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  wellbeingButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  wellbeingButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  activeWellbeing: {
    backgroundColor: '#0056b3',
  },
  bubbleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#a0d2db',
  },
  bubbleText: {
    fontSize: 13,
    color: '#00796b',
    textTransform: 'capitalize',
  },
  deleteButton: {
    marginLeft: 8,
    backgroundColor: '#ff5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export { SportScreen };

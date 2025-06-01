// UserSettings.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Calendar from './Calendar';

// A revamped RadioGroup component with improved styling
const RadioGroup = ({ options, selectedValue, onValueChange }) => {
  return (
    <View style={styles.radioGroup}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.radioButton,
            selectedValue === option && styles.radioButtonActive,
          ]}
          onPress={() => onValueChange(option)}
        >
          <Text
            style={[
              styles.radioButtonText,
              selectedValue === option && styles.radioButtonTextActive,
            ]}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const UserSettings = ({ navigation }) => {
  // Default state values
  const [goal, setGoal] = useState('lose');
  const [gender, setGender] = useState('female');
  const [dob, setDob] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [exerciseFrequency, setExerciseFrequency] = useState('');

  // Format Date to DD-MM-YYYY
  const formatDate = (date) => {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('userSettings');
        if (savedSettings) {
          const {
            goal: savedGoal,
            gender: savedGender,
            dob: savedDob,
            height: savedHeight,
            currentWeight: savedCurrentWeight,
            goalWeight: savedGoalWeight,
            exerciseFrequency: savedExerciseFrequency,
          } = JSON.parse(savedSettings);

          setGoal(savedGoal);
          setGender(savedGender);

          // Convert stored date string to Date object
          const [day, month, year] = savedDob.split('-');
          setDob(new Date(year, month - 1, day));

          if (savedHeight) {
            const heightParts = savedHeight.split(' ');
            setHeight(heightParts[0]);
            setHeightUnit(heightParts[1] || 'cm');
          }

          if (savedCurrentWeight) {
            const weightParts = savedCurrentWeight.split(' ');
            setCurrentWeight(weightParts[0]);
            setWeightUnit(weightParts[1] || 'kg');
          }

          if (savedGoalWeight) {
            const goalWeightParts = savedGoalWeight.split(' ');
            setGoalWeight(goalWeightParts[0]);
          }

          if (savedExerciseFrequency) {
            setExerciseFrequency(savedExerciseFrequency);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Callback when date is selected from Calendar
  const onDateSelected = (selectedDateObject) => {
    setDob(selectedDateObject);
    setShowCalendar(false);
  };

  const submitSettings = async () => {
    const settings = {
      goal,
      gender,
      dob: formatDate(dob),
      height: `${height} ${heightUnit}`,
      currentWeight: `${currentWeight} ${weightUnit}`,
      goalWeight: `${goalWeight} ${weightUnit}`,
      exerciseFrequency,
    };

    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
      Alert.alert('Success', 'Settings saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving settings: ', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Banner */}
      <ImageBackground
        source={require('./assets/placeholder-header3.jpg')}
        style={styles.headerBanner}
      >
        <View style={styles.headerOverlay}>
          <Text style={styles.headerText}>User Settings</Text>
        </View>
      </ImageBackground>

      {/* Settings Content */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Weight Goal</Text>
        <RadioGroup
          options={['lose', 'maintain', 'gain']}
          selectedValue={goal}
          onValueChange={(val) => setGoal(val)}
        />

        <Text style={styles.sectionTitle}>Gender</Text>
        <RadioGroup
          options={['female', 'male']}
          selectedValue={gender}
          onValueChange={(val) => setGender(val)}
        />

        <Text style={styles.sectionTitle}>Height</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Enter height in numbers"
            keyboardType="numeric"
            value={height}
            onChangeText={(value) => {
              // Allow only numeric characters (and decimal point)
              const numericValue = value.replace(/[^0-9.]/g, '');
              setHeight(numericValue);
            }}
          />
          <TouchableOpacity
            style={styles.unitButton}
            onPress={() => setHeightUnit(heightUnit === 'cm' ? 'in' : 'cm')}
          >
            <Text style={styles.unitButtonText}>{heightUnit}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Current Weight</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Enter current weight"
            keyboardType="numeric"
            value={currentWeight}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9.]/g, '');
              setCurrentWeight(numericValue);
            }}
          />
          <TouchableOpacity
            style={styles.unitButton}
            onPress={() => setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg')}
          >
            <Text style={styles.unitButtonText}>{weightUnit}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Goal Weight</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Enter goal weight"
            keyboardType="numeric"
            value={goalWeight}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9.]/g, '');
              setGoalWeight(numericValue);
            }}
          />
          <TouchableOpacity
            style={styles.unitButton}
            onPress={() => setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg')}
          >
            <Text style={styles.unitButtonText}>{weightUnit}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Exercise Frequency</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 3"
          keyboardType="numeric"
          value={exerciseFrequency}
          onChangeText={(value) => {
            const numericValue = value.replace(/[^0-9]/g, '');
            setExerciseFrequency(numericValue);
          }}
        />

        <TouchableOpacity style={styles.submitButton} onPress={submitSettings}>
          <Text style={styles.submitButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <Calendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelected={onDateSelected}
      />
    </ScrollView>
  );
};

export default UserSettings;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f7f7',
    flexGrow: 1,
  },
  headerBanner: {
    height: 200,
    overflow: 'hidden',
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
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
    marginVertical: 10,
    fontWeight: '600',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  radioButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  radioButtonText: {
    fontSize: 16,
    color: '#555',
  },
  radioButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  unitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
});

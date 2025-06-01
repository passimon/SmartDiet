// WeeklyOverview.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Helper to generate weekly dates for the overview (3 days before & 3 days after currentDate)
const getWeeklyDates = (currentDate) => {
  const dates = [];
  for (let offset = -3; offset <= 3; offset++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + offset);
    dates.push(date);
  }
  return dates;
};

const WeeklyOverview = ({ currentDate, setCurrentDate }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Week Overview</Text>
      <View style={styles.weeklyOverview}>
        {getWeeklyDates(currentDate).map((date, index) => {
          const isActive =
            date.toISOString().split('T')[0] ===
            currentDate.toISOString().split('T')[0];
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayButton, isActive && styles.activeDayButton]}
              onPress={() => setCurrentDate(date)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  isActive && styles.activeDayButtonText,
                ]}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%', // Container set to 90% width
    alignSelf: 'center',
    backgroundColor: '#FFF',
    marginVertical: 10,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // Elevation for Android
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 10,
    color: '#007BFF', // Title color set to blue (#007BFF)
  },
  weeklyOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    backgroundColor: '#f5f5f5',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeDayButton: {
    backgroundColor: '#007BFF',
    transform: [{ scale: 1.1 }],
    borderWidth: 2,
    borderColor: '#0056b3',
  },
  dayButtonText: {
    color: '#333',
    fontSize: 14,
  },
  activeDayButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default WeeklyOverview;

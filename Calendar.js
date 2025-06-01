import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';

const Calendar = ({ visible, onClose, onDateSelected }) => {
  const [selectedDay, setSelectedDay] = useState(null);

  const onDayPress = (day) => {
    setSelectedDay(day.dateString);
    if (onDateSelected) {
      // Convert the dateString into a Date object.
      const selectedDateObject = new Date(day.dateString);
      onDateSelected(selectedDateObject);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.header}>Select Date</Text>
          <RNCalendar
            onDayPress={onDayPress}
            markedDates={
              selectedDay
                ? {
                    [selectedDay]: {
                      selected: true,
                      disableTouchEvent: true,
                      selectedDotColor: 'orange',
                    },
                  }
                : {}
            }
            style={styles.calendar}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: '600',
  },
  calendar: {
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Calendar;

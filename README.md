![Background Image](https://github.com/passimon/SmartDiet/blob/main/background.jpeg)

Website: https://smartdiet--8p02056r17.expo.app/
(To quickly access mobile view, use the shortcut Ctrl + Shift + M (Windows/Linux) or Cmd + Shift + M (Mac))


# SmartDiet React Native App

SmartDiet is a cross-platform (iOS & Android) React Native application that helps users track daily nutrition, water intake, sleep, and view weekly overviews. It leverages the CalorieNinjas nutrition API to fetch macronutrient data for meals, stores daily logs in AsyncStorage, and provides configurable goals based on user settings.

---

## Table of Contents
1. [Features](#features)  
2. [Screens & Navigation](#screens--navigation)  
3. [Prerequisites](#prerequisites)  
4. [Installation](#installation)  
5. [Configuration](#configuration)  
6. [Running the App](#running-the-app)  
7. [Project Structure](#project-structure)  
8. [Key Components](#key-components)  
9. [License](#license)

---

## Features

- Log breakfast, lunch, supper, water intake (ml), and sleep (hrs)
- Fetch macronutrient data (protein, carbs, fat, fiber) via CalorieNinjas API
- Store daily records in AsyncStorage
- Compute progress vs. personalized goals (maintain, lose, gain weight)
- Visualize progress with circular progress indicators
- Weekly overview selector to browse past entries
- User settings screen to configure gender and weight goals
- Bottom tab navigation for quick access to Home, Sports, Feedback, Recipes, and Learn screens
- Native-style stack navigation for settings

---

## Screens & Navigation

1. **Home** – Main logging interface with progress circles and weekly overview.  
2. **Sports** – Placeholder for sports-related content.  
3. **Feedback** – Screen to collect user feedback.  
4. **Recipes** – Recipe suggestions and browsing.  
5. **Learn** – Educational content about nutrition.  
6. **UserSettings** – Configure user gender and goals (accessed from any tab via the cog icon).  

The bottom tab navigator (`MainTabs`) holds the first five screens. A native stack navigator wraps `MainTabs` and `UserSettings`, hiding the header on tabs and presenting settings modally.

---

## Prerequisites

- Node.js (>=14.x) & npm or Yarn  
- React Native CLI (for running on real devices or emulators)  
- Xcode (for iOS) or Android Studio (for Android)  
- A free API key from [CalorieNinjas](https://calorieninjas.com/)  

---

## Installation

1. Clone the repo  
   ```bash
   git clone https://github.com/your-username/smartdiet-app.git
   cd smartdiet-app
   ```

2. Install dependencies  
   ```bash
   npm install
   # or
   yarn install
   ```

3. Install CocoaPods (iOS only)  
   ```bash
   cd ios && pod install && cd ..
   ```

4. Link native dependencies (if not using autolinking)  
   ```bash
   npx react-native link
   ```

---

## Configuration

1. Create a file named `secrets.js` at the project root (this is gitignored).  
2. Export your CalorieNinjas API key:
   ```js
   // secrets.js
   export const API_KEY = 'YOUR_CALORIENINJAS_API_KEY';
   ```

3. (Optional) You can also use a `.env` file and [`react-native-dotenv`](https://github.com/goatandsheep/react-native-dotenv).

---

## Running the App

- iOS Simulator
  ```bash
  npx react-native run-ios
  ```
- Android Emulator / Device
  ```bash
  npx react-native run-android
  ```

Ensure your emulator or device is running and connected.

---

## Project Structure

```
/smartdiet-app
├─ /android
├─ /ios
├─ /assets
│   └─ placeholder-header1.png
├─ App.jsx
├─ HomeScreen.jsx
├─ SportScreen.jsx
├─ RecipeScreen.jsx
├─ LearnScreen.jsx
├─ FeedbackScreen.jsx
├─ UserSettings.jsx
├─ WeeklyOverview.jsx
├─ ProgressCircle.jsx
├─ secrets.js        # (gitignored)
└─ package.json
```

- **App.jsx** – Root component, sets up navigation.  
- **HomeScreen.jsx** – Core logging UI with data fetching, storage, and progress circles.  
- **WeeklyOverview.jsx** – Date picker carousel for navigating past entries.  
- **ProgressCircle.jsx** – Circular progress component using SVG or Canvas.  
- **UserSettings.jsx** – Entry form to save gender and goal (e.g., lose, gain, maintain).  
- **Other Screens** – Stubs/placeholders for Sports, Recipes, Learn, and Feedback.

---

## Key Components

### 1. computeMaxNutrition
Calculates target macros based on `gender` and `goal` multipliers.  

### 2. fetchNutritionData
Calls the CalorieNinjas API to retrieve macros for a given food query. Uses `X-Api-Key` header.

### 3. AsyncStorage Usage
- Records saved under `nutritionRecords` key as an array of `{ date, queries, nutrition }`.  
- User settings under `userSettings` key.

### 4. useFocusEffect
Reloads settings and the selected date’s record whenever the Home screen regains focus.

### 5. Navigation
- **Bottom Tabs**: `@react-navigation/bottom-tabs`  
- **Stack Navigator**: `@react-navigation/native-stack`  
- **Icons**: `react-native-vector-icons/MaterialCommunityIcons`

---

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/your-feature`)  
3. Commit your changes (`git commit -m 'Add some feature'`)  
4. Push to the branch (`git push origin feature/your-feature`)  
5. Open a pull request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

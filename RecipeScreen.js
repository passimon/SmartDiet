import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const API_KEY = '1'; // Test API key
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

const RecipeScreen = () => {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [expandedIndexes, setExpandedIndexes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Clear input and results
  const handleClear = () => {
    setQuery('');
    setRecipes([]);
    setExpandedIndexes([]);
  };

  // Toggle expand accordion item
  const toggleExpand = (index) => {
    setExpandedIndexes((prevExpanded) =>
      prevExpanded.includes(index)
        ? prevExpanded.filter((i) => i !== index)
        : [...prevExpanded, index]
    );
  };

  // Method to build ingredients list from the meal data
  const buildIngredientsList = (meal) => {
    let ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (
        ingredient &&
        ingredient.trim() !== '' &&
        measure &&
        measure.trim() !== ''
      ) {
        ingredients.push(`${measure.trim()} ${ingredient.trim()}`);
      } else if (ingredient && ingredient.trim() !== '') {
        ingredients.push(ingredient.trim());
      }
    }
    return ingredients;
  };

  // Search recipes using TheMealDB API
  const searchRecipes = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const url = `${API_BASE_URL}${encodedQuery}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // data.meals is null if no results found
      const meals = data.meals ? data.meals.slice(0, 13) : [];
      setRecipes(meals);
      // clear expanded states for new search
      setExpandedIndexes([]);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search recipes..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
        <TouchableOpacity onPress={searchRecipes} style={styles.iconButton}>
          <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
        </TouchableOpacity>
        {query.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            // Override backgroundColor to rgb(255,90,95) for clear ("x") button
            style={[styles.iconButton, { backgroundColor: 'rgb(255, 90, 95)' }]}
          >
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Loader */}
      {loading && (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      )}

      {/* Accordion List for Meals */}
      {recipes.map((meal, index) => {
        const isExpanded = expandedIndexes.includes(index);
        const ingredients = buildIngredientsList(meal);
        return (
          <View key={meal.idMeal} style={styles.accordionItem}>
            <TouchableOpacity
              onPress={() => toggleExpand(index)}
              style={styles.accordionTitleContainer}
            >
              <Text style={styles.accordionTitle}>{meal.strMeal}</Text>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#333"
              />
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.accordionContent}>
                {meal.strMealThumb && (
                  <Image
                    source={{ uri: meal.strMealThumb }}
                    style={styles.mealImage}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.sectionHeader}>Category:</Text>
                <Text style={styles.contentText}>{meal.strCategory}</Text>
                <Text style={styles.sectionHeader}>Area:</Text>
                <Text style={styles.contentText}>{meal.strArea}</Text>
                <Text style={styles.sectionHeader}>Instructions:</Text>
                <Text style={styles.contentText}>{meal.strInstructions}</Text>
                <Text style={styles.sectionHeader}>Ingredients:</Text>
                {ingredients.map((item, idx) => (
                  <Text key={idx} style={styles.contentText}>
                    {`\u2022 ${item}`}
                  </Text>
                ))}
                {meal.strYoutube && (
                  <>
                    <Text style={styles.sectionHeader}>YouTube:</Text>
                    <Text style={[styles.contentText, styles.link]}>
                      {meal.strYoutube}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8F8F8',
    flexGrow: 1,
  },
  coverImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 16,
  },
  iconButton: {
    marginLeft: 8,
    backgroundColor: '#007BFF', // Blue for search button
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Increased minWidth to make the buttons a little wider
    minWidth: 50,
  },
  loader: {
    marginVertical: 20,
  },
  accordionItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  accordionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#E8E8E8',
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  accordionContent: {
    padding: 15,
    backgroundColor: '#FFF',
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#555',
  },
  contentText: {
    fontSize: 15,
    marginTop: 5,
    color: '#666',
    lineHeight: 22,
  },
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});

export default RecipeScreen;

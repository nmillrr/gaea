import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootState } from '../store';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const onboardingSteps = [
    {
      title: 'Welcome to Cosmo',
      description: 'Explore the world through photos and test your geography skills by guessing locations.',
      image: require('../assets/placeholder.png'), // Replace with actual onboarding image
    },
    {
      title: 'Share Your World',
      description: 'Take photos of interesting places and challenge your friends to guess the location.',
      image: require('../assets/placeholder.png'), // Replace with actual onboarding image
    },
    {
      title: 'Connect with Friends',
      description: 'Add friends, see their photos, and compete on the leaderboard.',
      image: require('../assets/placeholder.png'), // Replace with actual onboarding image
    },
  ];
  
  const [currentStep, setCurrentStep] = React.useState(0);
  
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to the home screen when onboarding is complete
      navigation.replace('Home');
    }
  };
  
  const handleSkip = () => {
    // Skip directly to the home screen
    navigation.replace('Home');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            {onboardingSteps.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.progressDot, 
                  { backgroundColor: index === currentStep ? '#3498db' : '#ddd' }
                ]} 
              />
            ))}
          </View>
          
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.imageContainer}>
          <Image 
            source={onboardingSteps[currentStep].image} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{onboardingSteps[currentStep].title}</Text>
          <Text style={styles.description}>{onboardingSteps[currentStep].description}</Text>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  skipText: {
    color: '#3498db',
    fontSize: 16,
  },
  imageContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3498db',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
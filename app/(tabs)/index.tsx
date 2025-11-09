import { Text, TouchableOpacity, View } from "react-native";
import "../../global.css";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to Habitin 👋
      </Text>

      <TouchableOpacity className="bg-blue-500 px-5 py-3 rounded-2xl">
        <Text className="text-white font-semibold text-lg">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
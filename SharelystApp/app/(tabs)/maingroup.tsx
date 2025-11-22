import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function maingroup() {
    return(
    <SafeAreaView className="flex-1 bg-[#F2F2F2]" >
      <View className="flex-1 px-6 pt-4">



          <View className="flex flex-row justify-between">
                    <Pressable onPress={() => router.back()}>
                        <Image source={require('@/assets/images/arrow_back.png')} className="width: 6, height: 6"  />
                    </Pressable>
                       
                    <Text className="text-3xl font-extrabold">Trip to Vegas!</Text>
                    <View className='w-6 h-6'></View>
            </View>




      </View>



    </SafeAreaView>
  );
}
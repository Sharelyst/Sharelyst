import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, Text, View, Image, Alert } from "react-native";
import { router } from 'expo-router';
import { CodeInput} from './CodeInput'




const handleJoin = () =>{
  // if code is valid redirect to group page
  //if (code is invalid) proceed to shown an alert, wipe the input field
  // go back to the input field for user to re-enter code

    // Alert.alert('Button has been clicked', 'You have clicked the button', [
    //   {
    //     text: 'Cancel',
    //     onPress: () => console.log('Cancel Pressed'),
    //     style: 'cancel',
    //   },
    //   {text: 'OK', onPress: () => console.log('OK Pressed')},
    // ])
    router.push('/(tabs)/maingroup');
  }
export default function findgroup() {
    return(
    <SafeAreaView className="flex-1 bg-[#F2F2F2]" >
      <View className="flex-1 px-6 pt-4">

        <View className="flex flex-row justify-between">
            <Pressable onPress={() => router.back()}>
                <Image source={require('@/assets/images/arrow_back.png')} className="width: 6, height: 6"  />
            </Pressable>
               
            <Text className="text-3xl font-extrabold">Find your group !</Text>
            <View className='w-6 h-6'></View>
        </View>

 

        
        <View className="mt-20">
          <View className="flex-row gap-4">
            <CodeInput/>
          </View>
        </View>

        
        <View className="mt-80 mb-16">
             {/* 
            // MUST CHECK IF CODE FOR GROUPS EXISTS
            // IF CODE EXISTS, ALLOW JOINING THE GROUP
            // IF CODE DOES NOT EXIST DISPLAY ALERT MESSAGE SAYING CODE IS NOT VALID */}
          <Pressable onPress={handleJoin} className="w-full rounded-full bg-[#8B5CF6] py-4 items-center justify-center">
            <Text className="text-white text-lg font-semibold">Join</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
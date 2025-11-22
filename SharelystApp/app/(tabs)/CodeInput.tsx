import React, { useRef, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";

export function CodeInput() {
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput | null>(null);

  const handleChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, "");
    if (numeric.length <= 6) {setCode(numeric);}
  };

  
  const digits = Array.from({ length: 6 }, (_, i) => code[i] ?? "");

  return (
    <View className="relative w-full items-center">
      
      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="flex-row justify-between w-64">
      
        {digits.map((digit, index) => (
          <View
            key={index}
            className="w-8 items-center justify-center border-b-4 border-black">
            <Text className="text-4xl font-extrabold ">{digit}</Text>
          </View>
        ))}
      </Pressable>

      
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={6}
        // hide it but keep it focusable
        className="absolute opacity-0 w-0 h-0"
        caretHidden
      />
    </View>
  );
}

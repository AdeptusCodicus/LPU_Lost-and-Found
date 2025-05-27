import 'react-native-gesture-handler';
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import RootNavigator from "./src/navigation/RootNavigator";
import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <GluestackUIProvider mode="light">
      <AuthProvider> 
        <RootNavigator />
      </AuthProvider>
    </GluestackUIProvider>
  );
}

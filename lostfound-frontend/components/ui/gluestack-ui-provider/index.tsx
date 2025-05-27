import React, { useEffect } from 'react';
import { config as gluestackThemeConfig } from './config';
import { ViewProps, useColorScheme as useRNColorScheme } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { GluestackUIProvider as GluestackUIProviderThemed } from '@gluestack-ui/themed';

export type ModeType = 'light' | 'dark' | 'system';

export function GluestackUIProvider({
  mode = 'light',
  children,
  style,
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const { setColorScheme } = useNativeWindColorScheme();
  const rnColorScheme = useRNColorScheme();

  let resolvedColorMode: 'light' | 'dark';

  if (mode === 'system') {
    resolvedColorMode = rnColorScheme === 'dark' ? 'dark' : 'light';
  } else {
    resolvedColorMode = mode;
  }

  useEffect(() => {
    if (resolvedColorMode) {
      setColorScheme(resolvedColorMode);
    }
  }, [resolvedColorMode, setColorScheme]);

  console.log(
    'GluestackUIProvider: Loaded config:',
    JSON.stringify(gluestackThemeConfig, null, 2)
  );

  return (
    <GluestackUIProviderThemed config={gluestackThemeConfig} colorMode={resolvedColorMode}>
      <OverlayProvider>
        <ToastProvider>{children}</ToastProvider>
      </OverlayProvider>
    </GluestackUIProviderThemed>
  );
}

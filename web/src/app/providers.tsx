'use client';

import { StoreProvider } from '@/lib/store/provider';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useMemo } from 'react';
import { getTheme } from '@/lib/theme/theme';

export default function Providers({ children}: { children: React.ReactNode;}) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <StoreProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StoreProvider>
  );
}
import { useEffect } from 'react';

import { subscribeAndroidSystemUiTheme } from '@/src/utils/systemUiTheme';

export function useAndroidSystemUiTheme(): void {
  useEffect(() => subscribeAndroidSystemUiTheme(), []);
}

import { Platform } from 'react-native';

import { StoresMapView as NativeStoresMapView } from './StoresMapView.native';
import { StoresMapView as WebStoresMapView } from './StoresMapView.web';

export const StoresMapView = Platform.OS === 'web' ? WebStoresMapView : NativeStoresMapView;

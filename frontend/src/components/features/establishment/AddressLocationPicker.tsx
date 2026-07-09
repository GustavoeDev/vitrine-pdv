import { Platform } from 'react-native';

import { AddressLocationPicker as NativeAddressLocationPicker } from './AddressLocationPicker.native';
import { AddressLocationPicker as WebAddressLocationPicker } from './AddressLocationPicker.web';

export const AddressLocationPicker =
  Platform.OS === 'web' ? WebAddressLocationPicker : NativeAddressLocationPicker;

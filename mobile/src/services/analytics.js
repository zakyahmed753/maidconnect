import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from './api';

// Fire-and-forget — never blocks the UI, never throws
export function track(name, meta = {}) {
  api.post('/events', {
    name,
    meta,
    platform: Platform.OS,
    appVersion: Constants.expoConfig?.version || '0.0.0',
  }).catch(() => {});
}

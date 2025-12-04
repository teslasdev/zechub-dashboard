/**
 * Demo data store for when Nillion SDK is unavailable
 * This simulates nilDB behavior for development/testing
 */

export const demoDataStore = new Map<string, any>();

export function clearDemoStore() {
  demoDataStore.clear();
}

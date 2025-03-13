import { writable } from 'svelte/store';

// Create a writable store with an initial value
export const serverRunning = writable(false);
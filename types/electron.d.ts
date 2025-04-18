// global.d.ts
export { }; // Ensures this is treated as a module

declare global {
  interface Window {
    electronAPI: {
      loadSettings: () => void;
      saveSettings: (data: { ip?: string; port?: string }) => void;
    };
  }
}
import { mount } from 'svelte';
import '../global/global.css';
import App from './local-settings.svelte';

const app = mount(App, {
  target: document.body,
  props: {
    name: 'App Settings'
  }
});

export default app;
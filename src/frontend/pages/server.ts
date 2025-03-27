import { mount } from 'svelte';
import App from './server.svelte';

const app = mount(App, {
  target: document.body,
  props: {
    name: 'server'
  }
});

export default app;
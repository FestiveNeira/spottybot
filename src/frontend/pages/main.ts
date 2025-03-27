import { mount } from 'svelte';
import App from './main.svelte';

const app = mount(App, {
  target: document.body,
  props: {
    name: 'main'
  }
});

export default app;
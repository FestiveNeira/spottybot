import { mount } from 'svelte';
import App from './main.svelte';

const app = mount(App, {
  target: document.body,
  props: {
    name: 'world'
  }
});

export default app;
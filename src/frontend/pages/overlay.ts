import { mount } from 'svelte';
import App from './overlay.svelte';

const app = mount(App, {
  target: document.body,
  props: {
    name: 'overlay'
  }
});

export default app;
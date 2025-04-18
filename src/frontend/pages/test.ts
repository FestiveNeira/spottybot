import { mount } from 'svelte';
import '../global/global.css';
import App from './test.svelte';

const app = mount(App, {
  target: document.body,
  props: {
    name: 'test'
  }
});

export default app;
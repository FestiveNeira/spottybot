import { mount } from 'svelte';
import '../global/global.css';
import App from './loading.svelte';

const app = mount(App, {
  target: document.body,
  props: {
    name: 'Loading...'
  }
});

export default app;
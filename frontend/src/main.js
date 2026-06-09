import { createApp } from 'vue'
import './assets/styles/variables.css'
import './assets/styles/layout.css'
import './assets/styles/components.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')

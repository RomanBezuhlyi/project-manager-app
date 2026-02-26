import 'normalize.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import App from './App.vue'
import { router } from './router'
import './styles/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueToast)
app.mount('#app')

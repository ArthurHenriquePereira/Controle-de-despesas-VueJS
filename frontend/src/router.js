import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './components/DashboardPage.vue'
import CadastroMovimentacao from './components/CadastroMovimentacao.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/cadastro', component: CadastroMovimentacao },
  // Adicione outras rotas conforme necessário
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
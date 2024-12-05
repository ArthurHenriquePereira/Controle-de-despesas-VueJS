import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './components/DashboardPage.vue'
import CadastroMovimentacao from './components/CadastroMovimentacao.vue'
import VerMovimentacoes from './components/VerMovimentacoes.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/cadastro', component: CadastroMovimentacao },
  { path: '/movimentacoes', component: VerMovimentacoes },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
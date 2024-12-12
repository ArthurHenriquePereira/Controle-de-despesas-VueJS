import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './components/DashboardPage.vue'
import CadastroMovimentacao from './components/CadastroMovimentacao.vue'
import VerMovimentacoes from './components/VerMovimentacoes.vue'
import RelatoriosPage from './components/RelatoriosPage.vue'
import LoginPage from './components/LoginPage.vue'
import RegisterPage from './components/RegisterPage.vue'
import UserProfile from './components/UserProfile.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/cadastro', component: CadastroMovimentacao },
  { path: '/movimentacoes', component: VerMovimentacoes },
  { path: '/relatorios', component: RelatoriosPage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/editProfile', component: UserProfile},
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Menu Responsivo -->
    <nav class="bg-blue-600 p-4">
      <div class="container mx-auto flex justify-between items-center">
        <a href="#" class="text-white text-xl font-bold">Controle Financeiro</a>
        <div class="hidden md:flex space-x-4">
          <router-link v-for="item in menuItems" :key="item.name" :to="item.path" class="text-white hover:text-blue-200">
            {{ item.name }}
          </router-link>
        </div>
        <button @click="toggleMobileMenu" class="md:hidden text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>
    </nav>

    <!-- Menu Mobile -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-blue-500">
      <router-link v-for="item in menuItems" :key="item.name" :to="item.path"
        class="block py-2 px-4 text-white hover:bg-blue-600">
        {{ item.name }}
      </router-link>
    </div>

    <!-- Conteúdo Principal -->
    <main class="container mx-auto mt-8 px-4">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const menuItems = [
  { name: 'Início', path: '/' },
  { name: 'Cadastro de Movimentação', path: '/cadastro' },
  { name: 'Ver Movimentação', path: '/movimentacoes' },
  { name: 'Relatórios', path: '/relatorios' }
]

const mobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>
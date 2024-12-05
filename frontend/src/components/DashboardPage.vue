<template>
    <div>
        <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

        <!-- Resumo do Mês -->
        <div v-if="isLoading" class="text-center py-8">
            <p class="text-xl">Carregando dados...</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">Resumo do Mês</h2>
                <p class="text-green-600">Total de Receitas: R$ {{ totalReceitas.toFixed(2) }}</p>
                <p class="text-red-600">Total de Despesas: R$ {{ totalDespesas.toFixed(2) }}</p>
                <p class="text-blue-600 font-semibold mt-2">
                    Saldo: R$ {{ (totalReceitas - totalDespesas).toFixed(2) }}
                </p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">Estatísticas de Despesas</h2>
                <p>Despesas Fixas: {{ quantidadeDespesasFixas }}</p>
                <p>Despesas Variáveis: {{ quantidadeDespesasVariaveis }}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">Situação das despesas</h2>
                <p>Pagas: {{ quantidadeDespesasPagas }}</p>
                <p>Pendentes: {{ quantidadeDespesasPendentes }}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">Valor total à pagar</h2>
                <p>Despesas Fixas: R$ {{ valorDespesasFixas.toFixed(2) }}</p>
                <p>Despesas Variáveis: R$ {{ valorDespesasVariaveis.toFixed(2) }}</p>
            </div>
        </div>
    </div>
</template>
    
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const isLoading = ref(true)
const totalReceitas = ref(0)
const totalDespesas = ref(0)
const quantidadeDespesasFixas = ref(0)
const quantidadeDespesasVariaveis = ref(0)
const quantidadeDespesasPagas = ref(0)
const quantidadeDespesasPendentes = ref(0)
const valorDespesasFixas = ref(0)
const valorDespesasVariaveis = ref(0)

const fetchDashboardData = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/dashboard')
        const data = response.data

        totalReceitas.value = data.totalReceitas
        totalDespesas.value = data.totalDespesas
        quantidadeDespesasFixas.value = data.quantidadeDespesasFixas
        quantidadeDespesasVariaveis.value = data.quantidadeDespesasVariaveis
        quantidadeDespesasPagas.value = data.quantidadeDespesasPagas
        quantidadeDespesasPendentes.value = data.quantidadeDespesasPendentes
        valorDespesasFixas.value = data.valorDespesasFixas
        valorDespesasVariaveis.value = data.valorDespesasVariaveis

        isLoading.value = false
    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error)
        alert('Erro ao carregar dados do dashboard. Por favor, tente novamente.')
        isLoading.value = false
    }
}

onMounted(() => {
    fetchDashboardData()
})
</script>
  
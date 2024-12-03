<template>
    <div>
        <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

        <!-- Resumo do Mês -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">Resumo do Mês</h2>
                <p class="text-green-600">Total de Receitas: R$ {{ totalReceitas.toFixed(2) }}</p>
                <p class="text-red-600">Total de Despesas: R$ {{ totalDespesas.toFixed(2) }}</p>
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
                <p>Despesas Fixas: {{ ValorDespesasFixas }}</p>
                <p>Despesas Variáveis: {{ ValorDespesasVariaveis }}</p>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue'

// Dados estáticos para o dashboard
const totalReceitas = ref(5000)
const totalDespesas = ref(3500)
const quantidadeDespesasFixas = ref(5)
const quantidadeDespesasVariaveis = ref(8)
const quantidadeDespesasPagas = ref(20)
const quantidadeDespesasPendentes = ref(30)
const ValorDespesasFixas = ref(10000)
const ValorDespesasVariaveis = ref(15000)
</script>
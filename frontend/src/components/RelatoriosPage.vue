<template>
    <div>
        <h1 class="text-3xl font-bold mb-6">Relatórios</h1>

        <!-- Filtros -->
        <div class="bg-white p-6 rounded-lg shadow mb-8">
            <h2 class="text-xl font-semibold mb-4">Filtros</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block mb-2">Período</label>
                    <select v-model="filtros.periodo" class="w-full p-2 border rounded">
                        <option value="mensal">Mensal</option>
                        <option value="anual">Anual</option>
                    </select>
                </div>
                <div>
                    <label class="block mb-2">Tipo de Movimentação</label>
                    <select v-model="filtros.tipo" class="w-full p-2 border rounded">
                        <option value="todos">Todos</option>
                        <option value="receita">Receita</option>
                        <option value="despesa_fixa">Despesa Fixa</option>
                        <option value="despesa_variavel">Despesa Variável</option>
                    </select>
                </div>
                <div>
                    <label class="block mb-2">Situação</label>
                    <select v-model="filtros.situacao" class="w-full p-2 border rounded">
                        <option value="todos">Todos</option>
                        <option value="pago">Pago</option>
                        <option value="pendente">Pendente</option>
                    </select>
                </div>
                <div>
                    <label class="block mb-2">Data</label>
                    <input type="month" v-model="filtros.data" class="w-full p-2 border rounded">
                </div>
            </div>
            <button @click="buscarMovimentacoes" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Aplicar Filtros
            </button>
        </div>

        <!-- Resumo -->
        <div class="bg-white p-6 rounded-lg shadow mb-8">
            <h2 class="text-xl font-semibold mb-4">Resumo</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p class="text-lg font-medium">Total de Receitas</p>
                    <p class="text-2xl text-green-600">R$ {{ resumo.totalReceitas.toFixed(2) }}</p>
                </div>
                <div>
                    <p class="text-lg font-medium">Total de Despesas</p>
                    <p class="text-2xl text-red-600">R$ {{ resumo.totalDespesas.toFixed(2) }}</p>
                </div>
                <div>
                    <p class="text-lg font-medium">Saldo</p>
                    <p :class="['text-2xl', resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600']">
                        R$ {{ resumo.saldo.toFixed(2) }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Gráficos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">Receitas vs Despesas</h2>
                <canvas ref="barChart"></canvas>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">Distribuição de Despesas</h2>
                <canvas ref="pieChart"></canvas>
            </div>
        </div>

        <!-- Tabela de Movimentações -->
        <div class="bg-white p-6 rounded-lg shadow mb-8">
            <h2 class="text-xl font-semibold mb-4">Movimentações</h2>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="p-2 text-left">Data</th>
                            <th class="p-2 text-left">Descrição</th>
                            <th class="p-2 text-left">Tipo</th>
                            <th class="p-2 text-left">Valor</th>
                            <th class="p-2 text-left">Situação</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="mov in movimentacoes" :key="mov._id" class="border-b">
                            <td class="p-2">{{ formatarData(mov.data) }}</td>
                            <td class="p-2">{{ mov.descricao }}</td>
                            <td class="p-2">{{ formatarTipo(mov.tipo) }}</td>
                            <td class="p-2" :class="mov.tipo === 'receita' ? 'text-green-600' : 'text-red-600'">
                                R$ {{ mov.valor.toFixed(2) }}
                            </td>
                            <td class="p-2">{{ mov.situacao }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Botão Exportar PDF -->
        <button @click="exportarPDF" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Exportar para PDF
        </button>
    </div>
</template>
  
<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'

const movimentacoes = ref([])
const filtros = reactive({
    periodo: 'mensal',
    tipo: 'todos',
    situacao: 'todos',
    data: new Date().toISOString().slice(0, 7) // Formato YYYY-MM
})

const resumo = reactive({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0
})

const barChart = ref(null)
const pieChart = ref(null)
let barChartInstance = null
let pieChartInstance = null

const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
}

const formatarTipo = (tipo) => {
    switch (tipo) {
        case 'receita':
            return 'Receita'
        case 'despesa_fixa':
            return 'Despesa Fixa'
        case 'despesa_variavel':
            return 'Despesa Variável'
        default:
            return tipo
    }
}

const buscarMovimentacoes = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/relatorio', {
            params: {
                periodo: filtros.periodo,
                tipo: filtros.tipo,
                situacao: filtros.situacao,
                data: filtros.data
            }
        })
        movimentacoes.value = response.data
        calcularResumo()
        atualizarGraficos()
    } catch (error) {
        console.error('Erro ao buscar movimentações:', error)
        alert('Erro ao buscar movimentações. Por favor, tente novamente.')
    }
}

const calcularResumo = () => {
    resumo.totalReceitas = movimentacoes.value
        .filter(mov => mov.tipo === 'receita')
        .reduce((total, mov) => total + mov.valor, 0)

    resumo.totalDespesas = movimentacoes.value
        .filter(mov => mov.tipo.includes('despesa'))
        .reduce((total, mov) => total + mov.valor, 0)

    resumo.saldo = resumo.totalReceitas - resumo.totalDespesas
}

const atualizarGraficos = () => {
    if (barChartInstance) {
        barChartInstance.destroy()
    }
    if (pieChartInstance) {
        pieChartInstance.destroy()
    }

    // Gráfico de barras para Receitas vs Despesas
    barChartInstance = new Chart(barChart.value, {
        type: 'bar',
        data: {
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                label: 'Valor (R$)',
                data: [resumo.totalReceitas, resumo.totalDespesas],
                backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(239, 68, 68, 0.6)'],
                borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `R$ ${value.toFixed(2)}`
                    }
                }
            }
        }
    })

    // Gráfico de pizza para Distribuição de Despesas
    const despesasPorTipo = movimentacoes.value
        .filter(mov => mov.tipo.includes('despesa'))
        .reduce((acc, mov) => {
            acc[formatarTipo(mov.tipo)] = (acc[formatarTipo(mov.tipo)] || 0) + mov.valor
            return acc
        }, {})

    pieChartInstance = new Chart(pieChart.value, {
        type: 'pie',
        data: {
            labels: Object.keys(despesasPorTipo),
            datasets: [{
                data: Object.values(despesasPorTipo),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.6)',
                    'rgba(59, 130, 246, 0.6)'
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(59, 130, 246)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    })
}

const exportarPDF = async () => {
    try {
        const response = await axios.post('http://localhost:3000/api/exportar-pdf', {
            movimentacoes: movimentacoes.value,
            resumo: {
                totalReceitas: resumo.totalReceitas,
                totalDespesas: resumo.totalDespesas,
                saldo: resumo.saldo
            },
            filtros: {
                periodo: filtros.periodo,
                tipo: filtros.tipo,
                situacao: filtros.situacao,
                data: filtros.data
            }
        }, { responseType: 'blob' })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'relatorio.pdf')
        document.body.appendChild(link)
        link.click()
        link.remove()
    } catch (error) {
        console.error('Erro ao exportar PDF:', error)
        alert('Erro ao exportar PDF. Por favor, tente novamente.')
    }
}

onMounted(() => {
    buscarMovimentacoes()
})
</script>
  
  
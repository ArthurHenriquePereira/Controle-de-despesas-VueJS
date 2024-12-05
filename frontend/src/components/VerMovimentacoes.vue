<template>
    <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold mb-6">Lista de Movimentações</h1>

        <div v-if="movimentacoes.length === 0" class="text-center text-gray-600">
            Nenhuma movimentação cadastrada.
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="movimentacao in movimentacoes" :key="movimentacao._id" class="bg-white p-4 rounded-lg shadow">
                <div class="flex justify-between items-start mb-2">
                    <h2 class="text-xl font-semibold">{{ movimentacao.descricao }}</h2>
                    <span
                        :class="{ 'text-green-600': movimentacao.tipo === 'receita', 'text-red-600': movimentacao.tipo.includes('despesa') }">
                        {{ formatarValor(movimentacao.valor) }}
                    </span>
                </div>
                <p class="text-gray-600 mb-2">{{ formatarData(movimentacao.data) }}</p>
                <p class="mb-2">Tipo: {{ formatarTipo(movimentacao.tipo) }}</p>
                <p v-if="movimentacao.tipo.includes('despesa')" class="mb-2">
                    Situação: {{ movimentacao.situacao }}
                </p>
                <p v-if="movimentacao.tipo === 'despesa_fixa'" class="mb-2">
                    Meses: {{ movimentacao.meses }}
                </p>
                <div class="flex justify-end space-x-2 mt-4">
                    <button @click="editarMovimentacao(movimentacao)"
                        class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                        Editar
                    </button>
                    <button @click="excluirMovimentacao(movimentacao._id)"
                        class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Excluir
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal de Edição -->
        <div v-if="movimentacaoEmEdicao" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 class="text-2xl font-bold mb-4">Editar Movimentação</h2>
                <form @submit.prevent="salvarEdicao">
                    <div class="mb-4">
                        <label class="block mb-2">Tipo de Movimentação</label>
                        <select v-model="movimentacaoEmEdicao.tipo" class="w-full p-2 border rounded">
                            <option value="receita">Receita</option>
                            <option value="despesa_fixa">Despesa Fixa</option>
                            <option value="despesa_variavel">Despesa Variável</option>
                        </select>
                    </div>
                    <div v-if="movimentacaoEmEdicao.tipo === 'despesa_fixa'" class="mb-4">
                        <label class="block mb-2">Meses</label>
                        <input type="number" v-model="movimentacaoEmEdicao.meses" class="w-full p-2 border rounded" min="1">
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Descrição</label>
                        <input type="text" v-model="movimentacaoEmEdicao.descricao" class="w-full p-2 border rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Valor</label>
                        <input type="number" v-model="movimentacaoEmEdicao.valor" class="w-full p-2 border rounded"
                            step="0.01">
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Data</label>
                        <input type="date" v-model="movimentacaoEmEdicao.data" class="w-full p-2 border rounded">
                    </div>
                    <div v-if="movimentacaoEmEdicao.tipo.includes('despesa')" class="mb-4">
                        <label class="block mb-2">Situação</label>
                        <select v-model="movimentacaoEmEdicao.situacao" class="w-full p-2 border rounded">
                            <option value="pago">Pago</option>
                            <option value="pendente">Pendente</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" @click="cancelarEdicao"
                            class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                            Cancelar
                        </button>
                        <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const movimentacoes = ref([]);
const movimentacaoEmEdicao = ref(null);

onMounted(async () => {
    await carregarMovimentacoes();
});

const carregarMovimentacoes = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/movimentacoes');
        movimentacoes.value = response.data;
    } catch (error) {
        console.error('Erro ao carregar movimentações:', error);
        alert('Erro ao carregar movimentações. Por favor, tente novamente.');
    }
};

const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

const formatarData = (data) => {
    const date = new Date(data);
    const dia = String(date.getDate() + 1).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    
    return `${dia}/${mes}/${ano}`;
};

const formatarTipo = (tipo) => {
    switch (tipo) {
        case 'receita': return 'Receita';
        case 'despesa_fixa': return 'Despesa Fixa';
        case 'despesa_variavel': return 'Despesa Variável';
        default: return tipo;
    }
};

const editarMovimentacao = (movimentacao) => {
    const dataFormatada = new Date(movimentacao.data).toISOString().split('T')[0];
    movimentacaoEmEdicao.value = { ...movimentacao, data: dataFormatada };
};

const cancelarEdicao = () => {
    movimentacaoEmEdicao.value = null;
};

const salvarEdicao = async () => {
    try {
        await axios.put(`http://localhost:3000/api/movimentacoes/${movimentacaoEmEdicao.value._id}`, movimentacaoEmEdicao.value);
        await carregarMovimentacoes();
        movimentacaoEmEdicao.value = null;
    } catch (error) {
        console.error('Erro ao atualizar movimentação:', error);
        alert('Erro ao atualizar movimentação. Por favor, tente novamente.');
    }
};

const excluirMovimentacao = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
        try {
            await axios.delete(`http://localhost:3000/api/movimentacoes/${id}`);
            await carregarMovimentacoes();
        } catch (error) {
            console.error('Erro ao excluir movimentação:', error);
            alert('Erro ao excluir movimentação. Por favor, tente novamente.');
        }
    }
};
</script>
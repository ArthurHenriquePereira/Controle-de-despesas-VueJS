<template>
    <div>
        <h1 class="text-3xl font-bold mb-6">Cadastro de Movimentação</h1>

        <div class="bg-white p-6 rounded-lg shadow mb-8">
            <form @submit.prevent="cadastrarMovimentacao">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-2">Tipo de Movimentação</label>
                        <select v-model="novaMovimentacao.tipo" class="w-full p-2 border rounded">
                            <option value="receita">Receita</option>
                            <option value="despesa_fixa">Despesa Fixa</option>
                            <option value="despesa_variavel">Despesa Variável</option>
                        </select>
                    </div>
                    <div v-if="novaMovimentacao.tipo.includes('despesa')">
                        <label class="block mb-2" v-if="novaMovimentacao.tipo.includes('despesa_fixa')">Meses</label>
                        <input type="number" v-model="novaMovimentacao.meses" class="w-full p-2 border rounded" min="1" v-if="novaMovimentacao.tipo.includes('despesa_fixa')">
                    </div>
                    <div>
                        <label class="block mb-2">Descrição</label>
                        <input type="text" v-model="novaMovimentacao.descricao" class="w-full p-2 border rounded">
                    </div>
                    <div>
                        <label class="block mb-2">Valor</label>
                        <input type="number" v-model="novaMovimentacao.valor" class="w-full p-2 border rounded" step="0.01">
                    </div>
                    <div>
                        <label class="block mb-2">Data</label>
                        <input type="date" v-model="novaMovimentacao.data" class="w-full p-2 border rounded">
                    </div>
                    <div v-if="novaMovimentacao.tipo.includes('despesa')">
                        <label class="block mb-2">Situação</label>
                        <select v-model="novaMovimentacao.situacao" class="w-full p-2 border rounded">
                            <option value="pago">Pago</option>
                            <option value="pendente">Pendente</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Cadastrar Movimentação
                </button>
            </form>
        </div>
    </div>
</template>
  
<script setup>
import { reactive } from 'vue'

const novaMovimentacao = reactive({
    tipo: 'receita',
    meses: 1,
    descricao: '',
    valor: 0,
    data: '',
    situacao: 'pago'
})

const cadastrarMovimentacao = () => {
    console.log('Movimentação cadastrada:', novaMovimentacao)
    // Aqui você implementaria a lógica para salvar no banco de dados
    // Por enquanto, vamos apenas limpar o formulário
    Object.assign(novaMovimentacao, {
        tipo: 'receita',
        meses: 1,
        descricao: '',
        valor: 0,
        data: '',
        situacao: 'pago'
    })
}
</script>
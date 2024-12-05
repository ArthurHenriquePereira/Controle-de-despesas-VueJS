import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in the environment variables')
    process.exit(1)
}

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
})

.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('Could not connect to MongoDB:')
    console.error('Error name:', err.name)
    console.error('Error message:', err.message)
    if (err.reason) console.error('Error reason:', err.reason)
    if (err.code) console.error('Error code:', err.code)
    if (err.stack) console.error('Error stack:', err.stack)
    process.exit(1)
})

const MovimentacaoSchema = new mongoose.Schema({
  tipo: String,
  meses: Number,
  descricao: String,
  valor: Number,
  data: Date,
  situacao: String,
});
  
const Movimentacao = mongoose.model('Movimentacao', MovimentacaoSchema);
  
// Rota para cadastrar movimentação
app.post('/api/cadastrarMovimentacao', async (req, res) => {
  try {
    const novaMovimentacao = new Movimentacao(req.body);
    await novaMovimentacao.save();
    res.status(201).json(novaMovimentacao);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para listar todas as movimentações
app.get('/api/movimentacoes', async (req, res) => {
  try {
    const movimentacoes = await Movimentacao.find();
    res.json(movimentacoes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para atualizar uma movimentação
app.put('/api/movimentacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movimentacaoAtualizada = await Movimentacao.findByIdAndUpdate(id, req.body, { new: true });
    if (!movimentacaoAtualizada) {
      return res.status(404).json({ message: 'Movimentação não encontrada' });
    }
    res.json(movimentacaoAtualizada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para excluir uma movimentação
app.delete('/api/movimentacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movimentacaoExcluida = await Movimentacao.findByIdAndDelete(id);
    if (!movimentacaoExcluida) {
      return res.status(404).json({ message: 'Movimentação não encontrada' });
    }
    res.json({ message: 'Movimentação excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para o dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const movimentacoes = await Movimentacao.find();

    const totalReceitas = movimentacoes
      .filter(m => m.tipo === 'receita')
      .reduce((total, m) => total + m.valor, 0);

    const totalDespesas = movimentacoes
      .filter(m => m.tipo.includes('despesa'))
      .reduce((total, m) => total + m.valor, 0);

    const despesasFixas = movimentacoes.filter(m => m.tipo === 'despesa_fixa');
    const despesasVariaveis = movimentacoes.filter(m => m.tipo === 'despesa_variavel');

    const dashboardData = {
      totalReceitas,
      totalDespesas,
      quantidadeDespesasFixas: despesasFixas.length,
      quantidadeDespesasVariaveis: despesasVariaveis.length,
      quantidadeDespesasPagas: movimentacoes.filter(m => m.tipo.includes('despesa') && m.situacao === 'pago').length,
      quantidadeDespesasPendentes: movimentacoes.filter(m => m.tipo.includes('despesa') && m.situacao === 'pendente').length,
      valorDespesasFixas: despesasFixas.reduce((total, m) => total + m.valor, 0),
      valorDespesasVariaveis: despesasVariaveis.reduce((total, m) => total + m.valor, 0),
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
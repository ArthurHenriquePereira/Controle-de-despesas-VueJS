import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import PDFDocument from 'pdfkit'

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

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
})

const User = mongoose.model('User', UserSchema)

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')
  console.log(token)
  if (!token) return res.status(401).json({ error: 'Access denied' })

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    req.user = verified
    next()
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' })
  }
}

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    })

    await user.save()

    res.status(201).json({ message: 'User created successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    // Create and assign token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
    res.header('Authorization', token).json({ token, userId: user._id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user profile
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's financial summary
    const movimentacoes = await Movimentacao.find({ userId: req.user._id })
    const totalReceitas = movimentacoes
      .filter(m => m.tipo === 'receita')
      .reduce((total, m) => total + m.valor, 0)
    const totalDespesas = movimentacoes
      .filter(m => m.tipo.includes('despesa'))
      .reduce((total, m) => total + m.valor, 0)

    res.json({
      user,
      financialSummary: {
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const MovimentacaoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
    const novaMovimentacao = new Movimentacao({
      ...req.body,
      userId: req.user.userId,
    })
    await novaMovimentacao.save()
    res.status(201).json(novaMovimentacao)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Rota para listar todas as movimentações
app.get('/api/movimentacoes', async (req, res) => {
  try {
    const movimentacoes = await Movimentacao.find({ userId: req.user._id })
    res.json(movimentacoes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

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

// Rota para buscar movimentações com filtros
app.get('/api/relatorio', async (req, res) => {
  try {
    const { periodo, tipo, situacao, data } = req.query;

    let filtro = {};

    // Filtro por tipo
    if (tipo && tipo !== 'todos') {
      filtro.tipo = tipo;
    }

    // Filtro por situação
    if (situacao && situacao !== 'todos') {
      filtro.situacao = situacao;
    }

    // Filtro por data
    if (data) {
      const [ano, mes] = data.split('-');
      const dataInicio = new Date(ano, mes - 1, 1);
      let dataFim;

      if (periodo === 'mensal') {
        dataFim = new Date(ano, mes, 0); // Último dia do mês
      } else if (periodo === 'anual') {
        dataFim = new Date(ano, 11, 31); // Último dia do ano
      }

      filtro.data = {
        $gte: dataInicio,
        $lte: dataFim
      };
    }

    const movimentacoes = await Movimentacao.find(filtro).sort({ data: -1 });
    res.json(movimentacoes);
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    res.status(500).json({ message: error.message });
  }
});

// Rota para exportar PDF (implementação básica)
app.post('/api/exportar-pdf', async (req, res) => {
  try {
    const { movimentacoes, resumo, filtros } = req.body;

    // Criar um novo documento PDF
    const doc = new PDFDocument();

    // Pipe o PDF para a resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');
    doc.pipe(res);

    // Adicionar conteúdo ao PDF
    doc.fontSize(18).text('Relatório Financeiro', { align: 'center' });
    doc.moveDown();

    // Adicionar informações de filtro
    doc.fontSize(12).text(`Período: ${filtros.periodo}`);
    doc.text(`Tipo: ${filtros.tipo}`);
    doc.text(`Situação: ${filtros.situacao}`);
    doc.text(`Data: ${filtros.data}`);
    doc.moveDown();

    // Adicionar resumo
    doc.fontSize(14).text('Resumo', { underline: true });
    doc.fontSize(12).text(`Total de Receitas: R$ ${resumo.totalReceitas.toFixed(2)}`);
    doc.text(`Total de Despesas: R$ ${resumo.totalDespesas.toFixed(2)}`);
    doc.text(`Saldo: R$ ${resumo.saldo.toFixed(2)}`);
    doc.moveDown();

    // Adicionar tabela de movimentações
    doc.fontSize(14).text('Movimentações', { underline: true });
    doc.moveDown();

    // Configurações da tabela
    const tableTop = doc.y;
    const columnWidths = [60, 170, 60, 100, 80]; // Largura de cada coluna
    const headers = ['Data', 'Descrição', 'Tipo', 'Valor', 'Situação'];

    // Desenhar cabeçalho da tabela
    doc.fontSize(10).fillColor('black');
    let x = doc.x;
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop, { width: columnWidths[i], align: 'center' });
      x += columnWidths[i];
    });

    // Linha separadora abaixo do cabeçalho
    doc.moveTo(doc.x, tableTop + 15)
      .lineTo(doc.page.width - doc.page.margins.right, tableTop + 15)
      .stroke();

    // Desenhar linhas da tabela
    let rowY = tableTop + 20;
    movimentacoes.forEach((mov) => {
      if (rowY > doc.page.height - doc.page.margins.bottom) {
        // Adicionar nova página
        doc.addPage();
        rowY = doc.y;

        // Repetir cabeçalho
        x = doc.x;
        headers.forEach((header, i) => {
          doc.text(header, x, rowY, { width: columnWidths[i], align: 'center' });
          x += columnWidths[i];
        });

        // Linha separadora
        doc.moveTo(doc.x, rowY + 15)
          .lineTo(doc.page.width - doc.page.margins.right, rowY + 15)
          .stroke();

        rowY += 20; // Ajustar para a próxima linha
      }

      // Adicionar dados das movimentações
      x = 90; // Reinicia a posição inicial da linha
      doc.text(new Date(mov.data).toLocaleDateString('pt-BR'), x, rowY, { width: columnWidths[0], align: 'left' });
      x += 105;
      doc.text(mov.descricao, x, rowY, { width: columnWidths[1], align: 'left' });
      x += 125;
      doc.text(mov.tipo, x, rowY, { width: columnWidths[2], align: 'left' });
      x += 80;
      doc.text(`R$ ${mov.valor.toFixed(2)}`, x, rowY, { width: columnWidths[3], align: 'left' });
      x += 70;
      doc.text(mov.situacao, x, rowY, { width: columnWidths[4], align: 'left' });

      rowY += 20; // Próxima linha
    });

    // Finalizar o PDF
    doc.end();
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
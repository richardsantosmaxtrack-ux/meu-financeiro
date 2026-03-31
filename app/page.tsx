'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense' | 'investment'
  created_at: string
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense' | 'investment'>('income')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTransactions(data)
  }

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!description || !amount) return
    
    setLoading(true)
    // Enviando apenas o que a sua tabela possui (removi o 'category')
    const { error } = await supabase.from('transactions').insert([
      { 
        description: description, 
        amount: parseFloat(amount), 
        type: type 
      }
    ])

    if (!error) {
      setDescription('')
      setAmount('')
      fetchTransactions()
    } else {
      console.error("Erro ao salvar:", error.message)
      alert("Erro ao salvar! Verifique a conexão.")
    }
    setLoading(false)
  }

  const totalIncomes = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
  const totalInvestments = transactions.filter(t => t.type === 'investment').reduce((acc, t) => acc + t.amount, 0)
  const totalBalance = totalIncomes - totalExpenses

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black italic text-blue-500 mb-8 tracking-tighter uppercase">MEU FINANCEIRO</h1>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111827] p-6 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Entradas</p>
            <h2 className="text-2xl font-black text-emerald-400">{formatCurrency(totalIncomes)}</h2>
          </div>
          
          <div className="bg-[#111827] p-6 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Saídas</p>
            <h2 className="text-2xl font-black text-rose-500">{formatCurrency(totalExpenses)}</h2>
          </div>

          <div className="bg-[#111827] p-6 rounded-xl border border-blue-500/20">
            <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest mb-2">Investimentos</p>
            <h2 className="text-2xl font-black text-blue-400">{formatCurrency(totalInvestments)}</h2>
          </div>

          <div className="bg-blue-600 p-6 rounded-xl shadow-lg shadow-blue-900/20">
            <p className="text-[10px] text-blue-100 uppercase font-bold tracking-widest mb-2">Saldo Total</p>
            <h2 className="text-2xl font-black text-white">{formatCurrency(totalBalance)}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* COLUNA ESQUERDA: FORMULÁRIO */}
          <div className="md:col-span-4">
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold uppercase text-blue-500 mb-6 flex items-center gap-2">NOVO REGISTRO</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <input type="text" placeholder="Descrição" className="w-full bg-slate-800/40 border border-slate-700 p-4 rounded-xl outline-none" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input type="number" placeholder="Valor R$" className="w-full bg-slate-800/40 border border-slate-700 p-4 rounded-xl outline-none" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <select className="w-full bg-slate-800/40 border border-slate-700 p-4 rounded-xl outline-none" value={type} onChange={(e) => setType(e.target.value as any)}>
                  <option value="income">Entrada (+)</option>
                  <option value="expense">Saída (-)</option>
                  <option value="investment">Investimento (±)</option>
                </select>
                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase">
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </form>
            </div>
          </div>

          {/* COLUNA DIREITA: GRÁFICO E HISTÓRICO */}
          <div className="md:col-span-8 space-y-8">
            {/* GRÁFICO */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-6 italic">Fluxo Mensal</h3>
              <div className="flex items-end justify-around h-48 pt-4 border-b border-slate-800">
                <div className="flex flex-col items-center gap-2 w-full">
                   <div className="bg-emerald-500 w-12 rounded-t-lg transition-all" style={{ height: totalIncomes > 0 ? '100%' : '4px' }}></div>
                   <span className="text-[10px] text-slate-500 uppercase font-bold">Entradas</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full">
                   <div className="bg-rose-500 w-12 rounded-t-lg transition-all" style={{ height: totalExpenses > 0 ? (totalExpenses/(totalIncomes || 1) * 100) + '%' : '4px' }}></div>
                   <span className="text-[10px] text-slate-500 uppercase font-bold">Saídas</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full">
                   <div className="bg-blue-500 w-12 rounded-t-lg transition-all" style={{ height: totalInvestments > 0 ? (totalInvestments/(totalIncomes || 1) * 100) + '%' : '4px' }}></div>
                   <span className="text-[10px] text-slate-500 uppercase font-bold">Invest.</span>
                </div>
              </div>
            </div>

            {/* HISTÓRICO */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-6 italic">Histórico</h3>
              <div className="space-y-3">
                {transactions.map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-slate-800/20 rounded-xl border border-slate-700/30">
                    <div>
                      <p className="text-sm font-bold uppercase">{t.description}</p>
                      <p className="text-[10px] text-slate-500">{new Date(t.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-400' : t.type === 'investment' ? 'text-blue-400' : 'text-rose-500'}`}>
                      {t.type === 'expense' ? '-' : t.type === 'investment' ? '±' : '+'} {formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
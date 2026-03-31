'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense' | 'investment'
  category: string
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
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setTransactions(data)
  }

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!description || !amount) return

    setLoading(true)
    const { error } = await supabase.from('transactions').insert([
      { 
        description, 
        amount: parseFloat(amount), 
        type,
        category: 'Geral'
      }
    ])

    if (!error) {
      setDescription('')
      setAmount('')
      fetchTransactions()
    }
    setLoading(false)
  }

  const totalIncomes = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalInvestments = transactions
    .filter(t => t.type === 'investment')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalBalance = totalIncomes - totalExpenses

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black italic text-blue-500 mb-8 tracking-tighter">MEU FINANCEIRO</h1>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Entradas</p>
            <h2 className="text-xl font-bold text-emerald-400">{formatCurrency(totalIncomes)}</h2>
          </div>
          
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Saídas</p>
            <h2 className="text-xl font-bold text-rose-500">{formatCurrency(totalExpenses)}</h2>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-blue-500/30">
            <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest mb-1">Investimentos</p>
            <h2 className="text-xl font-bold text-blue-400">{formatCurrency(totalInvestments)}</h2>
          </div>

          <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-900/20">
            <p className="text-[10px] text-blue-100 uppercase font-bold tracking-widest mb-1">Saldo Total</p>
            <h2 className="text-xl font-bold text-white">{formatCurrency(totalBalance)}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* FORMULÁRIO */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 h-fit">
            <h3 className="text-xs font-bold uppercase text-blue-500 mb-4 flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white">+</span>
              Novo Registro
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <input
                type="text"
                placeholder="Descrição"
                className="w-full bg-slate-800/50 border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                type="number"
                placeholder="Valor R$"
                className="w-full bg-slate-800/50 border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <select
                className="w-full bg-slate-800/50 border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="income">Entrada (+)</option>
                <option value="expense">Saída (-)</option>
                <option value="investment">Investimento (±)</option>
              </select>
              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/40 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'SALVANDO...' : 'SALVAR'}
              </button>
            </form>
          </div>

          {/* HISTÓRICO */}
          <div className="md:col-span-2 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-4">Histórico Recentemente</h3>
            <div className="space-y-3">
              {transactions.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all">
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-[10px] text-slate-500">{new Date(t.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`text-sm font-black ${
                    t.type === 'income' ? 'text-emerald-400' : 
                    t.type === 'investment' ? 'text-blue-400' : 'text-rose-500'
                  }`}>
                    {t.type === 'expense' ? '-' : t.type === 'investment' ? '±' : '+'} {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-10">Nenhum registro encontrado.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
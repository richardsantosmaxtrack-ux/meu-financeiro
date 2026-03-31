'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState('income')
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  useEffect(() => { fetchTransactions() }, [])

  async function fetchTransactions() {
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false })
    if (data) setTransactions(data)
  }

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!description || !amount) return
    setLoading(true)

    // Ajuste para garantir que o banco aceite os nomes
    const { error } = await supabase.from('transactions').insert([{ 
      description: description.toUpperCase(), 
      amount: parseFloat(amount), 
      type: type, // Aqui o banco precisa aceitar 'income', 'expense' ou 'investment'
      created_at: new Date(date).toISOString()
    }])

    if (!error) {
      setDescription(''); setAmount(''); fetchTransactions()
    } else {
      console.error(error)
      alert("Erro técnico: Verifique se a coluna 'type' no Supabase aceita o valor '" + type + "'")
    }
    setLoading(false)
  }

  const filtered = transactions.filter(t => new Date(t.created_at).getMonth() === selectedMonth)
  const totalIncomes = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
  const totalInvestments = filtered.filter(t => t.type === 'investment').reduce((acc, t) => acc + t.amount, 0)

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-black italic text-blue-500 uppercase">MEU FINANCEIRO</h1>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-slate-800 p-2 rounded text-xs text-blue-400 font-bold outline-none">
            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111827] p-5 rounded-xl border border-slate-800"><p className="text-[10px] text-slate-400 font-bold mb-1">ENTRADAS</p><h2 className="text-xl font-black text-emerald-400">R$ {totalIncomes.toLocaleString('pt-BR')}</h2></div>
          <div className="bg-[#111827] p-5 rounded-xl border border-slate-800"><p className="text-[10px] text-slate-400 font-bold mb-1">SAÍDAS</p><h2 className="text-xl font-black text-rose-500">R$ {totalExpenses.toLocaleString('pt-BR')}</h2></div>
          <div className="bg-[#111827] p-5 rounded-xl border border-blue-500/20"><p className="text-[10px] text-blue-400 font-bold mb-1">INVESTIMENTOS</p><h2 className="text-xl font-black text-blue-400">R$ {totalInvestments.toLocaleString('pt-BR')}</h2></div>
          <div className="bg-blue-600 p-5 rounded-xl shadow-lg"><p className="text-[10px] text-blue-100 font-bold mb-1">SALDO TOTAL</p><h2 className="text-xl font-black text-white">R$ {(totalIncomes - totalExpenses).toLocaleString('pt-BR')}</h2></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 bg-[#111827] p-6 rounded-2xl border border-slate-800">
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <input type="text" placeholder="DESCRIÇÃO" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs outline-none" value={description} onChange={(e) => setDescription(e.target.value)} />
              <input type="number" placeholder="VALOR R$" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs outline-none" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <input type="date" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs text-slate-400 outline-none" value={date} onChange={(e) => setDate(e.target.value)} />
              <select className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs font-bold outline-none uppercase" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="income">Entrada (+)</option>
                <option value="expense">Saída (-)</option>
                <option value="investment">Investimento (±)</option>
              </select>
              <button disabled={loading} className="w-full bg-blue-600 py-4 rounded-xl font-black text-xs tracking-widest shadow-lg shadow-blue-900/40">{loading ? 'SALVANDO...' : 'SALVAR'}</button>
            </form>
          </div>

          <div className="md:col-span-8 space-y-6">
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800">
              <h3 className="text-[10px] font-black text-slate-500 mb-8 uppercase italic">Fluxo {months[selectedMonth]}</h3>
              <div className="flex items-end justify-around h-32 gap-4">
                <div className="flex flex-col items-center gap-2 w-full"><div className="bg-emerald-500 w-full rounded-t-md transition-all" style={{ height: totalIncomes > 0 ? '100%' : '4px' }}></div><span className="text-[8px] text-slate-500 font-bold uppercase">Entradas</span></div>
                <div className="flex flex-col items-center gap-2 w-full"><div className="bg-rose-500 w-full rounded-t-md transition-all" style={{ height: totalExpenses > 0 ? (totalExpenses/(totalIncomes || 1) * 100) + '%' : '4px' }}></div><span className="text-[8px] text-slate-500 font-bold uppercase">Saídas</span></div>
                <div className="flex flex-col items-center gap-2 w-full"><div className="bg-blue-500 w-full rounded-t-md transition-all" style={{ height: totalInvestments > 0 ? (totalInvestments/(totalIncomes || 1) * 100) + '%' : '4px' }}></div><span className="text-[8px] text-slate-500 font-bold uppercase">Invest.</span></div>
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800">
              <div className="space-y-2">
                {filtered.map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-[#0a0f1e]/50 rounded-xl border border-slate-800/50">
                    <div><p className="text-xs font-black uppercase text-slate-200">{t.description}</p><p className="text-[9px] text-slate-500 font-bold">{new Date(t.created_at).toLocaleDateString('pt-BR')}</p></div>
                    <span className={`text-xs font-black ${t.type === 'income' ? 'text-emerald-400' : t.type === 'investment' ? 'text-blue-400' : 'text-rose-500'}`}>R$ {t.amount.toLocaleString('pt-BR')}</span>
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
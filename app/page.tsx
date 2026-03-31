'use client'

import { useState, useEffect } from 'react'
// CORREÇÃO DA LINHA 4: Mudamos de '@/lib/supabase' para o caminho real
import { supabase } from '../lib/supabase' 

export default function Home() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState('income') // Usando 'income' que é o padrão que o banco aceita
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  useEffect(() => { fetchTransactions() }, [])

  async function fetchTransactions() {
    // Tentamos buscar de 'financeiro'. Se der erro de "table not found", troque para 'transactions'
    const { data, error } = await supabase.from('financeiro').select('*').order('created_at', { ascending: false })
    if (data) setTransactions(data)
    if (error) console.error("Erro ao buscar:", error.message)
  }

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!description || !amount) return
    setLoading(true)

    // Enviando 'income' ou 'expense' para evitar o erro de "valor recusado"
    const { error } = await supabase.from('financeiro').insert([{ 
      description: description.toUpperCase(), 
      amount: parseFloat(amount), 
      type: type, 
      created_at: new Date(date).toISOString()
    }])

    if (!error) {
      setDescription(''); setAmount(''); fetchTransactions()
      alert("✅ Salvo com sucesso!")
    } else {
      console.error(error)
      alert(`❌ Erro do Banco: ${error.message}`)
    }
    setLoading(false)
  }

  const filtered = transactions.filter(t => new Date(t.created_at).getMonth() === selectedMonth)
  const totalIncomes = filtered.filter(t => ['income', 'ENTRADA', 'Entrada (+)'].includes(t.type)).reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = filtered.filter(t => ['expense', 'SAIDA', 'Saída (-)', '→'].includes(t.type)).reduce((acc, t) => acc + t.amount, 0)

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-black italic text-blue-500 uppercase tracking-tighter">MEU FINANCEIRO</h1>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-slate-800 p-2 rounded text-xs text-blue-400 font-bold border border-slate-700 outline-none">
            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111827] p-5 rounded-xl border border-slate-800"><p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Entradas</p><h2 className="text-xl font-black text-emerald-400">R$ {totalIncomes.toLocaleString('pt-BR')}</h2></div>
          <div className="bg-[#111827] p-5 rounded-xl border border-slate-800"><p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Saídas</p><h2 className="text-xl font-black text-rose-500">R$ {totalExpenses.toLocaleString('pt-BR')}</h2></div>
          <div className="bg-blue-600 p-5 rounded-xl shadow-lg"><p className="text-[10px] text-blue-100 font-bold uppercase mb-1">Saldo Total</p><h2 className="text-xl font-black text-white">R$ {(totalIncomes - totalExpenses).toLocaleString('pt-BR')}</h2></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 bg-[#111827] p-6 rounded-2xl border border-slate-800">
            <h3 className="text-[10px] font-black text-blue-500 mb-6 uppercase tracking-widest">Novo Lançamento</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <input type="text" placeholder="DESCRIÇÃO" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs outline-none focus:border-blue-500 uppercase" value={description} onChange={(e) => setDescription(e.target.value)} />
              <input type="number" placeholder="VALOR R$" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs outline-none focus:border-blue-500" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <input type="date" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs outline-none text-slate-400" value={date} onChange={(e) => setDate(e.target.value)} />
              <select className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs font-bold outline-none uppercase" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="income">ENTRADA (+)</option>
                <option value="expense">SAÍDA (-)</option>
              </select>
              <button disabled={loading} className="w-full bg-blue-600 py-4 rounded-xl font-black text-xs tracking-widest hover:bg-blue-500 transition-all uppercase shadow-lg shadow-blue-900/40">
                {loading ? 'SALVANDO...' : 'SALVAR'}
              </button>
            </form>
          </div>

          <div className="md:col-span-8 bg-[#111827] p-6 rounded-2xl border border-slate-800">
            <h3 className="text-[10px] font-black text-slate-500 mb-6 uppercase italic tracking-widest">Histórico {months[selectedMonth]}</h3>
            <div className="space-y-2">
              {filtered.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-[#0a0f1e]/50 rounded-xl border border-slate-800/50">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-200 tracking-tighter">{t.description}</p>
                    <p className="text-[9px] text-slate-500 font-bold">{new Date(t.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`text-xs font-black ${['income', 'ENTRADA', 'Entrada (+)'].includes(t.type) ? 'text-emerald-400' : 'text-rose-500'}`}>
                    R$ {t.amount.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
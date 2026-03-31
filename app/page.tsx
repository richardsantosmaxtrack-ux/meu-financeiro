'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase' 

export default function Home() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState('income') 
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchTransactions() }, [])

  async function fetchTransactions() {
    const { data, error } = await supabase.from('transacoes').select('*').order('created_at', { ascending: false })
    if (data) setTransactions(data)
    if (error) console.error("Erro Supabase (fetch):", error.message)
  }

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!description || !amount) return
    setLoading(true)

    const payload = { 
      description: description.toUpperCase(), 
      amount: parseFloat(amount), 
      type: type, 
      created_at: new Date(date).toISOString()
    }

    const { error } = await supabase.from('transacoes').insert([payload])

    if (!error) {
      setDescription(''); setAmount(''); fetchTransactions()
      alert("✅ SALVO COM SUCESSO!")
    } else {
      console.error("Erro Supabase (insert):", error)
      alert(`❌ ERRO: ${error.message}`)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white p-8 font-sans uppercase">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-blue-500 mb-8 tracking-tighter">MEU FINANCEIRO - V2</h1>
        
        <form onSubmit={handleAddTransaction} className="bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-4 mb-8">
          <input type="text" placeholder="DESCRIÇÃO" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs uppercase" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="number" placeholder="VALOR R$" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs font-bold" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="income">ENTRADA (+)</option>
            <option value="expense">SAÍDA (-)</option>
          </select>
          <button disabled={loading} className="w-full bg-blue-600 py-4 rounded-xl font-black text-xs hover:bg-blue-500 transition-all">
            {loading ? 'PROCESSANDO...' : 'SALVAR LANÇAMENTO'}
          </button>
        </form>

        <div className="space-y-2">
          {transactions.map((t) => (
            <div key={t.id} className="flex justify-between items-center p-4 bg-[#111827] rounded-xl border border-slate-800">
              <span className="text-xs font-black">{t.description}</span>
              <span className={`text-xs font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-500'}`}>
                R$ {t.amount.toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
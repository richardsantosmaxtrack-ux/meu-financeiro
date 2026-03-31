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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState<'income' | 'expense' | 'investment'>('income')
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

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
    const { error } = await supabase.from('transactions').insert([
      { 
        description: description.toUpperCase(), 
        amount: parseFloat(amount), 
        type: type,
        created_at: new Date(date).toISOString() // Envia a data escolhida
      }
    ])

    if (!error) {
      setDescription('')
      setAmount('')
      fetchTransactions()
    } else {
      console.error(error)
      alert("Erro ao salvar! Verifique se a conexão com o Supabase está ativa.")
    }
    setLoading(false)
  }

  // Filtro que faz o site mostrar apenas o mês selecionado
  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.created_at);
    return tDate.getMonth() === selectedMonth;
  })

  const totalIncomes = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
  const totalInvestments = filteredTransactions.filter(t => t.type === 'investment').reduce((acc, t) => acc + t.amount, 0)
  const totalBalance = totalIncomes - totalExpenses

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black italic text-blue-500 tracking-tighter uppercase italic">MEU FINANCEIRO</h1>
          
          {/* SELETOR DE MESES */}
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-xs font-bold uppercase outline-none text-blue-400"
          >
            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </div>

        {/* CARDS DE RESUMO (PALETA ORIGINAL) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111827] p-5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Entradas</p>
            <h2 className="text-xl font-black text-emerald-400">R$ {totalIncomes.toLocaleString('pt-BR')}</h2>
          </div>
          
          <div className="bg-[#111827] p-5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Saídas</p>
            <h2 className="text-xl font-black text-rose-500">R$ {totalExpenses.toLocaleString('pt-BR')}</h2>
          </div>

          <div className="bg-[#111827] p-5 rounded-xl border border-blue-500/20">
            <p className="text-[10px] text-blue-400 uppercase font-bold mb-2">Investimentos</p>
            <h2 className="text-xl font-black text-blue-400">R$ {totalInvestments.toLocaleString('pt-BR')}</h2>
          </div>

          <div className="bg-blue-600 p-5 rounded-xl shadow-lg">
            <p className="text-[10px] text-blue-100 uppercase font-bold mb-2">Saldo Total</p>
            <h2 className="text-xl font-black text-white">R$ {totalBalance.toLocaleString('pt-BR')}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* FORMULÁRIO COM CAMPO DE DATA */}
          <div className="md:col-span-4">
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800">
              <h3 className="text-[10px] font-black uppercase text-blue-500 mb-6 tracking-widest">Novo Lançamento</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <input type="text" placeholder="DESCRIÇÃO" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl outline-none text-xs focus:border-blue-500 uppercase" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input type="number" placeholder="VALOR R$" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl outline-none text-xs focus:border-blue-500" value={amount} onChange={(e) => setAmount(e.target.value)} />
                
                {/* CAMPO DE DATA ADICIONADO */}
                <input type="date" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl outline-none text-xs text-slate-400 focus:border-blue-500" value={date} onChange={(e) => setDate(e.target.value)} />
                
                <select className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl outline-none text-xs focus:border-blue-500 font-bold" value={type} onChange={(e) => setType(e.target.value as any)}>
                  <option value="income">Entrada (+)</option>
                  <option value="expense">Saída (-)</option>
                  <option value="investment">Investimento (±)</option>
                </select>
                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all">
                  {loading ? 'SALVANDO...' : 'SALVAR'}
                </button>
              </form>
            </div>
          </div>

          {/* GRÁFICO E HISTÓRICO */}
          <div className="md:col-span-8 space-y-6">
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800">
              <h3 className="text-[10px] font-black uppercase text-slate-500 mb-8 italic tracking-widest">Fluxo {months[selectedMonth]}</h3>
              <div className="flex items-end justify-around h-40 gap-4">
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="bg-emerald-500 w-full rounded-t-lg transition-all" style={{ height: totalIncomes > 0 ? '100%' : '4px' }}></div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Entradas</span>
                </div>
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="bg-rose-500 w-full rounded-t-lg transition-all" style={{ height: totalExpenses > 0 ? (totalExpenses/(totalIncomes || totalExpenses) * 100) + '%' : '4px' }}></div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Saídas</span>
                </div>
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="bg-blue-500 w-full rounded-t-lg transition-all" style={{ height: totalInvestments > 0 ? (totalInvestments/(totalIncomes || totalInvestments) * 100) + '%' : '4px' }}></div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Invest.</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800">
              <h3 className="text-[10px] font-black uppercase text-slate-500 mb-6 italic tracking-widest">Histórico de Lançamentos</h3>
              <div className="space-y-2">
                {filteredTransactions.map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-[#0a0f1e]/50 rounded-xl border border-slate-800/50">
                    <div>
                      <p className="text-xs font-black uppercase text-slate-200">{t.description}</p>
                      <p className="text-[9px] text-slate-500 font-bold">{new Date(t.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className={`text-xs font-black ${t.type === 'income' ? 'text-emerald-400' : t.type === 'investment' ? 'text-blue-400' : 'text-rose-500'}`}>
                      {t.type === 'expense' ? '-' : t.type === 'investment' ? '±' : '+'} R$ {t.amount.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <p className="text-center text-slate-600 text-[10px] uppercase font-bold py-10">Nenhum registro em {months[selectedMonth]}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
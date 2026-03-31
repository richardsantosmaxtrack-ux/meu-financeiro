'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase' 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function Home() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState('income') 
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  useEffect(() => { 
    fetchTransactions() 
  }, [])

  async function fetchTransactions() {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setTransactions(data)
    if (error) console.error("Erro ao buscar:", error.message)
  }

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!description || !amount) return
    setLoading(true)

    const { error } = await supabase.from('transacoes').insert([{ 
      description: description.toUpperCase(), 
      amount: parseFloat(amount), 
      type: type, 
      created_at: new Date(date).toISOString()
    }])

    if (!error) {
      setDescription(''); 
      setAmount(''); 
      setDate(new Date().toISOString().split('T')[0]);
      fetchTransactions();
    } else {
      alert(`❌ ERRO NO BANCO: ${error.message}`)
    }
    setLoading(false)
  }

  // CÁLCULOS E FILTROS
  const filtered = transactions.filter(t => new Date(t.created_at).getMonth() === selectedMonth)
  
  const totalIncomes = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
  const totalInvest = filtered.filter(t => t.type === 'investment').reduce((acc, t) => acc + t.amount, 0)
  const saldoGeral = totalIncomes - totalExpenses - totalInvest

  const chartData = [
    { name: 'Entradas', valor: totalIncomes, color: '#10b981' },
    { name: 'Saídas', valor: totalExpenses, color: '#f43f5e' },
    { name: 'Invest.', valor: totalInvest, color: '#8b5cf6' }
  ]

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white p-4 md:p-8 font-sans uppercase">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-black italic text-blue-500 tracking-tighter uppercase">MEU FINANCEIRO</h1>
          <div className="flex flex-col items-end">
             <label className="text-[9px] text-slate-500 font-bold mb-1">VISUALIZAR MÊS:</label>
             <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
                className="bg-slate-800 p-2 rounded text-xs text-blue-400 font-bold border border-slate-700 outline-none"
             >
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
             </select>
          </div>
        </div>

        {/* 4 CARDS DE RESUMO COM CONTRASTE AJUSTADO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111827] p-5 rounded-xl border border-slate-800 shadow-lg shadow-emerald-900/5">
            <p className="text-[10px] text-emerald-400 font-black mb-1 tracking-widest">ENTRADAS</p>
            <h2 className="text-xl font-black text-white"> {/* ✅ VALOR EM BRANCO PARA LEITURA */}
              R$ {totalIncomes.toLocaleString('pt-BR')}
            </h2>
          </div>
          <div className="bg-[#111827] p-5 rounded-xl border border-slate-800 shadow-lg shadow-rose-900/5">
            <p className="text-[10px] text-rose-500 font-black mb-1 tracking-widest">SAÍDAS</p>
            <h2 className="text-xl font-black text-white"> {/* ✅ VALOR EM BRANCO PARA LEITURA */}
              R$ {totalExpenses.toLocaleString('pt-BR')}
            </h2>
          </div>
          <div className="bg-[#111827] p-5 rounded-xl border border-slate-800 shadow-lg shadow-purple-900/5">
            <p className="text-[10px] text-purple-400 font-black mb-1 tracking-widest">INVESTIMENTOS</p>
            <h2 className="text-xl font-black text-white"> {/* ✅ VALOR EM BRANCO PARA LEITURA */}
              R$ {totalInvest.toLocaleString('pt-BR')}
            </h2>
          </div>
          <div className="bg-blue-600 p-5 rounded-xl shadow-xl shadow-blue-900/30">
            <p className="text-[10px] text-blue-100 font-black mb-1 tracking-widest">SALDO ATUAL</p>
            <h2 className="text-xl font-black text-white">
              R$ {saldoGeral.toLocaleString('pt-BR')}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* COLUNA ESQUERDA: FORM E GRÁFICO */}
          <div className="md:col-span-5 space-y-8">
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-2xl">
              <h3 className="text-[10px] font-black text-blue-500 mb-6 tracking-widest text-center">NOVO LANÇAMENTO</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <input type="text" placeholder="DESCRIÇÃO" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs outline-none focus:border-blue-500 uppercase" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input type="number" placeholder="VALOR R$" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs outline-none focus:border-blue-500" value={amount} onChange={(e) => setAmount(e.target.value)} />
                
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-slate-500 font-bold ml-1 uppercase">DATA DO LANÇAMENTO</label>
                  <input type="date" className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs outline-none text-slate-400 focus:border-blue-500" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <select className="w-full bg-[#0a0f1e] border border-slate-700 p-4 rounded-xl text-xs font-bold outline-none" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="income">ENTRADA (+)</option>
                  <option value="expense">SAÍDA (-)</option>
                  <option value="investment">INVESTIMENTO (💰)</option>
                </select>

                <button disabled={loading} className="w-full bg-blue-600 py-4 rounded-xl font-black text-xs hover:bg-blue-500 transition-all uppercase tracking-widest shadow-lg shadow-blue-900/20">
                  {loading ? 'SALVANDO...' : 'SALVAR LANÇAMENTO'}
                </button>
              </form>
            </div>

            {/* GRÁFICO */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 h-[320px] shadow-2xl">
              <h3 className="text-[10px] font-black text-slate-500 mb-6 tracking-widest text-center">VISÃO MENSAL</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '10px'}} />
                  <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* COLUNA DIREITA: HISTÓRICO */}
          <div className="md:col-span-7 bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-2xl h-fit">
            <h3 className="text-[10px] font-black text-slate-500 mb-6 italic tracking-widest text-center">HISTÓRICO DETALHADO</h3>
            <div className="space-y-2 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
              {filtered.length === 0 && <p className="text-center text-slate-600 py-10 text-[10px]">NENHUM LANÇAMENTO NESTE MÊS.</p>}
              {filtered.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-[#0a0f1e]/50 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-all">
                  <div>
                    <p className="text-xs font-black text-slate-200 uppercase">{t.description}</p>
                    <p className="text-[9px] text-slate-500 font-bold">{new Date(t.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`text-xs font-black ${t.type === 'income' ? 'text-emerald-400' : t.type === 'investment' ? 'text-purple-400' : 'text-rose-500'}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
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
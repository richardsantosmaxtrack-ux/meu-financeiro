'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign, 
  Calendar, 
  PlusCircle, 
  TrendingUp 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('Entrada');
  const [dataSelecao, setDataSelecao] = useState(new Date().toISOString().split('T')[0]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);

  const carregarDados = async () => {
    const anoAtual = 2026;
    const inicioMes = `${anoAtual}-${String(mesFiltro).padStart(2, '0')}-01`;
    const fimMes = `${anoAtual}-${String(mesFiltro).padStart(2, '0')}-31`;

    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .gte('data', inicioMes)
      .lte('data', fimMes)
      .order('data', { ascending: false });

    if (!error && data) setTransacoes(data);
  };

  useEffect(() => { carregarDados(); }, [mesFiltro]);

  const salvarLancamento = async () => {
    if (!descricao.trim() || !valor) return alert("Preencha todos os campos!");
    const { error } = await supabase.from('transacoes').insert([
      { descricao: descricao.trim(), valor: parseFloat(valor), tipo, data: dataSelecao }
    ]);
    if (!error) { setDescricao(''); setValor(''); carregarDados(); }
  };

  const entradas = transacoes.filter(t => t.tipo === 'Entrada').reduce((acc, t) => acc + t.valor, 0);
  const saídas = transacoes.filter(t => t.tipo === 'Saída').reduce((acc, t) => acc + t.valor, 0);
  const saldo = entradas - saídas;

  const dadosGrafico = [
    { name: 'Entradas', total: entradas, color: '#10b981' },
    { name: 'Saídas', total: saídas, color: '#f43f5e' }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-blue-500 italic uppercase">
            Meu Financeiro
          </h1>
          
          {/* Seletor de Mês - iOS Friendly */}
          <div className="flex items-center gap-3 bg-slate-900 p-3 px-5 rounded-2xl border border-slate-800 w-full sm:w-auto justify-center">
            <Calendar className="text-blue-400" size={18} />
            <select 
              value={mesFiltro} 
              onChange={(e) => setMesFiltro(Number(e.target.value))}
              className="bg-transparent text-base font-bold outline-none cursor-pointer text-white appearance-none border-none focus:ring-0"
            >
              {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
                <option key={i} value={i + 1} className="bg-[#0f172a] text-white">{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-emerald-500/10 backdrop-blur-md">
            <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Entradas</span>
            <p className="text-2xl font-black text-emerald-400">R$ {entradas.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-rose-500/10 backdrop-blur-md">
            <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Saídas</span>
            <p className="text-2xl font-black text-rose-400">R$ {saídas.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-900/20 sm:col-span-2 lg:col-span-1">
            <span className="text-blue-100 text-[10px] font-bold uppercase block mb-1">Saldo Total</span>
            <p className="text-2xl font-black text-white">R$ {saldo.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulário - Evita Zoom no iOS */}
          <div className="lg:col-span-4 order-1">
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-2xl">
              <h2 className="text-xs font-black mb-6 text-blue-500 flex items-center gap-2 uppercase">
                <PlusCircle size={18} /> Novo Registro
              </h2>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Descrição" 
                  className="w-full p-4 bg-slate-950 rounded-2xl border border-slate-800 text-base outline-none focus:border-blue-500 transition-all text-white" 
                  value={descricao} 
                  onChange={(e) => setDescricao(e.target.value)} 
                />
                <input 
                  type="number" 
                  inputMode="decimal"
                  placeholder="Valor" 
                  className="w-full p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-base outline-none focus:border-blue-500 text-white" 
                  value={valor} 
                  onChange={(e) => setValor(e.target.value)} 
                />
                <input 
                  type="date" 
                  className="w-full p-4 bg-slate-950 rounded-2xl border border-slate-800 text-base text-slate-400 outline-none focus:border-blue-500" 
                  value={dataSelecao} 
                  onChange={(e) => setDataSelecao(e.target.value)} 
                />
                <select 
                  className="w-full p-4 bg-slate-950 rounded-2xl border border-slate-800 text-base outline-none focus:border-blue-500 appearance-none text-white" 
                  value={tipo} 
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="Entrada" className="bg-[#020617] text-white">Entrada (+)</option>
                  <option value="Saída" className="bg-[#020617] text-white">Saída (-)</option>
                </select>
                <button 
                  onClick={salvarLancamento} 
                  className="w-full py-5 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest active:bg-blue-700 transition-all"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>

          {/* Gráfico e Lista */}
          <div className="lg:col-span-8 space-y-8 order-2">
            <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6">
              <h2 className="text-xs font-black mb-6 text-blue-500 flex items-center gap-2 uppercase">
                <TrendingUp size={18} /> Fluxo Mensal
              </h2>
              <div className="w-full" style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.03)'}} 
                      contentStyle={{backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff'}} 
                      itemStyle={{color: '#fff'}}
                    />
                    <Bar dataKey="total" radius={[12, 12, 12, 12]} barSize={60}>
                      {dadosGrafico.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6">
              <h2 className="text-[10px] font-black text-slate-500 mb-6 uppercase tracking-widest">Histórico</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto overflow-x-hidden">
                {transacoes.map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-2xl border border-slate-900">
                    <div className="flex flex-col max-w-[60%]">
                      <span className="text-xs font-bold text-slate-100 truncate">{t.descricao}</span>
                      <span className="text-[9px] text-slate-500">{new Date(t.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className={`text-xs font-black whitespace-nowrap ${t.tipo === 'Entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.tipo === 'Entrada' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
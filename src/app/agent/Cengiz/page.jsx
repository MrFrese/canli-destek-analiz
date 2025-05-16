// src/app/agent/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useDataStore from '@/store/dataStore';
import { analyzeAgentPerformance, calculateTeamAverages } from '@/lib/ai-analysis';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PdfExport from '@/components/reports/PdfExport';
import ExcelExport from '@/components/reports/ExcelExport';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function AgentDetail() {
  const router = useRouter();
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const { 
    getAgentPerformance, 
    getAgentRatings, 
    getAggregatedPerformanceData,
  } = useDataStore();
  
  const [notes, setNotes] = useState('');
  
  // Kimlik doğrulama kontrolü
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  // Temsilci verileri
  const agentName = decodeURIComponent(id);
  const performanceData = getAgentPerformance(agentName);
  const ratingData = getAgentRatings(agentName);
  const allAgentsData = getAggregatedPerformanceData();
  
  // Temsilcinin birleştirilmiş verileri
  const agentData = allAgentsData.find(agent => agent.name === agentName) || {
    name: agentName,
    totalChats: 0,
    avgHandleTime: 0,
    avgRating: 0
  };
  
  // Ekip ortalaması
  const teamAverage = calculateTeamAverages(allAgentsData);
  
  // AI analizi
  const aiAnalysis = analyzeAgentPerformance(agentData, teamAverage);
  
  // Tarih formatı
  // src/app/agent/[id]/page.jsx (devamı)
  // Tarih formatı
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  };
  
  // Performans verilerini grafik için formatlama
  const formattedPerformanceData = performanceData.map(item => ({
    date: item.Date,
    handleTime: item.AvgHandleTime,
    chatCount: item.ChatCount
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Değerlendirme verilerini grafik için formatlama
  const formattedRatingData = ratingData.map(item => ({
    date: item.Date,
    rating: item.Rating
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {agentName} - Temsilci Analizi
              </h1>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Geri Dön
                </button>
                
                <PdfExport 
                  agentName={agentName} 
                  performanceData={performanceData} 
                  ratingData={ratingData}
                  aiAnalysis={aiAnalysis}
                  notes={notes}
                />
                
                <ExcelExport 
                  agentName={agentName} 
                  performanceData={performanceData} 
                  ratingData={ratingData}
                />
              </div>
            </div>
            
            {performanceData.length === 0 && ratingData.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <p className="text-gray-500 dark:text-gray-400">
                  Bu temsilci için veri bulunamadı.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Özet İstatistikler */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Toplam Görüşme */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Toplam Görüşme
                    </h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {agentData.totalChats}
                    </p>
                    <div className="mt-1">
                      {teamAverage.totalChats > 0 && (
                        <span className={`text-xs ${
                          agentData.totalChats >= teamAverage.totalChats 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {agentData.totalChats >= teamAverage.totalChats ? '↑' : '↓'} 
                          Ekip ort: {Math.round(teamAverage.totalChats)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Ortalama Süre */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Ortalama Görüşme Süresi
                    </h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {Math.round(agentData.avgHandleTime)} sn
                    </p>
                    <div className="mt-1">
                      {teamAverage.avgHandleTime > 0 && (
                        <span className={`text-xs ${
                          agentData.avgHandleTime <= teamAverage.avgHandleTime 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {agentData.avgHandleTime <= teamAverage.avgHandleTime ? '↓' : '↑'} 
                          Ekip ort: {Math.round(teamAverage.avgHandleTime)} sn
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Ortalama Puan */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Ortalama Yıldız Puanı
                    </h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {agentData.avgRating ? agentData.avgRating.toFixed(1) : '-'}
                    </p>
                    <div className="mt-1">
                      {teamAverage.avgRating > 0 && agentData.avgRating > 0 && (
                        <span className={`text-xs ${
                          agentData.avgRating >= teamAverage.avgRating 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {agentData.avgRating >= teamAverage.avgRating ? '↑' : '↓'} 
                          Ekip ort: {teamAverage.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* AI Analiz Raporu */}
                {aiAnalysis && (
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Yapay Zeka Analiz Raporu
                    </h2>
                    
                    <div className="space-y-4">
                      {/* Genel Performans */}
                      <div>
                        <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
                          Genel Performans
                        </h3>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                          {aiAnalysis.performance}
                        </p>
                      </div>
                      
                      {/* Güçlü Yönler */}
                      <div>
                        <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
                          Güçlü Yönler
                        </h3>
                        <ul className="mt-1 ml-5 list-disc text-gray-600 dark:text-gray-400">
                          {aiAnalysis.strengths.map((strength, index) => (
                            <li key={`strength-${index}`}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Gelişim Alanları */}
                      <div>
                        <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
                          Gelişim Alanları
                        </h3>
                        <ul className="mt-1 ml-5 list-disc text-gray-600 dark:text-gray-400">
                          {aiAnalysis.weaknesses.map((weakness, index) => (
                            <li key={`weakness-${index}`}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Aksiyon Önerileri */}
                      <div>
                        <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
                          Aksiyon Önerileri
                        </h3>
                        <ul className="mt-1 ml-5 list-disc text-gray-600 dark:text-gray-400">
                          {aiAnalysis.actionItems.map((action, index) => (
                            <li key={`action-${index}`}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Grafikler */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Görüşme Süresi Grafiği */}
                  {formattedPerformanceData.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Görüşme Süresi Değişimi
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={formattedPerformanceData}
                            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              stroke="#9CA3AF"
                            />
                            <YAxis 
                              stroke="#9CA3AF"
                              label={{ 
                                value: 'Süre (sn)', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { fill: '#9CA3AF', textAnchor: 'middle' }
                              }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                borderColor: '#374151',
                                color: '#F9FAFB'
                              }}
                              formatter={(value) => [`${Math.round(value)} sn`, 'Ortalama Süre']}
                              labelFormatter={(label) => `Tarih: ${formatDate(label)}`}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="handleTime" 
                              stroke="#3B82F6"
                              fill="#3B82F680"
                              name="Ortalama Süre"
                              strokeWidth={2}
                              activeDot={{ r: 6 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  
                  {/* Yıldız Değerlendirme Grafiği */}
                  {formattedRatingData.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Yıldız Değerlendirme Değişimi
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={formattedRatingData}
                            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate} 
                              stroke="#9CA3AF"
                            />
                            <YAxis 
                              domain={[0, 5]} 
                              ticks={[1, 2, 3, 4, 5]} 
                              stroke="#9CA3AF"
                              label={{ 
                                value: 'Yıldız (1-5)', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { fill: '#9CA3AF', textAnchor: 'middle' }
                              }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                borderColor: '#374151',
                                color: '#F9FAFB'
                              }}
                              formatter={(value) => [`${value} yıldız`, 'Değerlendirme']}
                              labelFormatter={(label) => `Tarih: ${formatDate(label)}`}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="rating" 
                              stroke="#FBBF24"
                              name="Yıldız"
                              strokeWidth={2}
                              dot={{ r: 4, fill: '#FBBF24' }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Notlar */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Performans Notları
                  </h3>
                  <textarea
                    rows={4}
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                    placeholder="Temsilcinin performansı hakkında notlar ekleyin. Bu notlar raporda yer alacaktır."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
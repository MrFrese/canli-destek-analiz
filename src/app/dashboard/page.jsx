// src/app/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useDataStore from '@/store/dataStore';
import CsvUploader from '@/components/upload/CsvUploader';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import AgentList from '@/components/dashboard/AgentList';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import RatingChart from '@/components/dashboard/RatingChart';
import DateFilter from '@/components/dashboard/DateFilter';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { 
    agentPerformance, 
    agentRatings, 
    getDateRange, 
    setFilteredDates,
    getAggregatedPerformanceData,
    getDailyPerformanceData,
    getRatingDistribution
  } = useDataStore();
  
  const [dateRange, setDateRange] = useState({ minDate: null, maxDate: null });
  const [selectedRange, setSelectedRange] = useState({ startDate: null, endDate: null });
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  
  // Kimlik doğrulama kontrolü
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  // Veri durumu kontrolü
  useEffect(() => {
    const hasPerformanceData = agentPerformance && agentPerformance.length > 0;
    const hasRatingData = agentRatings && agentRatings.length > 0;
    
    setIsDataAvailable(hasPerformanceData && hasRatingData);
    
    if (hasPerformanceData || hasRatingData) {
      const range = getDateRange();
      setDateRange(range);
      
      // İlk yüklemede tüm tarih aralığını seç
      if (!selectedRange.startDate && range.minDate) {
        const newRange = {
          startDate: range.minDate,
          endDate: range.maxDate
        };
        setSelectedRange(newRange);
        setFilteredDates(newRange);
      }
    }
  }, [agentPerformance, agentRatings, getDateRange, setFilteredDates, selectedRange.startDate]);
  
  // Tarih filtresi değişikliği
  const handleDateChange = (newRange) => {
    setSelectedRange(newRange);
    setFilteredDates(newRange);
  };
  
  // Veri analizi için gerekli veriler
  const aggregatedData = getAggregatedPerformanceData();
  const dailyData = getDailyPerformanceData();
  const ratingDistribution = getRatingDistribution();
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Canlı Destek Temsilci Analizi
            </h1>
            
            {!isDataAvailable ? (
              <CsvUploader />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <DateFilter 
                      minDate={dateRange.minDate}
                      maxDate={dateRange.maxDate}
                      startDate={selectedRange.startDate}
                      endDate={selectedRange.endDate}
                      onDateChange={handleDateChange}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <button
                      onClick={() => setIsDataAvailable(false)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      Yeni CSV Yükle
                    </button>
                  </div>
                </div>
                
                {/* İstatistik Özeti */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Toplam Temsilci */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Toplam Temsilci
                    </h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {aggregatedData.length}
                    </p>
                  </div>
                  
                  {/* Toplam Görüşme */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Toplam Görüşme
                    </h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {aggregatedData.reduce((sum, agent) => sum + agent.totalChats, 0)}
                    </p>
                  </div>
                  
                  {/* Ortalama Süre */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Ortalama Görüşme Süresi
                    </h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {aggregatedData.length > 0 
                        ? Math.round(
                            aggregatedData.reduce((sum, agent) => 
                              sum + agent.avgHandleTime, 0
                            ) / aggregatedData.length
                          )
                        : 0} sn
                    </p>
                  </div>
                  
                  {/* Ortalama Puan */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Ortalama Yıldız Puanı
                    </h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {aggregatedData.filter(a => a.avgRating > 0).length > 0 
                        ? (
                            aggregatedData
                              .filter(a => a.avgRating > 0)
                              .reduce((sum, agent) => sum + agent.avgRating, 0) / 
                            aggregatedData.filter(a => a.avgRating > 0).length
                          ).toFixed(1)
                        : 0}
                    </p>
                  </div>
                </div>
                
                {/* Ana Grafikler */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performans Grafiği */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Günlük Konuşma İstatistikleri
                    </h3>
                    <div className="h-80">
                      <PerformanceChart data={dailyData} />
                    </div>
                  </div>
                  
                  {/* Yıldız Dağılımı */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Yıldız Dağılımı
                    </h3>
                    <div className="h-80">
                      <RatingChart data={ratingDistribution} />
                    </div>
                  </div>
                </div>
                
                {/* Temsilci Listesi */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Temsilci Performansları
                    </h3>
                  </div>
                  <AgentList data={aggregatedData} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
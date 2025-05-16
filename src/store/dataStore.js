// src/store/dataStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useDataStore = create(
  persist(
    (set, get) => ({
      // Veri durumları
      agentPerformance: [],
      agentRatings: [],
      filteredDates: { startDate: null, endDate: null },
      selectedAgents: [],
      
      // Veri ayarlama işlevleri
      setAgentPerformance: (data) => set({ agentPerformance: data }),
      setAgentRatings: (data) => set({ agentRatings: data }),
      setFilteredDates: (dates) => set({ filteredDates: dates }),
      setSelectedAgents: (agents) => set({ selectedAgents: agents }),
      
      // Tüm ajanları getir (tekrarsız)
      getAllAgents: () => {
        const { agentPerformance, agentRatings } = get();
        
        // İki diziden de ajanları topla
        const agentsFromPerformance = agentPerformance.map(item => item.AgentName);
        const agentsFromRatings = agentRatings.map(item => item.AgentName);
        
        // Birleştir ve tekrarları kaldır
        const allAgents = [...new Set([...agentsFromPerformance, ...agentsFromRatings])];
        
        return allAgents.filter(Boolean).sort();
      },
      
      // Belirli bir ajanın performans verilerini getir
      getAgentPerformance: (agentName) => {
        const { agentPerformance, filteredDates } = get();
        let filteredData = agentPerformance.filter(item => item.AgentName === agentName);
        
        // Tarih filtresi uygula
        if (filteredDates.startDate && filteredDates.endDate) {
          filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.Date);
            return (
              itemDate >= new Date(filteredDates.startDate) && 
              itemDate <= new Date(filteredDates.endDate)
            );
          });
        }
        
        return filteredData;
      },
      
      // Belirli bir ajanın değerlendirme verilerini getir
      getAgentRatings: (agentName) => {
        const { agentRatings, filteredDates } = get();
        let filteredData = agentRatings.filter(item => item.AgentName === agentName);
        
        // Tarih filtresi uygula
        if (filteredDates.startDate && filteredDates.endDate) {
          filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.Date);
            return (
              itemDate >= new Date(filteredDates.startDate) && 
              itemDate <= new Date(filteredDates.endDate)
            );
          });
        }
        
        return filteredData;
      },
      
      // Tarih aralığını getir (en erken ve en geç tarihler)
      getDateRange: () => {
        const { agentPerformance, agentRatings } = get();
        
        // İki veri setinden de tarihleri topla
        const allDates = [
          ...agentPerformance.map(item => new Date(item.Date)),
          ...agentRatings.map(item => new Date(item.Date))
        ];
        
        if (allDates.length === 0) {
          return { minDate: null, maxDate: null };
        }
        
        // En erken ve en geç tarihleri bul
        const minDate = new Date(Math.min(...allDates));
        const maxDate = new Date(Math.max(...allDates));
        
        return {
          minDate: minDate.toISOString().split('T')[0],
          maxDate: maxDate.toISOString().split('T')[0]
        };
      },
      
      // Tüm ajanların ortalama verilerini getir (dashboardda kullanılacak)
      getAggregatedPerformanceData: () => {
        const { agentPerformance, agentRatings, selectedAgents, filteredDates } = get();
        const agentData = {};
        
        // Filtrelenmiş performans verileri
        let filteredPerformance = [...agentPerformance];
        let filteredRatings = [...agentRatings];
        
        // Tarih filtresi uygula
        if (filteredDates.startDate && filteredDates.endDate) {
          const startDate = new Date(filteredDates.startDate);
          const endDate = new Date(filteredDates.endDate);
          
          filteredPerformance = filteredPerformance.filter(item => {
            const itemDate = new Date(item.Date);
            return itemDate >= startDate && itemDate <= endDate;
          });
          
          filteredRatings = filteredRatings.filter(item => {
            const itemDate = new Date(item.Date);
            return itemDate >= startDate && itemDate <= endDate;
          });
        }
        
        // Ajan filtresi uygula
        if (selectedAgents.length > 0) {
          filteredPerformance = filteredPerformance.filter(item => 
            selectedAgents.includes(item.AgentName)
          );
          
          filteredRatings = filteredRatings.filter(item => 
            selectedAgents.includes(item.AgentName)
          );
        }
        
        // Performans verilerini işle
        filteredPerformance.forEach(item => {
          if (!agentData[item.AgentName]) {
            agentData[item.AgentName] = {
              name: item.AgentName,
              totalChats: 0,
              totalHandleTime: 0,
              avgHandleTime: 0,
              ratings: [],
              avgRating: 0
            };
          }
          
          agentData[item.AgentName].totalChats += item.ChatCount;
          agentData[item.AgentName].totalHandleTime += item.AvgHandleTime * item.ChatCount;
        });
        
        // Değerlendirme verilerini işle
        filteredRatings.forEach(item => {
          if (!agentData[item.AgentName]) {
            agentData[item.AgentName] = {
              name: item.AgentName,
              totalChats: 0,
              totalHandleTime: 0,
              avgHandleTime: 0,
              ratings: [],
              avgRating: 0
            };
          }
          
          agentData[item.AgentName].ratings.push(item.Rating);
        });
        
        // Ortalama değerleri hesapla
        Object.values(agentData).forEach(agent => {
          if (agent.totalChats > 0) {
            agent.avgHandleTime = agent.totalHandleTime / agent.totalChats;
          }
          
          if (agent.ratings.length > 0) {
            const sum = agent.ratings.reduce((acc, rating) => acc + rating, 0);
            agent.avgRating = sum / agent.ratings.length;
          }
        });
        
        return Object.values(agentData);
      },
      
      // src/store/dataStore.js (devamı)
      // Tarih bazlı günlük analiz verilerini getir
      getDailyPerformanceData: () => {
        const { agentPerformance, selectedAgents, filteredDates } = get();
        const dailyData = {};
        
        // Filtrelenmiş veriler
        let filteredPerformance = [...agentPerformance];
        
        // Tarih filtresi uygula
        if (filteredDates.startDate && filteredDates.endDate) {
          const startDate = new Date(filteredDates.startDate);
          const endDate = new Date(filteredDates.endDate);
          
          filteredPerformance = filteredPerformance.filter(item => {
            const itemDate = new Date(item.Date);
            return itemDate >= startDate && itemDate <= endDate;
          });
        }
        
        // Ajan filtresi uygula
        if (selectedAgents.length > 0) {
          filteredPerformance = filteredPerformance.filter(item => 
            selectedAgents.includes(item.AgentName)
          );
        }
        
        // Günlük verileri topla
        filteredPerformance.forEach(item => {
          const date = item.Date;
          
          if (!dailyData[date]) {
            dailyData[date] = {
              date,
              totalChats: 0,
              totalHandleTime: 0,
              agents: new Set()
            };
          }
          
          dailyData[date].totalChats += item.ChatCount;
          dailyData[date].totalHandleTime += item.AvgHandleTime * item.ChatCount;
          dailyData[date].agents.add(item.AgentName);
        });
        
        // Sete çevir ve ortalama hesapla
        const result = Object.values(dailyData).map(day => ({
          date: day.date,
          totalChats: day.totalChats,
          avgHandleTime: day.totalChats > 0 ? day.totalHandleTime / day.totalChats : 0,
          agentCount: day.agents.size
        }));
        
        // Tarihe göre sırala
        return result.sort((a, b) => new Date(a.date) - new Date(b.date));
      },
      
      // Yıldız dağılımı verilerini getir
      getRatingDistribution: () => {
        const { agentRatings, selectedAgents, filteredDates } = get();
        const distribution = {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
        
        // Filtrelenmiş veriler
        let filteredRatings = [...agentRatings];
        
        // Tarih filtresi uygula
        if (filteredDates.startDate && filteredDates.endDate) {
          const startDate = new Date(filteredDates.startDate);
          const endDate = new Date(filteredDates.endDate);
          
          filteredRatings = filteredRatings.filter(item => {
            const itemDate = new Date(item.Date);
            return itemDate >= startDate && itemDate <= endDate;
          });
        }
        
        // Ajan filtresi uygula
        if (selectedAgents.length > 0) {
          filteredRatings = filteredRatings.filter(item => 
            selectedAgents.includes(item.AgentName)
          );
        }
        
        // Dağılımı hesapla
        filteredRatings.forEach(item => {
          const rating = Math.round(item.Rating);
          if (rating >= 1 && rating <= 5) {
            distribution[rating]++;
          }
        });
        
        // Grafiğe uygun formata dönüştür
        return Object.entries(distribution).map(([rating, count]) => ({
          rating: Number(rating),
          count
        }));
      }
    }),
    {
      name: 'agent-data-storage',
      partialize: (state) => ({ 
        agentPerformance: state.agentPerformance,
        agentRatings: state.agentRatings 
      }),
    }
  )
);

export default useDataStore;
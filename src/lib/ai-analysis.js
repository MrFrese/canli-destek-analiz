// src/lib/ai-analysis.js
/**
 * Temsilci verilerini analiz ederek AI tabanlı performans raporu oluşturur.
 * Bu fonksiyon gerçek uygulamada daha karmaşık bir AI modeline bağlanabilir.
 */
export const analyzeAgentPerformance = (agentData, teamAverage) => {
  if (!agentData || !teamAverage) return null;
  
  const { name, totalChats, avgHandleTime, avgRating } = agentData;
  
  // Analiz sonuçları
  const results = {
    performance: '', // Genel performans
    strengths: [],   // Güçlü yönler
    weaknesses: [],  // Zayıf yönler
    actionItems: [], // Önerilen aksiyonlar
  };
  
  // Performans karşılaştırmaları
  const chatVolumeDiff = totalChats - teamAverage.totalChats;
  const chatVolumePercent = teamAverage.totalChats > 0 
    ? (chatVolumeDiff / teamAverage.totalChats) * 100 
    : 0;
  
  const handleTimeDiff = avgHandleTime - teamAverage.avgHandleTime;
  const handleTimePercent = teamAverage.avgHandleTime > 0 
    ? (handleTimeDiff / teamAverage.avgHandleTime) * 100 
    : 0;
  
  const ratingDiff = avgRating - teamAverage.avgRating;
  const ratingPercent = teamAverage.avgRating > 0 
    ? (ratingDiff / teamAverage.avgRating) * 100 
    : 0;
  
  // Performans analizi
  // Genel performans değerlendirmesi
  if (ratingDiff >= 0.5 && chatVolumePercent >= 10) {
    results.performance = `${name} ekip ortalamasının üzerinde bir performans gösteriyor. Yüksek müşteri memnuniyeti (${avgRating.toFixed(1)} yıldız) ve ortalamadan %${Math.abs(chatVolumePercent).toFixed(0)} daha fazla görüşme hacmi ile öne çıkıyor.`;
  } else if (ratingDiff <= -0.5 && handleTimePercent >= 15) {
    results.performance = `${name} düşük müşteri memnuniyeti (${avgRating.toFixed(1)} yıldız) ve ortalamadan %${Math.abs(handleTimePercent).toFixed(0)} daha uzun görüşme süreleri ile performans sorunları yaşıyor.`;
  } else {
    results.performance = `${name} genel olarak ekip ortalamasına yakın bir performans gösteriyor. Müşteri memnuniyeti ${avgRating.toFixed(1)} yıldız ve görüşme başına ${Math.round(avgHandleTime)} saniye harcıyor.`;
  }
  
  // Güçlü yönler
  if (chatVolumePercent >= 10) {
    results.strengths.push(`Yüksek görüşme hacmi (ekip ortalamasından %${Math.abs(chatVolumePercent).toFixed(0)} fazla)`);
  }
  
  if (handleTimePercent <= -10) {
    results.strengths.push(`Hızlı yanıt süresi (ekip ortalamasından %${Math.abs(handleTimePercent).toFixed(0)} daha kısa)`);
  }
  
  if (ratingDiff >= 0.3) {
    results.strengths.push(`Yüksek müşteri memnuniyeti (${avgRating.toFixed(1)} yıldız)`);
  }
  
  // Zayıf yönler
  if (chatVolumePercent <= -15) {
    results.weaknesses.push(`Düşük görüşme hacmi (ekip ortalamasından %${Math.abs(chatVolumePercent).toFixed(0)} daha az)`);
  }
  
  if (handleTimePercent >= 15) {
    results.weaknesses.push(`Uzun görüşme süreleri (ekip ortalamasından %${Math.abs(handleTimePercent).toFixed(0)} daha uzun)`);
  }
  
  if (ratingDiff <= -0.3) {
    results.weaknesses.push(`Düşük müşteri memnuniyeti (${avgRating.toFixed(1)} yıldız)`);
  }
  
  // Önerilen aksiyonlar
  if (chatVolumePercent <= -15) {
    results.actionItems.push('Daha fazla görüşme alması için teşvik edilmeli ve performans hedefleri belirlenmelidir.');
  }
  
  if (handleTimePercent >= 15) {
    results.actionItems.push('Görüşme sürelerini kısaltmak için hızlı yanıt teknikleri ve hazır cevaplar konusunda eğitim verilmelidir.');
  }
  
  if (ratingDiff <= -0.3) {
    results.actionItems.push('Müşteri memnuniyetini artırmak için iletişim becerileri ve sorun çözme teknikleri konusunda geliştirme programına alınmalıdır.');
  }
  
  // Eğer güçlü yön yoksa
  if (results.strengths.length === 0) {
    results.strengths.push('Belirgin bir güçlü yön tespit edilemedi.');
  }
  
  // Eğer zayıf yön yoksa
  if (results.weaknesses.length === 0) {
    results.weaknesses.push('Belirgin bir zayıf yön tespit edilemedi.');
  }
  
  // Eğer aksiyon önerisi yoksa
  if (results.actionItems.length === 0) {
    results.actionItems.push('Mevcut performans seviyesini korumak için düzenli koçluk seansları önerilir.');
  }
  
  return results;
};

/**
 * Ekip ortalama değerlerini hesaplar
 */
export const calculateTeamAverages = (agentsData) => {
  if (!agentsData || agentsData.length === 0) {
    return {
      totalChats: 0,
      avgHandleTime: 0,
      avgRating: 0
    };
  }
  
  const validAgents = agentsData.filter(agent => agent.totalChats > 0);
  
  if (validAgents.length === 0) {
    return {
      totalChats: 0,
      avgHandleTime: 0,
      avgRating: 0
    };
  }
  
  // Ortalama görüşme sayısı
  const totalChats = validAgents.reduce((sum, agent) => sum + agent.totalChats, 0) / validAgents.length;
  
  // Ortalama görüşme süresi
  const avgHandleTime = validAgents.reduce((sum, agent) => sum + agent.avgHandleTime, 0) / validAgents.length;
  
  // Ortalama değerlendirme
  const ratedAgents = validAgents.filter(agent => agent.ratings && agent.ratings.length > 0);
  const avgRating = ratedAgents.length > 0
    ? ratedAgents.reduce((sum, agent) => sum + agent.avgRating, 0) / ratedAgents.length
    : 0;
  
  return {
    totalChats,
    avgHandleTime,
    avgRating
  };
};
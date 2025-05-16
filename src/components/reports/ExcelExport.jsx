// src/components/reports/ExcelExport.jsx
import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ExcelExport({ agentName, performanceData, ratingData }) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateExcel = () => {
    setIsGenerating(true);
    
    try {
      // Yeni bir çalışma kitabı oluştur
      const workbook = XLSX.utils.book_new();
      
      // Performans verileri için çalışma sayfası
      if (performanceData.length > 0) {
        // Verileri formatlama
        const formattedPerformanceData = performanceData.map(item => ({
          'Tarih': new Date(item.Date).toLocaleDateString('tr-TR'),
          'Görüşme Sayısı': item.ChatCount,
          'Ortalama Süre (sn)': Math.round(item.AvgHandleTime),
          'Toplam Süre (dk)': Math.round(item.TotalChatTime / 60)
        }));
        
        // Çalışma sayfası oluştur
        const performanceSheet = XLSX.utils.json_to_sheet(formattedPerformanceData);
        
        // Sütun genişliklerini ayarla
        const performanceCols = [
          { wch: 15 }, // Tarih
          { wch: 15 }, // Görüşme Sayısı
          { wch: 18 }, // Ortalama Süre
          { wch: 18 }  // Toplam Süre
        ];
        
        performanceSheet['!cols'] = performanceCols;
        
        // Çalışma sayfasını kitaba ekle
        XLSX.utils.book_append_sheet(workbook, performanceSheet, 'Görüşme Verileri');
      }
      
      // Değerlendirme verileri için çalışma sayfası
      if (ratingData.length > 0) {
        // Verileri formatlama
        const formattedRatingData = ratingData.map(item => ({
          'Tarih': new Date(item.Date).toLocaleDateString('tr-TR'),
          'Yıldız Değerlendirmesi': item.Rating
        }));
        
        // Çalışma sayfası oluştur
        const ratingSheet = XLSX.utils.json_to_sheet(formattedRatingData);
        
        // Sütun genişliklerini ayarla
        const ratingCols = [
          { wch: 15 }, // Tarih
          { wch: 20 }  // Yıldız Değerlendirmesi
        ];
        
        ratingSheet['!cols'] = ratingCols;
        
        // Çalışma sayfasını kitaba ekle
        XLSX.utils.book_append_sheet(workbook, ratingSheet, 'Değerlendirme Verileri');
      }
      
      // Özet verileri için çalışma sayfası
      const summaryData = [];
      
      // Toplam görüşme sayısı
      const totalChats = performanceData.reduce((sum, item) => sum + item.ChatCount, 0);
      
      // Ortalama görüşme süresi
      let avgHandleTime = 0;
      if (performanceData.length > 0) {
        const totalTime = performanceData.reduce((sum, item) => sum + (item.AvgHandleTime * item.ChatCount), 0);
        avgHandleTime = Math.round(totalTime / totalChats);
      }
      
      // Ortalama yıldız
      let avgRating = 0;
      if (ratingData.length > 0) {
        const totalRating = ratingData.reduce((sum, item) => sum + item.Rating, 0);
        avgRating = (totalRating / ratingData.length).toFixed(1);
      }
      
      summaryData.push({
        'Metrik': 'Temsilci Adı',
        'Değer': agentName
      });
      
      summaryData.push({
        'Metrik': 'Toplam Görüşme',
        'Değer': totalChats
      });
      
      // src/components/reports/ExcelExport.jsx (devamı)
      summaryData.push({
        'Metrik': 'Ortalama Görüşme Süresi',
        'Değer': `${avgHandleTime} saniye`
      });
      
      summaryData.push({
        'Metrik': 'Ortalama Yıldız Puanı',
        'Değer': avgRating
      });
      
      summaryData.push({
        'Metrik': 'Rapor Tarihi',
        'Değer': new Date().toLocaleDateString('tr-TR')
      });
      
      // Çalışma sayfası oluştur
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      
      // Sütun genişliklerini ayarla
      const summaryCols = [
        { wch: 25 }, // Metrik
        { wch: 25 }  // Değer
      ];
      
      summarySheet['!cols'] = summaryCols;
      
      // Çalışma sayfasını kitaba ekle (ilk sıraya)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Özet', true);
      
      // Excel dosyasını indir
      XLSX.writeFile(workbook, `${agentName}_Performans_Verileri.xlsx`);
    } catch (error) {
      console.error('Excel oluşturma hatası:', error);
      alert('Excel dosyası oluşturulurken bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <button
      onClick={generateExcel}
      disabled={isGenerating || (performanceData.length === 0 && ratingData.length === 0)}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
    >
      {isGenerating ? 'Excel Oluşturuluyor...' : 'Excel İndir'}
    </button>
  );
}
        
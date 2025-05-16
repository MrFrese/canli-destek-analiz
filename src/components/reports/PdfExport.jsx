// src/components/reports/PdfExport.jsx
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function PdfExport({ agentName, performanceData, ratingData, aiAnalysis, notes }) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generatePdf = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text(`${agentName} - Performans Raporu`, 105, 20, { align: 'center' });
      
      // Tarih
      const today = new Date().toLocaleDateString('tr-TR');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Oluşturulma Tarihi: ${today}`, 105, 30, { align: 'center' });
      
      // Yatay çizgi
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 35, 190, 35);
      
      let yPosition = 45;
      
      // Özet bilgiler
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Performans Özeti', 20, yPosition);
      
      yPosition += 10;
      
      // Toplam görüşme sayısı hesaplama
      const totalChats = performanceData.reduce((sum, item) => sum + item.ChatCount, 0);
      
      // Ortalama görüşme süresi hesaplama
      let avgHandleTime = 0;
      if (performanceData.length > 0) {
        const totalTime = performanceData.reduce((sum, item) => sum + (item.AvgHandleTime * item.ChatCount), 0);
        avgHandleTime = Math.round(totalTime / totalChats);
      }
      
      // Ortalama yıldız hesaplama
      let avgRating = 0;
      if (ratingData.length > 0) {
        const totalRating = ratingData.reduce((sum, item) => sum + item.Rating, 0);
        avgRating = (totalRating / ratingData.length).toFixed(1);
      }
      
      // Özet tablo
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const summaryData = [
        ['Toplam Görüşme', `${totalChats}`],
        ['Ortalama Görüşme Süresi', `${avgHandleTime} saniye`],
        ['Ortalama Yıldız Puanı', `${avgRating}`]
      ];
      
      doc.autoTable({
        startY: yPosition,
        head: [['Metrik', 'Değer']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
      
      // AI Analizi
      if (aiAnalysis) {
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Yapay Zeka Performans Analizi', 20, yPosition);
        
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        
        // Genel performans
        doc.setFontSize(12);
        doc.text('Genel Performans:', 20, yPosition);
        
        yPosition += 7;
        
        // Uzun metni satırlara böl
        const splitPerformance = doc.splitTextToSize(aiAnalysis.performance, 170);
        doc.setFontSize(10);
        doc.text(splitPerformance, 20, yPosition);
        
        yPosition += splitPerformance.length * 5 + 7;
        
        // Güçlü yönler
        doc.setFontSize(12);
        doc.text('Güçlü Yönler:', 20, yPosition);
        
        yPosition += 7;
        
        doc.setFontSize(10);
        aiAnalysis.strengths.forEach(strength => {
          doc.text(`• ${strength}`, 20, yPosition);
          yPosition += 5;
        });
        
        yPosition += 5;
        
        // Zayıf yönler
        doc.setFontSize(12);
        doc.text('Gelişim Alanları:', 20, yPosition);
        
        yPosition += 7;
        
        doc.setFontSize(10);
        aiAnalysis.weaknesses.forEach(weakness => {
          doc.text(`• ${weakness}`, 20, yPosition);
          yPosition += 5;
        });
        
        yPosition += 5;
        
        // Aksiyon önerileri
        doc.setFontSize(12);
        doc.text('Aksiyon Önerileri:', 20, yPosition);
        
        yPosition += 7;
        
        doc.setFontSize(10);
        aiAnalysis.actionItems.forEach(action => {
          doc.text(`• ${action}`, 20, yPosition);
          yPosition += 5;
        });
        
        yPosition += 10;
      }
      
      // Sayfa sınırını kontrol et, gerekirse yeni sayfa ekle
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Kullanıcı notları
      if (notes && notes.trim() !== '') {
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Performans Notları', 20, yPosition);
        
        yPosition += 10;
        
        const splitNotes = doc.splitTextToSize(notes, 170);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(splitNotes, 20, yPosition);
        
        yPosition += splitNotes.length * 5 + 15;
      }
      
      // Sayfa sınırını kontrol et, gerekirse yeni sayfa ekle
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Görüşme verilerini tabloya dönüştür
      if (performanceData.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Görüşme Detayları', 20, yPosition);
        
        const performanceTableData = performanceData.map(item => [
          new Date(item.Date).toLocaleDateString('tr-TR'),
          item.ChatCount,
          `${Math.round(item.AvgHandleTime)} sn`,
          `${Math.round(item.TotalChatTime / 60)} dk`
        ]);
        
        doc.autoTable({
          startY: yPosition + 10,
          head: [['Tarih', 'Görüşme Sayısı', 'Ort. Süre', 'Toplam Süre']],
          body: performanceTableData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
          styles: { fontSize: 9 },
          margin: { left: 20, right: 20 }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      }
      
      // Sayfa sınırını kontrol et, gerekirse yeni sayfa ekle
      if (yPosition > 200 && ratingData.length > 0) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Değerlendirme verilerini tabloya dönüştür
      if (ratingData.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Yıldız Değerlendirme Detayları', 20, yPosition);
        
        const ratingTableData = ratingData.map(item => [
          new Date(item.Date).toLocaleDateString('tr-TR'),
          `${item.Rating} ★`
        ]);
        
        doc.autoTable({
          startY: yPosition + 10,
          head: [['Tarih', 'Yıldız Değerlendirmesi']],
          body: ratingTableData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
          styles: { fontSize: 9 },
          margin: { left: 20, right: 20 }
        });
      }
      
      // Alt bilgi
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Canlı Destek Analiz Paneli - Sayfa ${i} / ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      // PDF'yi indir
      doc.save(`${agentName}_Performans_Raporu.pdf`);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <button
      onClick={generatePdf}
      disabled={isGenerating || (performanceData.length === 0 && ratingData.length === 0)}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
    >
      {isGenerating ? 'PDF Oluşturuluyor...' : 'PDF İndir'}
    </button>
  );
}
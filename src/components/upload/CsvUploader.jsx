// src/components/upload/CsvUploader.jsx
import { useState, useRef } from 'react';
import Papa from 'papaparse';
import useDataStore from '@/store/dataStore';

export default function CsvUploader() {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState({ performanceFile: null, ratingFile: null });
  
  const { setAgentPerformance, setAgentRatings } = useDataStore();
  const fileInputRef = useRef(null);
  
  // Beklenen CSV başlıkları
  const expectedHeaders = {
    agentPerformance: ['AgentName', 'Date', 'AvgHandleTime', 'TotalChatTime', 'ChatCount'],
    agentRating: ['AgentName', 'Date', 'Rating']
  };
  
  // CSV dosyasını doğrulama
  const validateCsvFile = (results, type) => {
    // İlk satırı kontrol et (başlıklar)
    const headers = results.meta.fields;
    const expectedHeadersForType = type === 'performance' 
      ? expectedHeaders.agentPerformance 
      : expectedHeaders.agentRating;
    
    // Tüm gerekli başlıklar var mı?
    const missingHeaders = expectedHeadersForType.filter(
      header => !headers.includes(header)
    );
    
    if (missingHeaders.length > 0) {
      return {
        valid: false,
        message: `Eksik başlıklar: ${missingHeaders.join(', ')}`
      };
    }
    
    // Veri türlerini kontrol et
    const invalidData = results.data.some((row, index) => {
      // İlk 10 satırı kontrol et (performans için)
      if (index > 10) return false;
      
      if (type === 'performance') {
        // Sayısal değerler kontrol
        const chatCount = parseFloat(row.ChatCount);
        const avgHandleTime = parseFloat(row.AvgHandleTime);
        
        return (
          isNaN(chatCount) || 
          isNaN(avgHandleTime) || 
          !row.AgentName || 
          !row.Date
        );
      } else {
        // Rating kontrolü (1-5 arası değer)
        const rating = parseFloat(row.Rating);
        return (
          isNaN(rating) || 
          rating < 1 || 
          rating > 5 || 
          !row.AgentName || 
          !row.Date
        );
      }
    });
    
    if (invalidData) {
      return {
        valid: false,
        message: `Geçersiz veri formatı: Bazı satırlar beklenen değerlere sahip değil`
      };
    }
    
    return { valid: true };
  };
  
  // CSV dosyasını işleme
  const processFile = (file, type) => {
    setLoading(true);
    setError(null);
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        // CSV doğrulama
        const validation = validateCsvFile(results, type);
        
        if (!validation.valid) {
          setError(`Dosya doğrulama hatası: ${validation.message}`);
          setLoading(false);
          return;
        }
        
        // Veriyi işle ve store'a kaydet
        const processedData = results.data.map(row => {
          // Tarih formatını düzenle
          let dateObj;
          try {
            dateObj = new Date(row.Date);
            // Geçerli bir tarih mi?
            if (isNaN(dateObj.getTime())) {
              throw new Error('Geçersiz tarih');
            }
          } catch (e) {
            console.warn('Tarih dönüştürme hatası:', row.Date);
            // Varsayılan tarih olarak bugünü kullan
            dateObj = new Date();
          }
          
          const formattedDate = dateObj.toISOString().split('T')[0];
          
          return {
            ...row,
            Date: formattedDate
          };
        });
        
        // Store'a kaydet
        if (type === 'performance') {
          setAgentPerformance(processedData);
          setFileInfo(prev => ({ ...prev, performanceFile: file.name }));
        } else {
          setAgentRatings(processedData);
          setFileInfo(prev => ({ ...prev, ratingFile: file.name }));
        }
        
        setLoading(false);
      },
      error: (error) => {
        setError(`CSV işleme hatası: ${error.message}`);
        setLoading(false);
      }
    });
  };
  
  // Dosya seçimi olayı
  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file, type);
    }
  };
  
  // Sürükle-bırak olayları
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file, type);
    }
  };
  
  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">CSV Dosyalarını Yükle</h2>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performans CSV yükleme */}
        <div 
          className={`border-2 rounded-lg p-6 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-dashed border-gray-300 dark:border-gray-600'
          } ${fileInfo.performanceFile ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : ''}`}
          onDragEnter={(e) => handleDrag(e)}
          onDragOver={(e) => handleDrag(e)}
          onDragLeave={(e) => handleDrag(e)}
          onDrop={(e) => handleDrop(e, 'performance')}
        >
          <div className="space-y-2">
            <h3 className="font-medium">Agent Performans CSV</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AgentName, Date, AvgHandleTime, TotalChatTime, ChatCount
            </p>
            
            {fileInfo.performanceFile ? (
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  {fileInfo.performanceFile}
                </p>
                <button
                  onClick={() => setFileInfo(prev => ({ ...prev, performanceFile: null }))}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Dosyayı Kaldır
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  disabled={loading}
                >
                  {loading ? 'Yükleniyor...' : 'Dosya Seç'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'performance')}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  veya dosyayı buraya sürükleyip bırakın
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Rating CSV yükleme - benzer yapı */}
        <div 
          className={`border-2 rounded-lg p-6 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-dashed border-gray-300 dark:border-gray-600'
          } ${fileInfo.ratingFile ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : ''}`}
          onDragEnter={(e) => handleDrag(e)}
          onDragOver={(e) => handleDrag(e)}
          onDragLeave={(e) => handleDrag(e)}
          onDrop={(e) => handleDrop(e, 'rating')}
        >
          <div className="space-y-2">
            <h3 className="font-medium">Agent Değerlendirme CSV</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AgentName, Date, Rating (1-5)
            </p>
            
            {fileInfo.ratingFile ? (
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  {fileInfo.ratingFile}
                </p>
                <button
                  onClick={() => setFileInfo(prev => ({ ...prev, ratingFile: null }))}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Dosyayı Kaldır
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.csv';
                    fileInput.onchange = (e) => handleFileChange(e, 'rating');
                    fileInput.click();
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  disabled={loading}
                >
                  {loading ? 'Yükleniyor...' : 'Dosya Seç'}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  veya dosyayı buraya sürükleyip bırakın
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* CSV yükleme durumu */}
      <div className="flex justify-between items-center mt-4">
        <div>
          {(fileInfo.performanceFile || fileInfo.ratingFile) && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {fileInfo.performanceFile && fileInfo.ratingFile 
                ? 'İki dosya da yüklendi!' 
                : 'Analiz için lütfen diğer dosyayı da yükleyin.'}
            </p>
          )}
        </div>
        <button
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={() => {
            setFileInfo({ performanceFile: null, ratingFile: null });
            setAgentPerformance([]);
            setAgentRatings([]);
          }}
        >
          Tüm Verileri Temizle
        </button>
      </div>
    </div>
  );
}
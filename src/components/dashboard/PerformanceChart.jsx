// src/components/dashboard/PerformanceChart.jsx
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
  } from 'recharts';
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  };
  
  export default function PerformanceChart({ data }) {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">Gösterilecek veri yok</p>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke="#9CA3AF"
          />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#9CA3AF"
            label={{ 
              value: 'Konuşma Sayısı', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#9CA3AF', textAnchor: 'middle' }
            }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#9CA3AF"
            label={{ 
              value: 'Ort. Süre (sn)', 
              angle: -90, 
              position: 'insideRight',
              style: { fill: '#9CA3AF', textAnchor: 'middle' }
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              borderColor: '#374151',
              color: '#F9FAFB'
            }}
            labelStyle={{ color: '#F9FAFB' }}
            formatter={(value, name) => {
              if (name === 'avgHandleTime') return [Math.round(value) + ' sn', 'Ort. Süre'];
              if (name === 'totalChats') return [value, 'Toplam Konuşma'];
              return [value, name];
            }}
            labelFormatter={(label) => `Tarih: ${formatDate(label)}`}
          />
          <Legend 
            formatter={(value) => {
              if (value === 'avgHandleTime') return 'Ortalama Görüşme Süresi';
              if (value === 'totalChats') return 'Toplam Konuşma';
              return value;
            }}
            wrapperStyle={{ color: '#9CA3AF' }}
          />
          <Bar 
            yAxisId="left" 
            dataKey="totalChats" 
            fill="#3B82F6" 
            name="totalChats"
            radius={[4, 4, 0, 0]}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="avgHandleTime" 
            stroke="#EF4444"
            name="avgHandleTime"
            strokeWidth={2}
            dot={{ r: 4, fill: '#EF4444' }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }
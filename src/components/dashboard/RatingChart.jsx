// src/components/dashboard/RatingChart.jsx
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList
} from 'recharts';

// Yıldızlar için renkler
const RATING_COLORS = {
  1: '#EF4444', // Kırmızı
  2: '#F97316', // Turuncu
  3: '#FBBF24', // Sarı
  4: '#22C55E', // Yeşil
  5: '#10B981'  // Koyu yeşil
};

export default function RatingChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Gösterilecek veri yok</p>
      </div>
    );
  }
  
  const totalRatings = data.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          type="number" 
          stroke="#9CA3AF"
          domain={[0, 'dataMax + 5']}
        />
        <YAxis 
          type="category" 
          dataKey="rating" 
          stroke="#9CA3AF"
          tickFormatter={(value) => `${value} Yıldız`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            borderColor: '#374151',
            color: '#F9FAFB'
          }}
          formatter={(value, name, props) => {
            const percentage = totalRatings > 0 ? 
              `(${Math.round(value / totalRatings * 100)}%)` : '';
            return [`${value} değerlendirme ${percentage}`, `${props.payload.rating} Yıldız`];
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={RATING_COLORS[entry.rating] || '#3B82F6'} />
          ))}
          <LabelList 
            dataKey="count" 
            position="right" 
            style={{ fill: '#F9FAFB' }}
            formatter={(value) => (totalRatings > 0 ? 
              `${value} (${Math.round(value / totalRatings * 100)}%)` : value)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
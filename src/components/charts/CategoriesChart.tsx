
import { CategoryTotal, formatCurrency } from '@/lib/data';
import { Currency } from '@/lib/types';
import { 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Cell, 
  Tooltip 
} from 'recharts';
import { CategoryBadge } from '@/components/CategoryBadge';

interface CategoriesChartProps {
  pieData: CategoryTotal[];
  convertedCategoryData: CategoryTotal[];
  displayCurrency: Currency;
}

export function CategoriesChart({ 
  pieData, 
  convertedCategoryData,
  displayCurrency
}: CategoriesChartProps) {
  return (
    <div className="h-[250px] grid grid-cols-1 md:grid-cols-2 gap-4">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="amount"
            nameKey="categoryName"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {pieData.map((entry, index) => {
              const colors = [
                "#0ea5e9",
                "#10b981",
                "#f59e0b",
                "#8b5cf6",
                "#ec4899",
                "#94a3b8"
              ];
              
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              );
            })}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border border-border rounded-md p-2 shadow-md text-xs">
                    <p className="font-medium mb-1">{payload[0].name}</p>
                    <div className="flex justify-between gap-4">
                      <span>Amount:</span>
                      <span className="font-medium">{formatCurrency(payload[0].value as number, displayCurrency)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Percentage:</span>
                      <span className="font-medium">
                        {payload[0].payload.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="flex flex-col justify-center">
        <h3 className="text-xs font-medium mb-2">Top Categories</h3>
        <div className="space-y-2">
          {convertedCategoryData.slice(0, 5).map(category => (
            <div key={category.categoryId} className="flex items-center justify-between">
              <div className="flex items-center">
                <CategoryBadge category={category.categoryName} className="mr-2" />
                <span className="text-xs">{formatCurrency(category.amount, displayCurrency)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {category.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

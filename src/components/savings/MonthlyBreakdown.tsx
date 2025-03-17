
import { 
  Table,
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { Currency, formatCurrency } from '@/lib/data';

interface CumulativeSavings {
  month: string;
  savings: number;
  cumulativeTotal: number;
}

interface MonthlyBreakdownProps {
  cumulativeSavings: CumulativeSavings[];
  currency: Currency;
}

export function MonthlyBreakdown({ cumulativeSavings, currency }: MonthlyBreakdownProps) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Monthly Breakdown</h4>
        <div className="text-xs text-muted-foreground">Next {Math.min(6, cumulativeSavings.length)} months</div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs py-1.5">Month</TableHead>
              <TableHead className="text-xs py-1.5">Savings</TableHead>
              <TableHead className="text-xs py-1.5">Cumulated Savings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...cumulativeSavings.slice(0, 6)].reverse().map((item, index) => (
              <TableRow key={item.month}>
                <TableCell className="py-1.5 text-xs">{item.month}</TableCell>
                <TableCell className={`py-1.5 text-xs ${item.savings >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(item.savings, currency)}
                </TableCell>
                <TableCell className="py-1.5 text-xs font-medium">
                  {formatCurrency(item.cumulativeTotal, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

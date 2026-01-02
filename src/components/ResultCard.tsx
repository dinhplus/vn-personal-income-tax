import { useTranslation } from 'next-i18next';
import { formatVND, formatNumber } from '@/lib/tax/utils';
import { type TaxPayerCalculationResult, type TaxConstants } from '@/lib/tax';
import ResultRow from './ResultRow';

interface ResultCardProps {
  result: TaxPayerCalculationResult & { constants: TaxConstants };
}

export default function ResultCard({ result }: ResultCardProps) {
  const { t } = useTranslation('tax');
  
  return (
    <div className="rounded-lg bg-background p-6 shadow-md">
      <h2 className="mb-4 border-b border-border pb-2 text-xl font-semibold text-primary">
        {t(`period.${result.constants.year === 'Trước 2026' ? 'before2026' : 'from2026'}`)}
      </h2>

      {/* Main Results */}
      <div className="space-y-3">
        <ResultRow label={t('results.grossSalary')} value={formatVND(result.grossSalary)} highlight />
        <ResultRow label={t('results.employeeInsurance')} value={formatVND(result.insurance.employeeContribution)} />
        <ResultRow label={t('results.taxableIncome')} value={formatVND(result.taxableIncome)} />
        <ResultRow label={t('results.tax')} value={formatVND(result.totalTax)} />
        <ResultRow label={t('results.netSalary')} value={formatVND(result.netSalary)} highlight />
      </div>

      {/* Employer Cost */}
      <div className="mt-6 border-t border-border pt-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t('results.employerCost')}</h3>
        <ResultRow label={t('results.grossSalary')} value={formatVND(result.grossSalary)} />
        <ResultRow label={t('results.employerInsurance')} value={formatVND(result.insurance.employerContribution)} />
        <ResultRow label={t('results.totalCost')} value={formatVND(result.totalEmployerCost)} highlight />
      </div>

      {/* Tax Breakdown */}
      <div className="mt-6 border-t border-border pt-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t('results.taxBreakdown')}</h3>
        <div className="space-y-2">
          {result.taxBreakdown.map((item, idx) => {
            const bracket = item.bracket.toJSON();
            return (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatNumber(bracket.from)} - {bracket.to ? formatNumber(bracket.to) : '∞'} ({bracket.rate}%)
                </span>
                <span className="font-medium text-foreground">{formatVND(item.taxAmount)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

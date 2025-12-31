import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { calculateTax, formatVND, formatNumber } from '@/lib/tax/calculator';
import { TaxInput, TaxCalculationResult } from '@/lib/tax/types';
import {
  TAX_CONSTANTS_BEFORE_2026,
  TAX_CONSTANTS_FROM_2026,
  BASIC_INSURANCE_BASE,
} from '@/lib/tax/constants';

export default function Calculator() {
  const { t } = useTranslation('tax');
  const [salaryType, setSalaryType] = useState<'gross' | 'net'>('gross');
  const [salary, setSalary] = useState<string>('20000000');
  const [dependents, setDependents] = useState<string>('0');
  const [insuranceType, setInsuranceType] = useState<'basic' | 'specific' | 'percentage'>('basic');
  const [insuranceValue, setInsuranceValue] = useState<string>(BASIC_INSURANCE_BASE.toString());

  const input: TaxInput = {
    salaryType,
    salary: parseFloat(salary) || 0,
    dependents: parseInt(dependents) || 0,
    insuranceBase:
      insuranceType === 'basic'
        ? { type: 'basic', value: BASIC_INSURANCE_BASE }
        : insuranceType === 'specific'
        ? { type: 'specific', value: parseFloat(insuranceValue) || 0 }
        : { type: 'percentage', value: parseFloat(insuranceValue) || 0 },
  };

  const resultBefore2026 = calculateTax(input, TAX_CONSTANTS_BEFORE_2026);
  const resultFrom2026 = calculateTax(input, TAX_CONSTANTS_FROM_2026);

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-foreground">
          {t('page.title')}
        </h1>

        {/* Input Form */}
        <div className="mb-8 rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-foreground">{t('page.inputTitle')}</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Salary Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t('form.salaryType.label')}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="gross"
                    checked={salaryType === 'gross'}
                    onChange={(e) => setSalaryType(e.target.value as 'gross' | 'net')}
                    className="mr-2"
                  />
                  {t('form.salaryType.gross')}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="net"
                    checked={salaryType === 'net'}
                    onChange={(e) => setSalaryType(e.target.value as 'gross' | 'net')}
                    className="mr-2"
                  />
                  {t('form.salaryType.net')}
                </label>
              </div>
            </div>

            {/* Salary Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t('form.amount.label')}
              </label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t('form.amount.placeholder')}
              />
            </div>

            {/* Dependents */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t('form.dependents.label')}
              </label>
              <input
                type="number"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
                min="0"
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t('form.dependents.placeholder')}
              />
            </div>

            {/* Insurance Base Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t('form.insurance.label')}
              </label>
              <select
                value={insuranceType}
                onChange={(e) => {
                  const type = e.target.value as 'basic' | 'specific' | 'percentage';
                  setInsuranceType(type);
                  if (type === 'basic') {
                    setInsuranceValue(BASIC_INSURANCE_BASE.toString());
                  } else if (type === 'percentage') {
                    setInsuranceValue('100');
                  }
                }}
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="basic">{t('form.insurance.basic')} ({formatVND(BASIC_INSURANCE_BASE)})</option>
                <option value="specific">{t('form.insurance.specific')}</option>
                <option value="percentage">{t('form.insurance.percentage')}</option>
              </select>
            </div>

            {/* Insurance Value (if not basic) */}
            {insuranceType !== 'basic' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {insuranceType === 'percentage' ? t('form.insuranceValue.labelPercentage') : t('form.insuranceValue.labelAmount')}
                </label>
                <input
                  type="number"
                  value={insuranceValue}
                  onChange={(e) => setInsuranceValue(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={insuranceType === 'percentage' ? t('form.insuranceValue.placeholderPercentage') : t('form.insuranceValue.placeholderAmount')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Comparison Results */}
        <div className="grid gap-6 md:grid-cols-2">
          <ResultCard result={resultBefore2026} />
          <ResultCard result={resultFrom2026} />
        </div>

        {/* Comparison Summary */}
        <div className="mt-8 rounded-lg bg-accent p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-accent-foreground">{t('comparison.title')}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <ComparisonItem
              label={t('comparison.netDifference')}
              value={resultFrom2026.netSalary - resultBefore2026.netSalary}
            />
            <ComparisonItem
              label={t('comparison.taxDifference')}
              value={resultFrom2026.totalTax - resultBefore2026.totalTax}
            />
            <ComparisonItem
              label={t('comparison.taxableIncomeDifference')}
              value={resultFrom2026.taxableIncome - resultBefore2026.taxableIncome}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: TaxCalculationResult }) {
  const { t } = useTranslation('tax');
  
  return (
    <div className="rounded-lg bg-background p-6 shadow-md">
      <h2 className="mb-4 border-b border-border pb-2 text-xl font-semibold text-primary">
        {t(`period.${result.constants.year === 'Trước 2026' ? 'before2026' : 'from2026'}`)}
      </h2>

      {/* Main Results */}
      <div className="space-y-3">
        <ResultRow label={t('results.grossSalary')} value={formatVND(result.grossSalary)} highlight />
        <ResultRow label={t('results.employeeInsurance')} value={formatVND(result.insuranceContribution)} />
        <ResultRow label={t('results.taxableIncome')} value={formatVND(result.taxableIncome)} />
        <ResultRow label={t('results.tax')} value={formatVND(result.totalTax)} />
        <ResultRow label={t('results.netSalary')} value={formatVND(result.netSalary)} highlight />
      </div>

      {/* Employer Cost */}
      <div className="mt-6 border-t border-border pt-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t('results.employerCost')}</h3>
        <ResultRow label={t('results.grossSalary')} value={formatVND(result.grossSalary)} />
        <ResultRow label={t('results.employerInsurance')} value={formatVND(result.employerInsuranceContribution)} />
        <ResultRow label={t('results.totalCost')} value={formatVND(result.totalEmployerCost)} highlight />
      </div>

      {/* Tax Breakdown */}
      <div className="mt-6 border-t border-border pt-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t('results.taxBreakdown')}</h3>
        <div className="space-y-2">
          {result.taxBreakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatNumber(item.bracket.from)} - {item.bracket.to ? formatNumber(item.bracket.to) : '∞'} ({item.bracket.rate}%)
              </span>
              <span className="font-medium text-foreground">{formatVND(item.taxAmount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between ${highlight ? 'font-semibold' : ''}`}>
      <span className={highlight ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
      <span className={highlight ? 'text-primary' : 'text-foreground'}>{value}</span>
    </div>
  );
}

function ComparisonItem({ label, value }: { label: string; value: number }) {
  const isPositive = value > 0;
  const isZero = value === 0;
  
  return (
    <div className="text-center">
      <div className="text-sm text-accent-foreground">{label}</div>
      <div className={`mt-1 text-lg font-bold ${
        isZero ? 'text-accent-foreground' : isPositive ? 'text-success' : 'text-error'
      }`}>
        {isPositive && '+'}{formatVND(value)}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'vi', ['tax', 'common'])),
    },
  };
};

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useDebounce } from '@/hooks/useDebounce';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { formatVND } from '@/lib/tax/utils';
import { BASIC_INSURANCE_BASE } from '@/lib/tax/constants';
import { type InsuranceBaseConfig, type SalaryType } from '@/lib/tax';
import { useTaxCalculation } from '@/hooks/useTaxCalculation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import ResultCard from '@/components/ResultCard';
import ComparisonItem from '@/components/ComparisonItem';

export default function Home() {
  const { t } = useTranslation('tax');
  const [salaryType, setSalaryType] = useState<SalaryType>('gross');
  const [salary, setSalary] = useState<string>('20000000');
  const [dependents, setDependents] = useState<string>('0');
  const [insuranceType, setInsuranceType] = useState<'basic' | 'specific' | 'percentage'>('basic');
  const [insuranceValue, setInsuranceValue] = useState<string>(BASIC_INSURANCE_BASE.toString());

  // Confirmed values for calculation (after clicking Calculate button)
  const [confirmedValues, setConfirmedValues] = useState({
    salaryType,
    salary,
    dependents,
    insuranceType,
    insuranceValue,
  });

  // Debounced trigger for auto-calculation after 2s of inactivity
  const triggerValue = useDebounce(
    { salaryType, salary, dependents, insuranceType, insuranceValue },
    2000
  );

  // Auto-update confirmed values after debounce
  useEffect(() => {
    setConfirmedValues(triggerValue);
  }, [triggerValue]);

  // Manual calculate handler
  const handleCalculate = useCallback(() => {
    setConfirmedValues({
      salaryType,
      salary,
      dependents,
      insuranceType,
      insuranceValue,
    });
  }, [salaryType, salary, dependents, insuranceType, insuranceValue]);

  // Create insurance config from confirmed values
  const insuranceConfig: InsuranceBaseConfig = useMemo(() => {
    if (confirmedValues.insuranceType === 'basic') {
      return { type: 'basic', value: BASIC_INSURANCE_BASE };
    } else if (confirmedValues.insuranceType === 'specific') {
      return { type: 'specific', value: parseFloat(confirmedValues.insuranceValue) || 0 };
    } else {
      return { type: 'percentage', value: parseFloat(confirmedValues.insuranceValue) || 0 };
    }
  }, [confirmedValues.insuranceType, confirmedValues.insuranceValue]);

  // Use custom hook for tax calculation with OOP models (using confirmed values)
  const { resultBefore2026, resultFrom2026, difference } = useTaxCalculation({
    salaryType: confirmedValues.salaryType,
    salary: parseFloat(confirmedValues.salary) || 0,
    dependents: parseInt(confirmedValues.dependents) || 0,
    insuranceConfig,
  });

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header with Language Switcher */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            {t('page.title')}
          </h1>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mb-6 rounded-md bg-accent/50 p-3 text-center text-sm text-accent-foreground">
          <svg
            className="mr-2 inline-block h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          {t('privacy.note')}
        </div>

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

          {/* Calculate Button */}
          <div className="mt-6 flex justify-center w-full">
            <button
              onClick={handleCalculate}
              className="w-full rounded-md bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {t('form.calculateButton', 'Tính toán')}
            </button>
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
              value={difference.netSalary}
            />
            <ComparisonItem
              label={t('comparison.taxDifference')}
              value={difference.totalTax}
            />
            <ComparisonItem
              label={t('comparison.taxableIncomeDifference')}
              value={difference.taxableIncome}
            />
          </div>
        </div>
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

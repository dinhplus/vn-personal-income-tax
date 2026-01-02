import { useMemo } from 'react';
import { 
  createTaxPayer, 
  type InsuranceBaseConfig, 
  type SalaryType,
  type TaxPayerCalculationResult,
  type TaxConstants
} from '@/lib/tax';
import { TAX_CONSTANTS_BEFORE_2026, TAX_CONSTANTS_FROM_2026 } from '@/lib/tax/constants';

interface UseTaxCalculationParams {
  salaryType: SalaryType;
  salary: number;
  dependents: number;
  insuranceConfig: InsuranceBaseConfig;
}

interface UseTaxCalculationReturn {
  resultBefore2026: TaxPayerCalculationResult & { constants: TaxConstants };
  resultFrom2026: TaxPayerCalculationResult & { constants: TaxConstants };
  difference: {
    netSalary: number;
    totalTax: number;
    taxableIncome: number;
  };
}

export function useTaxCalculation({
  salaryType,
  salary,
  dependents,
  insuranceConfig,
}: UseTaxCalculationParams): UseTaxCalculationReturn {

  const taxPayerBefore2026 = useMemo(() => {
    return createTaxPayer(TAX_CONSTANTS_BEFORE_2026, dependents, insuranceConfig);
  }, [dependents, insuranceConfig]);

  const taxPayerFrom2026 = useMemo(() => {
    return createTaxPayer(TAX_CONSTANTS_FROM_2026, dependents, insuranceConfig);
  }, [dependents, insuranceConfig]);


  const resultBefore2026 = useMemo(() => {
    const result = taxPayerBefore2026.calculate(salary, salaryType);
    return {
      ...result,
      constants: TAX_CONSTANTS_BEFORE_2026,
    };
  }, [taxPayerBefore2026, salary, salaryType]);

  const resultFrom2026 = useMemo(() => {
    const result = taxPayerFrom2026.calculate(salary, salaryType);
    return {
      ...result,
      constants: TAX_CONSTANTS_FROM_2026,
    };
  }, [taxPayerFrom2026, salary, salaryType]);


  const difference = useMemo(() => ({
    netSalary: resultFrom2026.netSalary - resultBefore2026.netSalary,
    totalTax: resultFrom2026.totalTax - resultBefore2026.totalTax,
    taxableIncome: resultFrom2026.taxableIncome - resultBefore2026.taxableIncome,
  }), [resultBefore2026, resultFrom2026]);

  return {
    resultBefore2026,
    resultFrom2026,
    difference,
  };
}

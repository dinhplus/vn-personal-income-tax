import {
  TaxInput,
  TaxConstants,
  TaxCalculationResult,
  InsuranceBaseType,
  TaxBreakdownItem,
} from './types';

/**
 * Calculate insurance base amount from InsuranceBaseType
 */
function calculateInsuranceBase(
  insuranceBase: InsuranceBaseType,
  grossSalary: number
): number {
  switch (insuranceBase.type) {
    case 'basic':
      return insuranceBase.value;
    case 'specific':
      return insuranceBase.value;
    case 'percentage':
      return (grossSalary * insuranceBase.value) / 100;
  }
}

/**
 * Calculate employee insurance contribution
 */
function calculateInsuranceContribution(
  insuranceBase: number,
  rate: number
): number {
  return Math.round((insuranceBase * rate) / 100);
}

/**
 * Calculate taxable income
 */
function calculateTaxableIncome(
  grossSalary: number,
  personalDeduction: number,
  dependents: number,
  dependentDeduction: number,
  insuranceContribution: number
): number {
  const totalDeduction =
    personalDeduction + dependents * dependentDeduction + insuranceContribution;
  return Math.max(0, grossSalary - totalDeduction);
}

/**
 * Calculate progressive tax with breakdown
 */
function calculateProgressiveTax(
  taxableIncome: number,
  constants: TaxConstants
): { totalTax: number; breakdown: TaxBreakdownItem[] } {
  let remainingIncome = taxableIncome;
  let totalTax = 0;
  const breakdown: TaxBreakdownItem[] = [];

  for (const bracket of constants.taxBrackets) {
    if (remainingIncome <= 0) break;

    const bracketSize = bracket.to ? bracket.to - bracket.from : Infinity;
    const taxableInBracket = Math.min(remainingIncome, bracketSize);
    const taxForBracket = Math.round((taxableInBracket * bracket.rate) / 100);

    breakdown.push({
      bracket,
      taxableAmount: taxableInBracket,
      taxAmount: taxForBracket,
    });

    totalTax += taxForBracket;
    remainingIncome -= taxableInBracket;
  }

  return { totalTax: Math.round(totalTax), breakdown };
}

/**
 * Calculate net salary from gross salary
 */
function calculateNetFromGross(
  grossSalary: number,
  input: TaxInput,
  constants: TaxConstants
): TaxCalculationResult {
  const insuranceBaseAmount = calculateInsuranceBase(
    input.insuranceBase,
    grossSalary
  );
  
  const insuranceContribution = calculateInsuranceContribution(
    insuranceBaseAmount,
    constants.employeeInsuranceRate
  );

  const taxableIncome = calculateTaxableIncome(
    grossSalary,
    constants.personalDeduction,
    input.dependents,
    constants.dependentDeduction,
    insuranceContribution
  );

  const { totalTax, breakdown } = calculateProgressiveTax(
    taxableIncome,
    constants
  );

  const netSalary = grossSalary - insuranceContribution - totalTax;

  const employerInsuranceContribution = calculateInsuranceContribution(
    insuranceBaseAmount,
    constants.employerInsuranceRate
  );

  const totalEmployerCost = grossSalary + employerInsuranceContribution;

  return {
    input,
    constants,
    grossSalary,
    netSalary,
    insuranceContribution,
    taxableIncome,
    totalTax,
    employerInsuranceContribution,
    totalEmployerCost,
    taxBreakdown: breakdown,
  };
}

/**
 * Calculate gross salary from net salary (iterative approximation)
 */
function calculateGrossFromNet(
  targetNetSalary: number,
  input: TaxInput,
  constants: TaxConstants
): TaxCalculationResult {
  // Use iterative approximation to find gross salary
  let low = targetNetSalary;
  let high = targetNetSalary * 2;
  let iterations = 0;
  const maxIterations = 100;
  const tolerance = 1; // VND

  while (iterations < maxIterations) {
    const mid = Math.round((low + high) / 2);
    const result = calculateNetFromGross(mid, input, constants);

    if (Math.abs(result.netSalary - targetNetSalary) < tolerance) {
      return result;
    }

    if (result.netSalary < targetNetSalary) {
      low = mid;
    } else {
      high = mid;
    }

    iterations++;
  }

  // If we couldn't converge, return the closest result
  return calculateNetFromGross(Math.round((low + high) / 2), input, constants);
}

/**
 * Main tax calculation function
 */
export function calculateTax(
  input: TaxInput,
  constants: TaxConstants
): TaxCalculationResult {
  if (input.salaryType === 'gross') {
    return calculateNetFromGross(input.salary, input, constants);
  } else {
    return calculateGrossFromNet(input.salary, input, constants);
  }
}

/**
 * Format number as Vietnamese currency
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

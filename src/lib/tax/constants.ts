import { TaxConstants } from './types';

/**
 * Tax constants for years before 2026
 */
export const TAX_CONSTANTS_BEFORE_2026: TaxConstants = {
  year: 'Trước 2026',
  personalDeduction: 11_000_000,
  dependentDeduction: 4_400_000,
  employeeInsuranceRate: 10.5,
  employerInsuranceRate: 21.5,
  taxBrackets: [
    { from: 0, to: 5_000_000, rate: 5 },
    { from: 5_000_000, to: 10_000_000, rate: 10 },
    { from: 10_000_000, to: 18_000_000, rate: 15 },
    { from: 18_000_000, to: 32_000_000, rate: 20 },
    { from: 32_000_000, to: 52_000_000, rate: 25 },
    { from: 52_000_000, to: 80_000_000, rate: 30 },
    { from: 80_000_000, to: null, rate: 35 },
  ],
};

/**
 * Tax constants for years from 2026 onwards
 */
export const TAX_CONSTANTS_FROM_2026: TaxConstants = {
  year: 'Từ 2026',
  personalDeduction: 15_500_000,
  dependentDeduction: 6_200_000,
  employeeInsuranceRate: 10.5,
  employerInsuranceRate: 21.5,
  taxBrackets: [
    { from: 0, to: 10_000_000, rate: 5 },
    { from: 10_000_000, to: 30_000_000, rate: 10 },
    { from: 30_000_000, to: 60_000_000, rate: 20 },
    { from: 60_000_000, to: 100_000_000, rate: 30 },
    { from: 100_000_000, to: null, rate: 35 },
  ],
};

/**
 * Basic insurance base (mức cơ bản)
 */
export const BASIC_INSURANCE_BASE = 5_310_000;

/**
 * All available tax constants by year
 */
export const TAX_CONSTANTS_BY_YEAR = {
  before2026: TAX_CONSTANTS_BEFORE_2026,
  from2026: TAX_CONSTANTS_FROM_2026,
} as const;

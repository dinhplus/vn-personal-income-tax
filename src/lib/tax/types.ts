/**
 * Tax bracket definition (simple interface for constants)
 */
export interface TaxBracket {
  from: number;
  to: number | null; 
  rate: number; 
}
export interface TaxConstants {
  year: string;
  personalDeduction: number; 
  dependentDeduction: number; 
  employeeInsuranceRate: number; 
  employerInsuranceRate: number; 
  taxBrackets: TaxBracket[]; 
}


export type { InsuranceBaseConfig, InsuranceResult } from './models/InsuranceCalculator';
export type { TaxBreakdownItem as TaxBreakdownItemOOP, ProgressiveTaxResult } from './models/TaxCalculator';
export type { SalaryType, TaxPayerCalculationResult } from './models/TaxPayer';
export { TaxBracket as TaxBracketClass } from './models/TaxBracket';
export { InsuranceCalculator } from './models/InsuranceCalculator';
export { TaxCalculator as TaxCalculatorClass } from './models/TaxCalculator';
export { TaxPayer } from './models/TaxPayer';
export { createTaxPayer } from './models/factory';

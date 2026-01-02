// Export new OOP models
export { TaxBracket } from './TaxBracket';
export {
  InsuranceCalculator,
  type InsuranceBaseConfig,
  type InsuranceResult,
} from './InsuranceCalculator';
export {
  TaxCalculator,
  type ProgressiveTaxResult,
  type TaxBreakdownItem,
} from './TaxCalculator';
export {
  TaxPayer,
  type SalaryType,
  type TaxPayerCalculationResult,
} from './TaxPayer';

export { createTaxPayer } from './factory';

import { InsuranceCalculator } from './InsuranceCalculator';
import { TaxCalculator } from './TaxCalculator';
import { TaxPayer, type InsuranceBaseConfig } from '.';
import { TaxConstants } from '../types';

export function createTaxPayer(
  constants: TaxConstants,
  dependents: number,
  insuranceBaseConfig: InsuranceBaseConfig
): TaxPayer {
  const insuranceCalculator = new InsuranceCalculator(
    constants.employeeInsuranceRate,
    constants.employerInsuranceRate
  );

  const taxCalculator = new TaxCalculator(
    constants.personalDeduction,
    constants.dependentDeduction,
    constants.taxBrackets
  );

  return new TaxPayer(
    insuranceCalculator,
    taxCalculator,
    dependents,
    insuranceBaseConfig
  );
}

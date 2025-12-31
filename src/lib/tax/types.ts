/**
 * Tax bracket definition for progressive tax calculation
 */
export interface TaxBracket {
  from: number;
  to: number | null; // null means infinity
  rate: number; // percentage (e.g., 5 for 5%)
}

/**
 * Tax constants that vary by year
 */
export interface TaxConstants {
  year: string;
  personalDeduction: number; // mức giảm trừ gia cảnh bản thân
  dependentDeduction: number; // mức giảm trừ mỗi người phụ thuộc
  employeeInsuranceRate: number; // % đóng BHXH người lao động chi trả
  employerInsuranceRate: number; // % đóng BHXH người sử dụng lao động chi trả
  taxBrackets: TaxBracket[]; // biểu thuế lũy tiến từng phần
}

/**
 * Insurance base calculation method
 */
export type InsuranceBaseType = 
  | { type: 'basic'; value: number } // mức cơ bản
  | { type: 'specific'; value: number } // mức cụ thể
  | { type: 'percentage'; value: number }; // % lương gross

/**
 * Input for tax calculation
 */
export interface TaxInput {
  salaryType: 'gross' | 'net';
  salary: number;
  dependents: number; // số người phụ thuộc
  insuranceBase: InsuranceBaseType;
}

/**
 * Tax breakdown by bracket
 */
export interface TaxBreakdownItem {
  bracket: TaxBracket;
  taxableAmount: number; // mức chịu thuế trong bracket này
  taxAmount: number; // tiền thuế phải nộp cho bracket này
}

/**
 * Complete tax calculation result
 */
export interface TaxCalculationResult {
  // Input echo
  input: TaxInput;
  constants: TaxConstants;
  
  // Employee calculations
  grossSalary: number;
  netSalary: number;
  insuranceContribution: number; // tiền đóng BHXH người lao động
  taxableIncome: number; // mức chịu thuế
  totalTax: number; // tổng tiền đóng thuế TNCN
  
  // Employer calculations
  employerInsuranceContribution: number; // tiền đóng BHXH người sử dụng lao động
  totalEmployerCost: number; // tổng chi phí người sử dụng lao động
  
  // Tax breakdown
  taxBreakdown: TaxBreakdownItem[];
}

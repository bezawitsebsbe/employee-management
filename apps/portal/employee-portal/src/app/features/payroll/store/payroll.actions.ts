import { PayrollData, PayrollRecord, PayrollStatistics } from '../models/payroll.models';

// Action Types
export type PayrollAction =
  | { type: 'LOAD_PAYROLL_DATA' }
  | { type: 'LOAD_PAYROLL_DATA_SUCCESS'; payload: PayrollData }
  | { type: 'LOAD_PAYROLL_DATA_FAILURE'; payload: string }
  | { type: 'ADD_PAYROLL_RECORD'; payload: PayrollRecord }
  | { type: 'ADD_PAYROLL_RECORD_SUCCESS'; payload: PayrollRecord }
  | { type: 'ADD_PAYROLL_RECORD_FAILURE'; payload: string }
  | { type: 'UPDATE_PAYROLL_RECORD'; payload: { index: number; record: PayrollRecord } }
  | { type: 'UPDATE_PAYROLL_RECORD_SUCCESS'; payload: { index: number; record: PayrollRecord } }
  | { type: 'UPDATE_PAYROLL_RECORD_FAILURE'; payload: string }
  | { type: 'DELETE_PAYROLL_RECORD'; payload: number }
  | { type: 'DELETE_PAYROLL_RECORD_SUCCESS'; payload: number }
  | { type: 'DELETE_PAYROLL_RECORD_FAILURE'; payload: string }
  | { type: 'EXPORT_PAYROLL_DATA' }
  | { type: 'EXPORT_PAYROLL_DATA_SUCCESS'; payload: string }
  | { type: 'EXPORT_PAYROLL_DATA_FAILURE'; payload: string }
  | { type: 'SET_PAYROLL_LOADING'; payload: boolean }
  | { type: 'CLEAR_PAYROLL_ERROR' }
  | { type: 'RESET_PAYROLL_STATE' };

// Action Creators
export const loadPayrollData = (): PayrollAction => ({
  type: 'LOAD_PAYROLL_DATA'
});

export const loadPayrollDataSuccess = (data: PayrollData): PayrollAction => ({
  type: 'LOAD_PAYROLL_DATA_SUCCESS',
  payload: data
});

export const loadPayrollDataFailure = (error: string): PayrollAction => ({
  type: 'LOAD_PAYROLL_DATA_FAILURE',
  payload: error
});

export const addPayrollRecord = (record: PayrollRecord): PayrollAction => ({
  type: 'ADD_PAYROLL_RECORD',
  payload: record
});

export const addPayrollRecordSuccess = (record: PayrollRecord): PayrollAction => ({
  type: 'ADD_PAYROLL_RECORD_SUCCESS',
  payload: record
});

export const addPayrollRecordFailure = (error: string): PayrollAction => ({
  type: 'ADD_PAYROLL_RECORD_FAILURE',
  payload: error
});

export const updatePayrollRecord = (index: number, record: PayrollRecord): PayrollAction => ({
  type: 'UPDATE_PAYROLL_RECORD',
  payload: { index, record }
});

export const updatePayrollRecordSuccess = (index: number, record: PayrollRecord): PayrollAction => ({
  type: 'UPDATE_PAYROLL_RECORD_SUCCESS',
  payload: { index, record }
});

export const updatePayrollRecordFailure = (error: string): PayrollAction => ({
  type: 'UPDATE_PAYROLL_RECORD_FAILURE',
  payload: error
});

export const deletePayrollRecord = (index: number): PayrollAction => ({
  type: 'DELETE_PAYROLL_RECORD',
  payload: index
});

export const deletePayrollRecordSuccess = (index: number): PayrollAction => ({
  type: 'DELETE_PAYROLL_RECORD_SUCCESS',
  payload: index
});

export const deletePayrollRecordFailure = (error: string): PayrollAction => ({
  type: 'DELETE_PAYROLL_RECORD_FAILURE',
  payload: error
});

export const exportPayrollData = (): PayrollAction => ({
  type: 'EXPORT_PAYROLL_DATA'
});

export const exportPayrollDataSuccess = (csvData: string): PayrollAction => ({
  type: 'EXPORT_PAYROLL_DATA_SUCCESS',
  payload: csvData
});

export const exportPayrollDataFailure = (error: string): PayrollAction => ({
  type: 'EXPORT_PAYROLL_DATA_FAILURE',
  payload: error
});

export const setPayrollLoading = (loading: boolean): PayrollAction => ({
  type: 'SET_PAYROLL_LOADING',
  payload: loading
});

export const clearPayrollError = (): PayrollAction => ({
  type: 'CLEAR_PAYROLL_ERROR'
});

export const resetPayrollState = (): PayrollAction => ({
  type: 'RESET_PAYROLL_STATE'
});

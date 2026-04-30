import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Types
export interface Unit {
  _id: string;
  name: string;
  description?: string;
  type: 'سكني' | 'طبي' | 'إداري';
  isFurnished: boolean;
  project?: string;
  developer?: string;
  isReadyForDelivery: boolean;
  isStoredInSafe: boolean;
  createdAt: string;
}

export interface AnnualIncrease {
  year: number;
  percentage: number;
  newValue: number;
}

export interface Obligation {
  description: string;
  dueDate: string;
}

export interface Installment {
  _id?: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
}

export interface Contract {
  _id: string;
  unit: Unit | string;
  tenantName: string;
  contractStartDate: string;
  contractEndDate: string;
  rentalDuration?: string;
  firstYearRent: number;
  annualIncreases: AnnualIncrease[];
  collectionPeriod?: string;
  insuranceValue?: number;
  contractImageUrl?: string;
  isRented: boolean;
  entryDate?: string;
  alarm?: string;
  contractWriteDate?: string;
  contractReceiveDate?: string;
  gracePeriodEndDate?: string;
  penaltyClause?: string;
  obligations: Obligation[];
  installments: Installment[];
  createdAt: string;
  totalPaid?: number;
  totalRemaining?: number;
}

export interface UnitWithContracts {
  unit: Unit;
  contracts: Contract[];
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface UnitsResponse {
  units: Unit[];
  pagination: Pagination;
}

export interface UnitsFilter {
  type?: string;
  isFurnished?: string;
  isReadyForDelivery?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ContractsResponse {
  contracts: Contract[];
  pagination: Pagination;
}

export interface ContractsFilter {
  isRented?: string;
  unitType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Units
  getUnits(filters?: UnitsFilter): Observable<UnitsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.type) params = params.set('type', filters.type);
      if (filters.isFurnished) params = params.set('isFurnished', filters.isFurnished);
      if (filters.isReadyForDelivery) params = params.set('isReadyForDelivery', filters.isReadyForDelivery);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }
    
    return this.http.get<UnitsResponse>(`${this.apiUrl}/api/units`, { params });
  }

  getUnit(id: string): Observable<UnitWithContracts> {
    return this.http.get<UnitWithContracts>(`${this.apiUrl}/api/units/${id}`);
  }

  createUnit(unit: Partial<Unit>): Observable<Unit> {
    return this.http.post<Unit>(`${this.apiUrl}/api/units`, unit);
  }

  updateUnit(id: string, unit: Partial<Unit>): Observable<Unit> {
    return this.http.put<Unit>(`${this.apiUrl}/api/units/${id}`, unit);
  }

  deleteUnit(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/api/units/${id}`);
  }

  // Contracts
  getContracts(filters?: ContractsFilter): Observable<ContractsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.isRented) params = params.set('isRented', filters.isRented);
      if (filters.unitType) params = params.set('unitType', filters.unitType);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }
    
    return this.http.get<ContractsResponse>(`${this.apiUrl}/api/contracts`, { params });
  }

  getContract(id: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.apiUrl}/api/contracts/${id}`);
  }

  getContractsByUnit(unitId: string): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.apiUrl}/api/contracts/unit/${unitId}`);
  }

  createContract(contract: Partial<Contract>): Observable<Contract> {
    return this.http.post<Contract>(`${this.apiUrl}/api/contracts`, contract);
  }

  updateContract(id: string, contract: Partial<Contract>): Observable<Contract> {
    return this.http.put<Contract>(`${this.apiUrl}/api/contracts/${id}`, contract);
  }

  deleteContract(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/api/contracts/${id}`);
  }

  toggleInstallmentPaid(contractId: string, installmentId: string, isPaid: boolean): Observable<Contract> {
    return this.http.patch<Contract>(
      `${this.apiUrl}/api/contracts/${contractId}/installments/${installmentId}`,
      { isPaid }
    );
  }
}

import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Contract, Unit, Pagination, ContractsFilter } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-contracts-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-amber-400">العقود</h1>
        <button (click)="openForm()" 
                class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium px-4 py-2 rounded-lg transition-colors">
          + إضافة عقد
        </button>
      </div>
      
      <!-- Filters & Search -->
      <div class="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <div class="flex-1">
            <label class="block text-slate-400 text-sm mb-1">بحث</label>
            <input [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" 
                   placeholder="ابحث باسم المستأجر..."
                   class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
          </div>
          <button (click)="applyFilters()" 
                  class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium px-6 py-2 rounded-lg transition-colors self-end">
            بحث
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-slate-400 text-sm mb-1">حالة الإيجار</label>
            <select [(ngModel)]="filterRented" (change)="onFilterChange()" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
              <option value="">الكل</option>
              <option value="true">مؤجر</option>
              <option value="false">غير مؤجر</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-400 text-sm mb-1">نوع الوحدة</label>
            <select [(ngModel)]="filterType" (change)="onFilterChange()" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
              <option value="">الكل</option>
              <option value="سكني">سكني</option>
              <option value="طبي">طبي</option>
              <option value="إداري">إداري</option>
            </select>
          </div>
        </div>
      </div>
      
      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent"></div>
        </div>
      } @else if (contracts().length === 0) {
        <div class="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
          <svg class="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-slate-400 text-lg">لا يوجد عقود</p>
        </div>
      } @else {
        <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="bg-slate-700/50 text-slate-400 text-sm">
                <th class="text-right px-4 py-3">المستأجر</th>
                <th class="text-right px-4 py-3">الوحدة</th>
                <th class="text-right px-4 py-3">نوع الوحدة</th>
                <th class="text-right px-4 py-3">فترة العقد</th>
                <th class="text-right px-4 py-3">الإيجار السنوي</th>
                <th class="text-right px-4 py-3">المتأخر</th>
                <th class="text-right px-4 py-3">المتبقي</th>
                <th class="text-center px-4 py-3">الحالة</th>
                <th class="text-center px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              @for (contract of contracts(); track contract._id) {
                <tr class="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                  <td class="px-4 py-3 text-white font-medium">{{ contract.tenantName }}</td>
                  <td class="px-4 py-3 text-slate-300">{{ getUnitName(contract.unit) }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getTypeClass(getUnitType(contract.unit))" class="px-2 py-1 rounded text-xs">
                      {{ getUnitType(contract.unit) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-300 text-sm">
                    {{ contract.contractStartDate | date:'yyyy/MM/dd' }} - 
                    {{ contract.contractEndDate | date:'yyyy/MM/dd' }}
                  </td>
                  <td class="px-4 py-3 text-white">{{ contract.firstYearRent | number }}</td>
                  <td class="px-4 py-3 text-green-400">{{ contract.totalPaid | number }}</td>
                  <td class="px-4 py-3 text-amber-400">{{ contract.totalRemaining | number }}</td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="contract.isRented ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'" 
                          class="px-2 py-1 rounded text-xs">
                      {{ contract.isRented ? 'مؤجر' : 'غير مؤجر' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center gap-2">
                      <a [routerLink]="['/contracts', contract._id]" 
                         class="p-2 hover:bg-slate-700 rounded text-blue-400 transition-colors" title="عرض">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </a>
                      <button (click)="editContract(contract)" 
                              class="p-2 hover:bg-slate-700 rounded text-amber-400 transition-colors" title="تعديل">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button (click)="deleteContract(contract)" 
                              class="p-2 hover:bg-slate-700 rounded text-red-400 transition-colors" title="حذف">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        @if (pagination()) {
          <div class="flex justify-center items-center gap-2 mt-6">
            <button (click)="goToPage(pagination()!.current_page - 1)" 
                    [disabled]="!pagination()!.has_prev_page"
                    class="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors">
              السابق
            </button>
            
            <div class="flex gap-1">
              @for (p of getPageNumbers(); track p) {
                <button (click)="goToPage(p)" 
                        [class]="p === pagination()!.current_page ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'"
                        class="w-10 h-10 rounded-lg transition-colors">
                  {{ p }}
                </button>
              }
            </div>
            
            <button (click)="goToPage(pagination()!.current_page + 1)" 
                    [disabled]="!pagination()!.has_next_page"
                    class="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors">
              التالي
            </button>
            
            <span class="text-slate-400 mr-4">
              عرض {{ ((pagination()!.current_page - 1) * pagination()!.items_per_page) + 1 }} - {{ Math.min(pagination()!.current_page * pagination()!.items_per_page, pagination()!.total_items) }} من {{ pagination()!.total_items }}
            </span>
          </div>
        }
      }
    </div>
    
    <!-- Form Modal -->
    @if (showForm()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto" (click)="closeForm()">
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-2xl border border-slate-700 my-8" (click)="$event.stopPropagation()">
          <h2 class="text-xl font-bold text-white mb-4">{{ editingContract() ? 'تعديل عقد' : 'إضافة عقد جديد' }}</h2>
          
          <form (ngSubmit)="saveContract()" class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-400 text-sm mb-1">الوحدة *</label>
                <select [(ngModel)]="formData.unit" name="unit" required
                        class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
                  <option value="">اختر الوحدة</option>
                  @for (unit of units(); track unit._id) {
                    <option [value]="unit._id">{{ unit.name }} ({{ unit.type }})</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-slate-400 text-sm mb-1">اسم المستأجر *</label>
                <input [(ngModel)]="formData.tenantName" name="tenantName" required
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-400 text-sm mb-1">بداية العقد *</label>
                <input type="date" [(ngModel)]="formData.contractStartDate" name="contractStartDate" required
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
              <div>
                <label class="block text-slate-400 text-sm mb-1">نهاية العقد *</label>
                <input type="date" [(ngModel)]="formData.contractEndDate" name="contractEndDate" required
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-slate-400 text-sm mb-1">مدة الإيجار</label>
                <input [(ngModel)]="formData.rentalDuration" name="rentalDuration"
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
              <div>
                <label class="block text-slate-400 text-sm mb-1">الإيجار السنوي *</label>
                <input type="number" [(ngModel)]="formData.firstYearRent" name="firstYearRent" required
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
              <div>
                <label class="block text-slate-400 text-sm mb-1">فترة التحصيل</label>
                <input [(ngModel)]="formData.collectionPeriod" name="collectionPeriod"
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-400 text-sm mb-1">قيمة التأمين</label>
                <input type="number" [(ngModel)]="formData.insuranceValue" name="insuranceValue"
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
              <div>
                <label class="block text-slate-400 text-sm mb-1">صورة العقد (URL)</label>
                <input [(ngModel)]="formData.contractImageUrl" name="contractImageUrl"
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-slate-400 text-sm mb-1">تاريخ الدخول</label>
                <input type="date" [(ngModel)]="formData.entryDate" name="entryDate"
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
              <div>
                <label class="block text-slate-400 text-sm mb-1">تنبيه</label>
                <input type="date" [(ngModel)]="formData.alarm" name="alarm"
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
              <div>
                <label class="block text-slate-400 text-sm mb-1">نهاية فترة السماح</label>
                <input type="date" [(ngModel)]="formData.gracePeriodEndDate" name="gracePeriodEndDate"
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
            </div>
            
            <div>
              <label class="block text-slate-400 text-sm mb-1">بند الغرامات</label>
              <textarea [(ngModel)]="formData.penaltyClause" name="penaltyClause" rows="2"
                        class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"></textarea>
            </div>
            
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="formData.isRented" name="isRented"
                       class="w-4 h-4 accent-amber-400">
                <span class="text-slate-300">مؤجر</span>
              </label>
            </div>
            
            <!-- Installments -->
            <div class="border-t border-slate-700 pt-4">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-white font-medium">الأقساط</h3>
                <button type="button" (click)="addInstallment()"
                        class="text-amber-400 hover:text-amber-300 text-sm">+ إضافة قسط</button>
              </div>
              <div class="space-y-2">
                @for (inst of formData.installments; track $index) {
                  <div class="flex gap-2 items-center">
                    <input type="number" [(ngModel)]="inst.amount" [name]="'inst_amount_' + $index" placeholder="المبلغ"
                           class="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-400 outline-none">
                    <input type="date" [(ngModel)]="inst.dueDate" [name]="'inst_date_' + $index"
                           class="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-400 outline-none">
                    <button type="button" (click)="removeInstallment($index)"
                            class="p-2 text-red-400 hover:bg-slate-700 rounded">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            </div>
            
            <div class="flex gap-3 pt-4 border-t border-slate-700">
              <button type="submit" 
                      class="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium py-2 rounded-lg transition-colors">
                {{ editingContract() ? 'حفظ التعديلات' : 'إضافة' }}
              </button>
              <button type="button" (click)="closeForm()"
                      class="px-6 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    }
    
    <!-- Delete Confirmation -->
    @if (showDeleteConfirm()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-4">تأكيد الحذف</h2>
          <p class="text-slate-300 mb-6">هل أنت متأكد من حذف عقد "{{ contractToDelete()?.tenantName }}"؟</p>
          <div class="flex gap-3">
            <button (click)="confirmDelete()" 
                    class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors">
              حذف
            </button>
            <button (click)="showDeleteConfirm.set(false); contractToDelete.set(null)"
                    class="px-6 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ContractsListComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  
  loading = signal(true);
  contracts = signal<Contract[]>([]);
  units = signal<Unit[]>([]);
  pagination = signal<Pagination | null>(null);
  showForm = signal(false);
  showDeleteConfirm = signal(false);
  editingContract = signal<Contract | null>(null);
  contractToDelete = signal<Contract | null>(null);
  
  filterRented = '';
  filterType = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  
  Math = Math;
  
  formData: Partial<Contract> = this.getEmptyForm();
  
  constructor() {
    this.loadData();
    this.loadUnits();
    
    // Check if we should open form for specific unit
    effect(() => {
      const params = this.route.snapshot.queryParams;
      if (params['add'] === 'true' && params['unitId']) {
        this.formData.unit = params['unitId'];
        this.showForm.set(true);
      }
    });
  }
  
  onFilterChange() {
    this.currentPage = 1;
    this.loadData();
  }
  
  onSearchChange() {
    // Debounce search - will trigger on button click or filter change
  }
  
  applyFilters() {
    this.currentPage = 1;
    this.loadData();
  }
  
  goToPage(page: number) {
    this.currentPage = page;
    this.loadData();
  }
  
  getPageNumbers(): number[] {
    const pag = this.pagination();
    if (!pag) return [];
    
    const pages: number[] = [];
    const start = Math.max(1, pag.current_page - 2);
    const end = Math.min(pag.total_pages, pag.current_page + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  private async loadUnits() {
    try {
      const unitsResponse = await this.api.getUnits({ limit: 1000 }).toPromise();
      this.units.set(unitsResponse?.units || []);
    } catch (error) {
      console.error('Error loading units:', error);
    }
  }
  
  private async loadData() {
    this.loading.set(true);
    try {
      const filters: ContractsFilter = {
        page: this.currentPage,
        limit: this.itemsPerPage
      };
      
      if (this.filterRented) filters.isRented = this.filterRented;
      if (this.filterType) filters.unitType = this.filterType;
      if (this.searchTerm) filters.search = this.searchTerm;
      
      const data = await this.api.getContracts(filters).toPromise();
      if (data) {
        this.contracts.set(data.contracts);
        this.pagination.set(data.pagination);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      this.notify.error('حدث خطأ أثناء تحميل العقود');
    } finally {
      this.loading.set(false);
    }
  }
  
  private getEmptyForm(): Partial<Contract> {
    return {
      unit: '',
      tenantName: '',
      contractStartDate: '',
      contractEndDate: '',
      rentalDuration: '',
      firstYearRent: 0,
      collectionPeriod: '',
      insuranceValue: 0,
      contractImageUrl: '',
      isRented: false,
      entryDate: '',
      alarm: '',
      gracePeriodEndDate: '',
      penaltyClause: '',
      installments: []
    };
  }
  
  
  getUnitName(unit: Unit | string): string {
    if (typeof unit === 'string') {
      const found = this.units().find(u => u._id === unit);
      return found?.name || 'وحدة';
    }
    return unit.name;
  }
  
  getUnitType(unit: Unit | string): string {
    if (typeof unit === 'string') {
      const found = this.units().find(u => u._id === unit);
      return found?.type || '';
    }
    return unit.type;
  }
  
  getTypeClass(type: string): string {
    switch (type) {
      case 'سكني': return 'bg-blue-500/20 text-blue-400';
      case 'طبي': return 'bg-green-500/20 text-green-400';
      case 'إداري': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  }
  
  openForm() {
    this.editingContract.set(null);
    this.formData = this.getEmptyForm();
    this.showForm.set(true);
  }
  
  editContract(contract: Contract) {
    this.editingContract.set(contract);
    this.formData = {
      ...contract,
      unit: typeof contract.unit === 'string' ? contract.unit : contract.unit._id,
      installments: contract.installments?.map(i => ({ ...i })) || []
    };
    this.showForm.set(true);
  }
  
  closeForm() {
    this.showForm.set(false);
    this.editingContract.set(null);
    this.formData = this.getEmptyForm();
    // Clear query params
    this.router.navigate([], { queryParams: {} });
  }
  
  addInstallment() {
    if (!this.formData.installments) {
      this.formData.installments = [];
    }
    this.formData.installments.push({ amount: 0, dueDate: '', isPaid: false });
  }
  
  removeInstallment(index: number) {
    this.formData.installments?.splice(index, 1);
  }
  
  async saveContract() {
    this.notify.loading(this.editingContract() ? 'جاري حفظ التعديلات...' : 'جاري إضافة العقد...');
    try {
      if (this.editingContract()) {
        await this.api.updateContract(this.editingContract()!._id, this.formData).toPromise();
      } else {
        await this.api.createContract(this.formData).toPromise();
      }
      this.notify.close();
      this.notify.success(this.editingContract() ? 'تم حفظ التعديلات بنجاح' : 'تم إضافة العقد بنجاح');
      this.closeForm();
      this.loadData();
    } catch (error) {
      console.error('Error saving contract:', error);
      this.notify.close();
      this.notify.error('حدث خطأ أثناء حفظ العقد');
    }
  }
  
  deleteContract(contract: Contract) {
    this.contractToDelete.set(contract);
    this.showDeleteConfirm.set(true);
  }
  
  async confirmDelete() {
    this.notify.loading('جاري حذف العقد...');
    try {
      await this.api.deleteContract(this.contractToDelete()!._id).toPromise();
      this.notify.close();
      this.notify.success('تم حذف العقد بنجاح');
      this.showDeleteConfirm.set(false);
      this.contractToDelete.set(null);
      this.loadData();
    } catch (error) {
      console.error('Error deleting contract:', error);
      this.notify.close();
      this.notify.error('حدث خطأ أثناء حذف العقد');
    }
  }
}

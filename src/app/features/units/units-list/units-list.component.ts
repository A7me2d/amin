import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Unit, Pagination, UnitsFilter } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-units-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-amber-400">الوحدات</h1>
        <button (click)="showForm.set(true)" 
                class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium px-4 py-2 rounded-lg transition-colors">
          + إضافة وحدة
        </button>
      </div>
      
      <!-- Filters & Search -->
      <div class="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <div class="flex-1">
            <label class="block text-slate-400 text-sm mb-1">بحث</label>
            <input [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" 
                   placeholder="ابحث بالاسم، المشروع، المطور..."
                   class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
          </div>
          <button (click)="applyFilters()" 
                  class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium px-6 py-2 rounded-lg transition-colors self-end">
            بحث
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-slate-400 text-sm mb-1">نوع الوحدة</label>
            <select [(ngModel)]="filterType" (change)="onFilterChange()" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
              <option value="">الكل</option>
              <option value="سكني">سكني</option>
              <option value="طبي">طبي</option>
              <option value="إداري">إداري</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-400 text-sm mb-1">التأثيث</label>
            <select [(ngModel)]="filterFurnished" (change)="onFilterChange()" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
              <option value="">الكل</option>
              <option value="true">مفروش</option>
              <option value="false">غير مفروش</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-400 text-sm mb-1">جاهز للتسليم</label>
            <select [(ngModel)]="filterReady" (change)="onFilterChange()" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
              <option value="">الكل</option>
              <option value="true">جاهز</option>
              <option value="false">غير جاهز</option>
            </select>
          </div>
        </div>
      </div>
      
      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent"></div>
        </div>
      } @else if (units().length === 0) {
        <div class="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
          <svg class="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <p class="text-slate-400 text-lg">لا يوجد وحدات</p>
        </div>
      } @else {
        <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="bg-slate-700/50 text-slate-400 text-sm">
                <th class="text-right px-4 py-3">اسم الوحدة</th>
                <th class="text-right px-4 py-3">النوع</th>
                <th class="text-right px-4 py-3">المشروع</th>
                <th class="text-right px-4 py-3">المطور</th>
                <th class="text-center px-4 py-3">مفروش</th>
                <th class="text-center px-4 py-3">جاهز</th>
                <th class="text-center px-4 py-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              @for (unit of units(); track unit._id) {
                <tr class="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                  <td class="px-4 py-3 text-white font-medium">{{ unit.name }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getTypeClass(unit.type)" class="px-2 py-1 rounded text-xs">
                      {{ unit.type }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-300">{{ unit.project || '-' }}</td>
                  <td class="px-4 py-3 text-slate-300">{{ unit.developer || '-' }}</td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="unit.isFurnished ? 'text-green-400' : 'text-slate-500'">
                      {{ unit.isFurnished ? 'نعم' : 'لا' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="unit.isReadyForDelivery ? 'text-green-400' : 'text-slate-500'">
                      {{ unit.isReadyForDelivery ? 'نعم' : 'لا' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center gap-2">
                      <a [routerLink]="['/units', unit._id]" 
                         class="p-2 hover:bg-slate-700 rounded text-blue-400 transition-colors" title="عرض">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </a>
                      <button (click)="editUnit(unit)" 
                              class="p-2 hover:bg-slate-700 rounded text-amber-400 transition-colors" title="تعديل">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button (click)="deleteUnit(unit)" 
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
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="closeForm()">
        <div class="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-slate-700" (click)="$event.stopPropagation()">
          <h2 class="text-xl font-bold text-white mb-4">{{ editingUnit() ? 'تعديل وحدة' : 'إضافة وحدة جديدة' }}</h2>
          
          <form (ngSubmit)="saveUnit()" class="space-y-4">
            <div>
              <label class="block text-slate-400 text-sm mb-1">اسم الوحدة *</label>
              <input [(ngModel)]="formData.name" name="name" required
                     class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
            </div>
            
            <div>
              <label class="block text-slate-400 text-sm mb-1">الوصف</label>
              <textarea [(ngModel)]="formData.description" name="description" rows="2"
                        class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"></textarea>
            </div>
            
            <div>
              <label class="block text-slate-400 text-sm mb-1">نوع الوحدة *</label>
              <select [(ngModel)]="formData.type" name="type" required
                      class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
                <option value="سكني">سكني</option>
                <option value="طبي">طبي</option>
                <option value="إداري">إداري</option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-400 text-sm mb-1">المشروع</label>
                <input [(ngModel)]="formData.project" name="project"
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
              <div>
                <label class="block text-slate-400 text-sm mb-1">المطور</label>
                <input [(ngModel)]="formData.developer" name="developer"
                       class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none">
              </div>
            </div>
            
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="formData.isFurnished" name="isFurnished"
                       class="w-4 h-4 accent-amber-400">
                <span class="text-slate-300">مفروش</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="formData.isReadyForDelivery" name="isReadyForDelivery"
                       class="w-4 h-4 accent-amber-400">
                <span class="text-slate-300">جاهز للتسليم</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="formData.isStoredInSafe" name="isStoredInSafe"
                       class="w-4 h-4 accent-amber-400">
                <span class="text-slate-300">محفوظ في الخزينة</span>
              </label>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button type="submit" 
                      class="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium py-2 rounded-lg transition-colors">
                {{ editingUnit() ? 'حفظ التعديلات' : 'إضافة' }}
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
          <p class="text-slate-300 mb-6">هل أنت متأكد من حذف وحدة "{{ unitToDelete()?.name }}"؟</p>
          <div class="flex gap-3">
            <button (click)="confirmDelete()" 
                    class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors">
              حذف
            </button>
            <button (click)="showDeleteConfirm.set(false); unitToDelete.set(null)"
                    class="px-6 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class UnitsListComponent {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  
  loading = signal(true);
  units = signal<Unit[]>([]);
  pagination = signal<Pagination | null>(null);
  showForm = signal(false);
  showDeleteConfirm = signal(false);
  editingUnit = signal<Unit | null>(null);
  unitToDelete = signal<Unit | null>(null);
  
  filterType = '';
  filterFurnished = '';
  filterReady = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  
  Math = Math;
  
  formData: Partial<Unit> = {
    name: '',
    description: '',
    type: 'سكني',
    isFurnished: false,
    project: '',
    developer: '',
    isReadyForDelivery: false,
    isStoredInSafe: false
  };
  
  
  constructor() {
    this.loadUnits();
  }
  
  onFilterChange() {
    this.currentPage = 1;
    this.loadUnits();
  }
  
  onSearchChange() {
    // Debounce search - will trigger on button click or filter change
  }
  
  applyFilters() {
    this.currentPage = 1;
    this.loadUnits();
  }
  
  goToPage(page: number) {
    this.currentPage = page;
    this.loadUnits();
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
    this.loading.set(true);
    try {
      const filters: UnitsFilter = {
        page: this.currentPage,
        limit: this.itemsPerPage
      };
      
      if (this.filterType) filters.type = this.filterType;
      if (this.filterFurnished) filters.isFurnished = this.filterFurnished;
      if (this.filterReady) filters.isReadyForDelivery = this.filterReady;
      if (this.searchTerm) filters.search = this.searchTerm;
      
      const data = await this.api.getUnits(filters).toPromise();
      if (data) {
        this.units.set(data.units);
        this.pagination.set(data.pagination);
      }
    } catch (error) {
      console.error('Error loading units:', error);
      this.notify.error('حدث خطأ أثناء تحميل الوحدات');
    } finally {
      this.loading.set(false);
    }
  }
  
  
  getTypeClass(type: string): string {
    switch (type) {
      case 'سكني': return 'bg-blue-500/20 text-blue-400';
      case 'طبي': return 'bg-green-500/20 text-green-400';
      case 'إداري': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  }
  
  editUnit(unit: Unit) {
    this.editingUnit.set(unit);
    this.formData = { ...unit };
    this.showForm.set(true);
  }
  
  closeForm() {
    this.showForm.set(false);
    this.editingUnit.set(null);
    this.formData = {
      name: '',
      description: '',
      type: 'سكني',
      isFurnished: false,
      project: '',
      developer: '',
      isReadyForDelivery: false,
      isStoredInSafe: false
    };
  }
  
  async saveUnit() {
    this.notify.loading(this.editingUnit() ? 'جاري حفظ التعديلات...' : 'جاري إضافة الوحدة...');
    try {
      if (this.editingUnit()) {
        await this.api.updateUnit(this.editingUnit()!._id, this.formData).toPromise();
      } else {
        await this.api.createUnit(this.formData).toPromise();
      }
      this.notify.close();
      this.notify.success(this.editingUnit() ? 'تم حفظ التعديلات بنجاح' : 'تم إضافة الوحدة بنجاح');
      this.closeForm();
      this.loadUnits();
    } catch (error) {
      console.error('Error saving unit:', error);
      this.notify.close();
      this.notify.error('حدث خطأ أثناء حفظ الوحدة');
    }
  }
  
  deleteUnit(unit: Unit) {
    this.unitToDelete.set(unit);
    this.showDeleteConfirm.set(true);
  }
  
  async confirmDelete() {
    this.notify.loading('جاري حذف الوحدة...');
    try {
      await this.api.deleteUnit(this.unitToDelete()!._id).toPromise();
      this.notify.close();
      this.notify.success('تم حذف الوحدة بنجاح');
      this.showDeleteConfirm.set(false);
      this.unitToDelete.set(null);
      this.loadUnits();
    } catch (error) {
      console.error('Error deleting unit:', error);
      this.notify.close();
      this.notify.error('حدث خطأ أثناء حذف الوحدة');
    }
  }
}

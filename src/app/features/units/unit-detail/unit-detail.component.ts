import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService, Unit, Contract } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-unit-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent"></div>
        </div>
      } @else if (unit()) {
        <!-- Back Button -->
        <a routerLink="/units" class="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
          <span>العودة إلى الوحدات</span>
        </a>
        
        <!-- Unit Info Card -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 class="text-2xl font-bold text-white">{{ unit()?.name }}</h1>
              <span [class]="getTypeClass(unit()?.type)" class="inline-block px-3 py-1 rounded text-sm mt-2">
                {{ unit()?.type }}
              </span>
            </div>
            <div class="flex gap-2">
              <a [routerLink]="['/contracts']" [queryParams]="{add: true, unitId: unit()?._id}"
                 class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium px-4 py-2 rounded-lg transition-colors">
                + إضافة عقد
              </a>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="space-y-4">
              <div>
                <p class="text-slate-400 text-sm">الوصف</p>
                <p class="text-white">{{ unit()?.description || '-' }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">المشروع</p>
                <p class="text-white">{{ unit()?.project || '-' }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">المطور</p>
                <p class="text-white">{{ unit()?.developer || '-' }}</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <p class="text-slate-400 text-sm">التأثيث</p>
                <p [class]="unit()?.isFurnished ? 'text-green-400' : 'text-slate-400'">
                  {{ unit()?.isFurnished ? 'مفروش' : 'غير مفروش' }}
                </p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">جاهز للتسليم</p>
                <p [class]="unit()?.isReadyForDelivery ? 'text-green-400' : 'text-slate-400'">
                  {{ unit()?.isReadyForDelivery ? 'نعم' : 'لا' }}
                </p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">محفوظ في الخزينة</p>
                <p [class]="unit()?.isStoredInSafe ? 'text-green-400' : 'text-slate-400'">
                  {{ unit()?.isStoredInSafe ? 'نعم' : 'لا' }}
                </p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <p class="text-slate-400 text-sm">تاريخ الإضافة</p>
                <p class="text-white">{{ unit()?.createdAt | date:'yyyy/MM/dd' }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">عدد العقود</p>
                <p class="text-white">{{ contracts().length }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Contracts Timeline -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-6">سجل العقود</h2>
          
          @if (contracts().length === 0) {
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-slate-400">لا يوجد عقود لهذه الوحدة</p>
            </div>
          } @else {
            <div class="relative">
              <!-- Timeline line -->
              <div class="absolute right-6 top-0 bottom-0 w-0.5 bg-slate-700"></div>
              
              <div class="space-y-6">
                @for (contract of contracts(); track contract._id) {
                  <div class="relative pr-12">
                    <!-- Timeline dot -->
                    <div class="absolute right-4 w-4 h-4 rounded-full"
                         [class]="contract.isRented ? 'bg-green-400' : 'bg-amber-400'"></div>
                    
                    <a [routerLink]="['/contracts', contract._id]"
                       class="block bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors">
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <h3 class="text-white font-medium">{{ contract.tenantName }}</h3>
                          <p class="text-slate-400 text-sm">
                            {{ contract.contractStartDate | date:'yyyy/MM/dd' }} - 
                            {{ contract.contractEndDate | date:'yyyy/MM/dd' }}
                          </p>
                        </div>
                        <span [class]="contract.isRented ? 'text-green-400' : 'text-amber-400'" class="text-sm">
                          {{ contract.isRented ? 'مؤجر' : 'غير مؤجر' }}
                        </span>
                      </div>
                      
                      <div class="flex gap-6 text-sm mt-3">
                        <div>
                          <span class="text-slate-400">الإيجار السنوي: </span>
                          <span class="text-white">{{ contract.firstYearRent | number }}</span>
                        </div>
                        <div>
                          <span class="text-slate-400">المدفوع: </span>
                          <span class="text-green-400">{{ contract.totalPaid | number }}</span>
                        </div>
                        <div>
                          <span class="text-slate-400">المتبقي: </span>
                          <span class="text-amber-400">{{ contract.totalRemaining | number }}</span>
                        </div>
                      </div>
                    </a>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12">
          <p class="text-slate-400">الوحدة غير موجودة</p>
        </div>
      }
    </div>
  `
})
export class UnitDetailComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  
  loading = signal(true);
  unit = signal<Unit | null>(null);
  contracts = signal<Contract[]>([]);
  
  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUnit(id);
    }
  }
  
  private async loadUnit(id: string) {
    this.notify.loading('جاري تحميل بيانات الوحدة...');
    try {
      const data = await this.api.getUnit(id).toPromise();
      if (data) {
        this.unit.set(data.unit);
        this.contracts.set(data.contracts);
      }
    } catch (error) {
      console.error('Error loading unit:', error);
      this.notify.error('حدث خطأ أثناء تحميل بيانات الوحدة');
    } finally {
      this.notify.close();
      this.loading.set(false);
    }
  }
  
  getTypeClass(type: string | undefined): string {
    switch (type) {
      case 'سكني': return 'bg-blue-500/20 text-blue-400';
      case 'طبي': return 'bg-green-500/20 text-green-400';
      case 'إداري': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  }
}

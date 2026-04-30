import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService, Contract, Installment } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-contract-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent"></div>
        </div>
      } @else if (contract()) {
        <!-- Back Button -->
        <a routerLink="/contracts" class="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
          <span>العودة إلى العقود</span>
        </a>
        
        <!-- Header -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-white">{{ contract()?.tenantName }}</h1>
              <div class="flex items-center gap-3 mt-2">
                <a [routerLink]="['/units', getUnitId()]" class="text-amber-400 hover:text-amber-300">
                  {{ getUnitName() }}
                </a>
                <span [class]="contract()?.isRented ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'" 
                      class="px-3 py-1 rounded text-sm">
                  {{ contract()?.isRented ? 'مؤجر' : 'غير مؤجر' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Contract Info -->
          <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 class="text-lg font-semibold text-white mb-4">بيانات العقد</h2>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-slate-400 text-sm">بداية العقد</p>
                <p class="text-white">{{ contract()?.contractStartDate | date:'yyyy/MM/dd' }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">نهاية العقد</p>
                <p class="text-white">{{ contract()?.contractEndDate | date:'yyyy/MM/dd' }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">مدة الإيجار</p>
                <p class="text-white">{{ contract()?.rentalDuration || '-' }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">فترة التحصيل</p>
                <p class="text-white">{{ contract()?.collectionPeriod || '-' }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">الإيجار السنوي</p>
                <p class="text-white font-medium">{{ contract()?.firstYearRent | number }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">قيمة التأمين</p>
                <p class="text-white">{{ contract()?.insuranceValue | number }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">تاريخ الدخول</p>
                <p class="text-white">{{ contract()?.entryDate | date:'yyyy/MM/dd' }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm">نهاية فترة السماح</p>
                <p class="text-white">{{ contract()?.gracePeriodEndDate | date:'yyyy/MM/dd' }}</p>
              </div>
            </div>
            
            @if (contract()?.penaltyClause) {
              <div class="mt-4 pt-4 border-t border-slate-700">
                <p class="text-slate-400 text-sm">بند الغرامات</p>
                <p class="text-white">{{ contract()?.penaltyClause }}</p>
              </div>
            }
          </div>
          
          <!-- Payment Summary -->
          <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 class="text-lg font-semibold text-white mb-4">ملخص الدفع</h2>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-slate-400">المدفوع</span>
                <span class="text-green-400 text-xl font-bold">{{ contract()?.totalPaid | number }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-400">المتبقي</span>
                <span class="text-amber-400 text-xl font-bold">{{ contract()?.totalRemaining | number }}</span>
              </div>
              
              <!-- Progress Bar -->
              <div class="mt-4">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-slate-400">نسبة السداد</span>
                  <span class="text-white">{{ paymentProgress() }}%</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-3">
                  <div class="bg-linear-to-l from-green-500 to-amber-400 h-3 rounded-full transition-all duration-500"
                       [style.width.%]="paymentProgress()"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Alarm Warning -->
        @if (hasNearAlarm()) {
          <div class="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 flex items-center gap-3">
            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <div>
              <p class="text-red-400 font-medium">تنبيه قريب!</p>
              <p class="text-red-300 text-sm">{{ contract()?.alarm | date:'yyyy/MM/dd' }}</p>
            </div>
          </div>
        }
        
        <!-- Annual Increases -->
        @if (contract()?.annualIncreases?.length) {
          <div class="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h2 class="text-lg font-semibold text-white mb-4">الزيادات السنوية</h2>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-slate-400 text-sm border-b border-slate-700">
                    <th class="text-right pb-3">السنة</th>
                    <th class="text-right pb-3">نسبة الزيادة</th>
                    <th class="text-right pb-3">القيمة الجديدة</th>
                  </tr>
                </thead>
                <tbody>
                  @for (increase of contract()?.annualIncreases; track $index) {
                    <tr class="border-b border-slate-700/50">
                      <td class="py-3 text-white">السنة {{ increase.year }}</td>
                      <td class="py-3 text-amber-400">{{ increase.percentage }}%</td>
                      <td class="py-3 text-white">{{ increase.newValue | number }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
        
        <!-- Installments -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <h2 class="text-lg font-semibold text-white mb-4">الأقساط</h2>
          
          @if (contract()?.installments?.length) {
            <div class="space-y-3">
              @for (installment of contract()?.installments; track installment._id; let i = $index) {
                <div class="flex items-center justify-between bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center"
                         [class]="installment.isPaid ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'">
                      @if (installment.isPaid) {
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      } @else {
                        <span class="text-sm font-bold">{{ i + 1 }}</span>
                      }
                    </div>
                    <div>
                      <p class="text-white font-medium">{{ installment.amount | number }}</p>
                      <p class="text-slate-400 text-sm">{{ installment.dueDate | date:'yyyy/MM/dd' }}</p>
                    </div>
                  </div>
                  
                  <button (click)="toggleInstallment(installment)"
                          [class]="installment.isPaid ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'"
                          class="px-4 py-2 rounded-lg text-slate-900 font-medium transition-colors">
                    {{ installment.isPaid ? 'إلغاء السداد' : 'تسجيل السداد' }}
                  </button>
                </div>
              }
            </div>
          } @else {
            <p class="text-slate-400 text-center py-8">لا يوجد أقساط</p>
          }
        </div>
        
        <!-- Obligations -->
        @if (contract()?.obligations?.length) {
          <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 class="text-lg font-semibold text-white mb-4">الالتزامات</h2>
            <div class="space-y-3">
              @for (obligation of contract()?.obligations; track $index) {
                <div class="flex items-center justify-between bg-slate-700/50 rounded-lg p-4">
                  <p class="text-white">{{ obligation.description }}</p>
                  <p class="text-slate-400 text-sm">{{ obligation.dueDate | date:'yyyy/MM/dd' }}</p>
                </div>
              }
            </div>
          </div>
        }
      } @else {
        <div class="text-center py-12">
          <p class="text-slate-400">العقد غير موجود</p>
        </div>
      }
    </div>
  `
})
export class ContractDetailComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  
  loading = signal(true);
  contract = signal<Contract | null>(null);
  
  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadContract(id);
    }
  }
  
  private async loadContract(id: string) {
    this.notify.loading('جاري تحميل بيانات العقد...');
    try {
      const data = await this.api.getContract(id).toPromise();
      this.contract.set(data ?? null);
    } catch (error) {
      console.error('Error loading contract:', error);
      this.notify.error('حدث خطأ أثناء تحميل بيانات العقد');
    } finally {
      this.notify.close();
      this.loading.set(false);
    }
  }
  
  paymentProgress = computed(() => {
    const c = this.contract();
    if (!c || !c.installments?.length) return 0;
    const total = c.installments.reduce((sum, i) => sum + (i.amount || 0), 0);
    if (total === 0) return 0;
    return Math.round(((c.totalPaid || 0) / total) * 100);
  });
  
  hasNearAlarm = computed(() => {
    const c = this.contract();
    if (!c?.alarm) return false;
    const alarmDate = new Date(c.alarm);
    const now = new Date();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return alarmDate.getTime() - now.getTime() < sevenDays && alarmDate >= now;
  });
  
  getUnitName(): string {
    const unit = this.contract()?.unit;
    if (typeof unit === 'string') return 'وحدة';
    return unit?.name || 'وحدة';
  }
  
  getUnitId(): string {
    const unit = this.contract()?.unit;
    if (typeof unit === 'string') return unit;
    return unit?._id || '';
  }
  
  async toggleInstallment(installment: Installment) {
    const c = this.contract();
    if (!c || !installment._id) return;
    
    this.notify.loading(installment.isPaid ? 'جاري إلغاء سداد القسط...' : 'جاري تسجيل سداد القسط...');
    try {
      const updated = await this.api.toggleInstallmentPaid(c._id, installment._id, !installment.isPaid).toPromise();
      this.contract.set(updated ?? null);
      this.notify.close();
      this.notify.success(installment.isPaid ? 'تم إلغاء سداد القسط' : 'تم تسجيل سداد القسط');
    } catch (error) {
      console.error('Error toggling installment:', error);
      this.notify.close();
      this.notify.error('حدث خطأ أثناء تحديث حالة القسط');
    }
  }
}

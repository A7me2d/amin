import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Unit, Contract } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-amber-400 mb-6">الرئيسية</h1>
      
      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent"></div>
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-400 text-sm">إجمالي الوحدات</p>
                <p class="text-3xl font-bold text-white mt-2">{{ totalUnits() }}</p>
              </div>
              <div class="bg-blue-500/20 p-3 rounded-lg">
                <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-400 text-sm">الوحدات المؤجرة</p>
                <p class="text-3xl font-bold text-green-400 mt-2">{{ rentedUnits() }}</p>
              </div>
              <div class="bg-green-500/20 p-3 rounded-lg">
                <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-400 text-sm">الوحدات المتاحة</p>
                <p class="text-3xl font-bold text-amber-400 mt-2">{{ availableUnits() }}</p>
              </div>
              <div class="bg-amber-500/20 p-3 rounded-lg">
                <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-400 text-sm">إجمالي المحصل</p>
                <p class="text-3xl font-bold text-emerald-400 mt-2">{{ totalCollected() | number }}</p>
              </div>
              <div class="bg-emerald-500/20 p-3 rounded-lg">
                <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Units by Type -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 class="text-lg font-semibold text-white mb-4">الوحدات حسب النوع</h2>
            <div class="space-y-4">
              @for (type of unitTypes(); track type.name) {
                <div class="flex items-center justify-between">
                  <span class="text-slate-300">{{ type.name }}</span>
                  <div class="flex items-center gap-3">
                    <div class="w-32 bg-slate-700 rounded-full h-2">
                      <div class="bg-amber-400 h-2 rounded-full" [style.width.%]="type.percentage"></div>
                    </div>
                    <span class="text-white font-medium w-8">{{ type.count }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
          
          <!-- Recent Contracts -->
          <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 class="text-lg font-semibold text-white mb-4">آخر العقود</h2>
            @if (recentContracts().length === 0) {
              <p class="text-slate-400 text-center py-8">لا يوجد عقود بعد</p>
            } @else {
              <div class="space-y-3">
                @for (contract of recentContracts(); track contract._id) {
                  <a [routerLink]="['/contracts', contract._id]" 
                     class="block bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700 transition-colors">
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="text-white font-medium">{{ contract.tenantName }}</p>
                        <p class="text-slate-400 text-sm">{{ getUnitName(contract.unit) }}</p>
                      </div>
                      <span [class]="contract.isRented ? 'text-green-400' : 'text-amber-400'" class="text-sm">
                        {{ contract.isRented ? 'مؤجر' : 'غير مؤجر' }}
                      </span>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>
        
        <!-- Upcoming Alarms -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 class="text-lg font-semibold text-white mb-4">التنبيهات القادمة (30 يوم)</h2>
          @if (upcomingAlarms().length === 0) {
            <p class="text-slate-400 text-center py-8">لا يوجد تنبيهات قادمة</p>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-slate-400 text-sm border-b border-slate-700">
                    <th class="text-right pb-3">العقد</th>
                    <th class="text-right pb-3">النوع</th>
                    <th class="text-right pb-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  @for (alarm of upcomingAlarms(); track alarm.contractId) {
                    <tr class="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td class="py-3 text-white">{{ alarm.tenantName }}</td>
                      <td class="py-3 text-slate-300">{{ alarm.type }}</td>
                      <td class="py-3 text-amber-400">{{ alarm.date | date:'yyyy/MM/dd' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  
  loading = signal(true);
  units = signal<Unit[]>([]);
  contracts = signal<Contract[]>([]);
  
  totalUnits = computed(() => this.units().length);
  
  rentedUnits = computed(() => 
    this.contracts().filter(c => c.isRented).length
  );
  
  availableUnits = computed(() => 
    this.units().length - this.rentedUnits()
  );
  
  totalCollected = computed(() => 
    this.contracts().reduce((sum, c) => sum + (c.totalPaid || 0), 0)
  );
  
  unitTypes = computed(() => {
    const units = this.units();
    const total = units.length;
    const types = [
      { name: 'سكني', key: 'سكني' as const },
      { name: 'طبي', key: 'طبي' as const },
      { name: 'إداري', key: 'إداري' as const }
    ];
    return types.map(t => ({
      name: t.name,
      count: units.filter(u => u.type === t.key).length,
      percentage: total > 0 ? (units.filter(u => u.type === t.key).length / total) * 100 : 0
    }));
  });
  
  recentContracts = computed(() => 
    this.contracts().slice(0, 5)
  );
  
  upcomingAlarms = computed(() => {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const alarms: { contractId: string; tenantName: string; type: string; date: Date }[] = [];
    
    this.contracts().forEach(contract => {
      // Check alarm date
      if (contract.alarm) {
        const alarmDate = new Date(contract.alarm);
        if (alarmDate >= now && alarmDate <= thirtyDays) {
          alarms.push({
            contractId: contract._id,
            tenantName: contract.tenantName,
            type: 'تنبيه',
            date: alarmDate
          });
        }
      }
      
      // Check obligations
      contract.obligations?.forEach(ob => {
        if (ob.dueDate) {
          const dueDate = new Date(ob.dueDate);
          if (dueDate >= now && dueDate <= thirtyDays) {
            alarms.push({
              contractId: contract._id,
              tenantName: contract.tenantName,
              type: 'الزام: ' + ob.description,
              date: dueDate
            });
          }
        }
      });
    });
    
    return alarms.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 10);
  });
  
  constructor() {
    this.loadData();
  }
  
  private async loadData() {
    this.notify.loading('جاري تحميل البيانات...');
    try {
      const [unitsResponse, contractsResponse] = await Promise.all([
        this.api.getUnits().toPromise(),
        this.api.getContracts().toPromise()
      ]);
      this.units.set(unitsResponse?.units || []);
      this.contracts.set(contractsResponse?.contracts || []);
    } catch (error) {
      console.error('Error loading data:', error);
      this.notify.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      this.notify.close();
      this.loading.set(false);
    }
  }
  
  getUnitName(unit: Unit | string): string {
    return typeof unit === 'string' ? 'وحدة' : unit.name;
  }
}

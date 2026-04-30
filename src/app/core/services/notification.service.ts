import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  success(title: string = 'تمت العملية بنجاح') {
    return Swal.fire({
      icon: 'success',
      title,
      confirmButtonText: 'حسناً',
      confirmButtonColor: '#f59e0b'
    });
  }

  error(title: string = 'حدث خطأ') {
    return Swal.fire({
      icon: 'error',
      title,
      confirmButtonText: 'حسناً',
      confirmButtonColor: '#f59e0b'
    });
  }

  warning(title: string) {
    return Swal.fire({
      icon: 'warning',
      title,
      confirmButtonText: 'حسناً',
      confirmButtonColor: '#f59e0b'
    });
  }

  confirm(title: string, text: string = '') {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'نعم',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    });
  }

  loading(title: string = 'جاري التحميل...') {
    return Swal.fire({
      title,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  close() {
    Swal.close();
  }
}

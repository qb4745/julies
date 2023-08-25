import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, catchError, from, map, of, take } from 'rxjs';
import { ProductsConsumedDoc } from 'src/app/model/productsConsumed';
import { DbService } from '../db/db.service';
import { TableDoc } from 'src/app/model/table';

@Injectable({
  providedIn: 'root'
})
export class ProductsConsumedService {
  prodConsumedSubject: BehaviorSubject<Array<ProductsConsumedDoc>> = new BehaviorSubject(new Array<ProductsConsumedDoc>());
  subscriptions: Array<Subscription> = [];

  constructor(private dbService: DbService) {
    this.initChangeHandler();
  }

  initChangeHandler() {
    let sub = this.dbService.getCurrentConsumedProductChanges()
      .subscribe((changedDoc: ProductsConsumedDoc) => {
        if (changedDoc) {
          console.warn('handleChange called from TableService');
          this.dbService.handleChange(this.prodConsumedSubject, changedDoc, () => {
          this.fetchProductsConsumed();
          });


        }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  fetchProductsConsumed() {
    console.error('fetchProductsConsumed called');
    let query = {
      selector: {
        type: 'products-consumed',
      },
      fields: ['_id', '_rev', 'type', 'table', 'products'],
      execution_stats: true,
      limit: 1,
    };

    // Use catchError and finalize instead of throwError and subscribe
    let q: Observable<any> = from(this.dbService.db.find(query)).pipe(
      map((obj: any) => obj["docs"]),
      catchError((error: any) => {
        console.error('Error fetching tables:', error);
        return of([]); // Provide a default value or empty array
      }),
      take(1)
    );

    // Subscribe to the observable
    q.subscribe((TableDoc) => {
      this.prodConsumedSubject.next(TableDoc);
    });
  }

  getProductsConsumed() {
    return this.prodConsumedSubject.asObservable();
  }
}
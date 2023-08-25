import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, catchError, from, map, of, take } from 'rxjs';
import { DbService } from '../db/db.service';
import { ProductsDoc } from 'src/app/model/products';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  prodSubject: BehaviorSubject<Array<ProductsDoc>> = new BehaviorSubject(new Array<ProductsDoc>());
  subscriptions: Array<Subscription> = [];

  constructor(private dbService: DbService) {
    this.initChangeHandler();
    this.fetchProducts();

  }

  initChangeHandler() {
    let sub = this.dbService.getAllProductChanges()
      .subscribe((changedDoc: ProductsDoc) => {
        if (changedDoc) {
          console.warn('handleChange called from ProductService');
          this.dbService.handleChange(this.prodSubject, changedDoc, () => {
          this.fetchProducts();
          });


        }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  fetchProducts() {
    console.error('fetchProducts called');
    let query = {
      selector: {
        type: 'products',
      },
      fields: ['_id', '_rev', 'type', 'products'],
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
    q.subscribe((ProductsDoc) => {
      this.prodSubject.next(ProductsDoc);
    });
  }

  getAllProducts() {
    return this.prodSubject.asObservable();
  }
}
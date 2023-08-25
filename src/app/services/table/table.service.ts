import { Injectable } from '@angular/core';
import { DbService } from '../db/db.service';
import { Observable, from, throwError, of, Subscription, BehaviorSubject } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { TableDoc } from 'src/app/model/table';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  tableSubject: BehaviorSubject<Array<TableDoc>> = new BehaviorSubject(new Array<TableDoc>());
  subscriptions: Array<Subscription> = [];

  constructor(private dbService: DbService) {
    this.initChangeHandler();
  }

  initChangeHandler() {
    let sub = this.dbService.getCurrentTableChanges()
      .subscribe((changedDoc: TableDoc) => {
        if (changedDoc) {
          console.warn('handleChange called from TableService');
          this.dbService.handleChange(this.tableSubject, changedDoc, () => {
          this.fetchTables();
          });


        }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  fetchTables() {
    console.error('fetchTables called');
    let query = {
      selector: {
        type: 'table',
      },
      fields: ['_id', '_rev', 'table', 'type'],
      execution_stats: true,
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
    q.subscribe((tableDocs) => {
      this.tableSubject.next(tableDocs);
    });
  }

  getCurrentTables() {
    return this.tableSubject.asObservable();
  }
}


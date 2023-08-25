import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsConsumedDoc } from 'src/app/model/productsConsumed';
import { ProductsConsumedService } from 'src/app/services/products-consumed/products-consumed.service';

@Component({
  selector: 'app-table-details',
  templateUrl: './table-details.page.html',
  styleUrls: ['./table-details.page.scss'],
})
export class TableDetailsPage implements OnInit {
  tableId: string = '';
  prodConsumed: ProductsConsumedDoc = new ProductsConsumedDoc();

  constructor(
    private prodConsumedService: ProductsConsumedService,
    private activatedRoute: ActivatedRoute
    ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.prodConsumedService.getProductsConsumed().subscribe((prodConsumed: Array<ProductsConsumedDoc>) => {
      this.prodConsumed = prodConsumed[0];
    });
    this.prodConsumedService.fetchProductsConsumed();
  }

  ionViewWillEnter() {
    this.tableId = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }


}

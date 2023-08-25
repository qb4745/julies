import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product, ProductsDoc } from 'src/app/model/products';
import { ConsumedProduct, ProductsConsumedDoc } from 'src/app/model/productsConsumed';
import { ProductsConsumedService } from 'src/app/services/products-consumed/products-consumed.service';
import { ProductsService } from 'src/app/services/products/products.service';

@Component({
  selector: 'app-table-details',
  templateUrl: './table-details.page.html',
  styleUrls: ['./table-details.page.scss'],
})
export class TableDetailsPage implements OnInit {
  tableId: string = '';
  prodConsumed: ProductsConsumedDoc = new ProductsConsumedDoc();
  visibleProducts: Array<Product> = [];
  products: Array<Product> = [];

  subscriptions: Array<Subscription> = [];
  productCategories: Array<String> = [];

  editted: boolean = false;

  constructor(
    private prodConsumedService: ProductsConsumedService,
    private productsService: ProductsService,
    private activatedRoute: ActivatedRoute
    ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {

  }

  ionViewWillEnter() {
    this.tableId = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.prodConsumedService.setTableId(this.tableId);

    this.productsService.fetchProducts();
    this.prodConsumedService.fetchProductsConsumed(this.tableId);
    this.initSubscriptions();

  }

  initSubscriptions() {
    let prodConsumedSub = this.prodConsumedService
      .getProductsConsumed()
      .subscribe((prodConsumed: Array<ProductsConsumedDoc>) => {
      this.prodConsumed = prodConsumed[0];
    });
    this.subscriptions.push(prodConsumedSub);

    let prodSub = this.productsService
      .getAllProducts()
      .subscribe((productsDoc: Array<ProductsDoc>) => {
      if (
        productsDoc === undefined ||
        productsDoc.length <= 0 ||
        productsDoc[0]?.products === undefined
        )
         return;
      let products = productsDoc[0];
      this.products = products?.products;
      this.visibleProducts = products.products;

      this.productCategories = ["All", ...new Set(this.products.map((o) => o.category))] as String[];
    });
    this.subscriptions.push(prodConsumedSub, prodSub);
  }

  filterVisibleProducts(category: String) {
    this.visibleProducts = this.products;
    this.visibleProducts = this.visibleProducts.filter((p) => {
      return category === "All" ? true : p.category === category;
    });
  }

  addProductToConsumed(product: Product) {
    this.editted = true;
    // TODO: check stock > 0 and disable product button if stock === 0
    delete product["stock"];

    let found = this.prodConsumed.products.some((p) => {
      return p.product === product.product
    });

    if (found) {
      // increase by 1
      this.prodConsumed.products.forEach((p) => {
        if (p.product === product.product) {
          p.amount += 1;
        }
      });
    } else {
      // add new product to productsConsumed
      let consumedProduct = new ConsumedProduct();
      consumedProduct.product = product.product;
      consumedProduct.category = product.category;
      consumedProduct.ppp = product.ppp;
      consumedProduct.amount = 1;
      this.prodConsumed.products.push(consumedProduct);
    }
  }

  toggleEdit() {
    this.editted = !this.editted;
  }

  saveEdit(){
    if (this.prodConsumed === undefined) return;
    // update in pouchdb
    this.prodConsumedService.updateProductsConsumed(this.prodConsumed);
    this.editted = false;
  }
}

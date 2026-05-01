import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { Params } from '../../../shared/interface/core.interface';
import { Breadcrumb } from '../../../shared/interface/breadcrumb';
import { ProductModel } from '../../../shared/interface/product.interface';
import { GetProducts } from '../../../shared/action/product.action';
import { ProductState } from '../../../shared/state/product.state';
import { ThemeOptionState } from '../../../shared/state/theme-option.state';
import { Option } from '../../../shared/interface/theme-option.interface';
 
@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent {

  @Select(ProductState.product) product$: Observable<ProductModel>;
  @Select(ThemeOptionState.themeOptions) themeOptions$: Observable<Option>;

  public breadcrumb: Breadcrumb = {
    title: "Collections",
    items: [{ label: 'Collections', active: false }]
  };
  public layout: string = 'collection_category_slider';
  public skeleton: boolean = true;

  public filter: Params = {
    'page': 1, // Current page number
    'paginate': 40, // Display per page,
    'status': 1,
    'field': 'created_at',
    'price': '',
    'category': '',
    'tag': '',
    'sort': 'asc', // ASC, DSC
    'sortBy': 'asc',
    'rating': '',
    'size': '',
    'attribute': ''
  };

  public totalItems: number = 0;

  constructor(private route: ActivatedRoute,
    private store: Store) {

    // Combine path params and query params
    combineLatest([this.route.params, this.route.queryParams]).subscribe(([params, queryParams]) => {
      this.filter = {
        'page': queryParams['page'] ? queryParams['page'] : 1,
        'paginate': 40,
        'status': 1,
        'price': queryParams['price'] ? queryParams['price'] : '',
        'brand': queryParams['brand'] ? queryParams['brand'] : '',
        'category': (params['category'] && params['category'] !== 'all') ? params['category'] : (queryParams['category'] ? queryParams['category'] : ''),
        'tag': queryParams['tag'] ? queryParams['tag'] : '',
        'field': queryParams['field'] ? queryParams['field'] : this.filter['field'],
        'sortBy': queryParams['sortBy'] ? queryParams['sortBy'] : this.filter['sortBy'],
        'rating': queryParams['rating'] ? queryParams['rating'] : '',
        'size': queryParams['size'] ? queryParams['size'] : '',
        'attribute': queryParams['attribute'] ? queryParams['attribute'] : '',
      }

      this.store.dispatch(new GetProducts(this.filter));

      // Params For Demo Purpose only
      if(queryParams['layout']) {
        this.layout = queryParams['layout'];
      } else {
        // Get Collection Layout
        this.themeOptions$.subscribe(option => {
          this.layout = option?.collection && option?.collection?.collection_layout
            ? option?.collection?.collection_layout : 'collection_category_slider';
        });
      }

      this.filter['layout'] = this.layout;
    });
    this.product$.subscribe(product => this.totalItems = product?.total);
  }

}

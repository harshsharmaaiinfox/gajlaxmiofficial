import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Product, ProductModel } from '../../../../shared/interface/product.interface';
import { ProductState } from '../../../../shared/state/product.state';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-image-link',
  templateUrl: './image-link.component.html',
  styleUrls: ['./image-link.component.scss']
})
export class ImageLinkComponent {

  @Select(ProductState.product) product$: Observable<ProductModel>;

  @Input() image: any;
  @Input() link: string;
  @Input() bgImage: boolean;
  @Input() class: string;
  @Input() lazy: boolean = true;
  @Input() fetchpriority: 'high' | 'low' | 'auto' = 'auto';


  public storageURL = environment.storageURL;

  constructor(private router: Router) { }

  cleanLink(link: string): string {
    if (!link) return '/';
    
    // Convert to relative if it's the same domain
    if (link.includes('gajlaxmifashion.in')) {
      link = link.split('gajlaxmifashion.in')[1];
    }

    // Standardize collection URLs as requested by user
    if (link.includes('collections?category=') || link.includes('collections?sortBy=')) {
      return '/collections';
    }

    return link;
  }

  isExternal(link: string): boolean {
    if (!link) return false;
    return link.includes('http') && !link.includes('gajlaxmifashion.in');
  }

  getProductSlug(id: number, products: Product[]) {
    let product = products.find(product => product.id === id);
    return product ? product.slug : null;
  }



}

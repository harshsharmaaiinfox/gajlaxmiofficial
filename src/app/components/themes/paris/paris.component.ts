import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, forkJoin } from 'rxjs';
import { GetBlogs } from '../../../shared/action/blog.action';
import { GetBrands } from '../../../shared/action/brand.action';
import { GetProductByIds } from '../../../shared/action/product.action';
import { GetStores } from '../../../shared/action/store.action';
import * as data from '../../../shared/data/owl-carousel';
import { Option } from '../../../shared/interface/theme-option.interface';
import { Paris } from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { ThemeOptionState } from '../../../shared/state/theme-option.state';

@Component({
  selector: 'app-paris',
  templateUrl: './paris.component.html',
  styleUrls: ['./paris.component.scss']
})
export class ParisComponent implements OnInit, OnDestroy {

  @Input() data?: Paris;
  @Input() slug?: string;
 
  @Select(ThemeOptionState.themeOptions) themeOption$: Observable<Option>;

  public categorySlider = data.categorySlider;
  public productSlider = data.productSlider;

  // Banner slider properties
  public currentSlide = 0;
  public autoSlideInterval: any;
  public isPaused = false;
  public bannerImages = [
    {
      src: 'assets/images/gajlaxmi_banner.jpg',
      alt: 'Gaj promotional banner'
    },
    {
      src: 'assets/images/gajlaxmi_banner_2.jpg',
      alt: 'sale banner'
    }
  ];

  constructor(private store: Store,
  private themeOptionService: ThemeOptionService,
  private route: ActivatedRoute) {
  }

  ngOnInit() {
    // Start auto-slide
    this.startAutoSlide();

    if(this.data?.slug == this.slug) {
      const getProducts$ = this.store.dispatch(new GetProductByIds({
        status: 1,
        paginate: this.data?.content?.products_ids.length,
        ids: this.data?.content?.products_ids?.join(',')
      }));
      const getBrand$ = this.store.dispatch(new GetBrands({ 
        status: 1,
        ids: this.data?.content?.brands?.brand_ids?.join()
      }));
      const getStore$ = this.store.dispatch(new GetStores({ 
        status: 1,
        ids: this.data?.content?.main_content?.seller?.store_ids?.join()
      }));
      const getBlogs$ = this.store.dispatch(new GetBlogs({
        status: 1,
        ids: this.data?.content.main_content?.section9_featured_blogs?.blog_ids?.join(',')
      }));

      // Skeleton Loader
      document.body.classList.add('skeleton-body');

      forkJoin([getProducts$, getBlogs$, getBrand$, getStore$]).subscribe({
        complete: () => {
          document.body.classList.remove('skeleton-body');
          this.themeOptionService.preloader = false;
        }
      });
    }
    this.route.queryParams.subscribe(params => {
      if(this.route.snapshot.data['data'].theme_option.productBox === 'digital'){
        if (this.productSlider && this.productSlider.responsive && this.productSlider.responsive['1000']) {
          this.productSlider = {...this.productSlider, items: 3, responsive :{
            ...this.productSlider.responsive,
            1000: {
              items: 3
            }
          }}
        }
      } else {
        if (this.productSlider && this.productSlider.responsive && this.productSlider.responsive['1000']) {
          this.productSlider = {...this.productSlider, items: 5, responsive :{
            ...this.productSlider.responsive,
            1000: {
              items: 5
            }
          }}
        }
      }
    })
  }

  ngOnDestroy() {
    // Clear auto-slide interval when component is destroyed
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  // Banner slider methods
  startAutoSlide() {
    if (!this.isPaused) {
      this.autoSlideInterval = setInterval(() => {
        if (!this.isPaused) {
          this.nextSlide();
        }
      }, 5000); // Auto-slide every 5 seconds
    }
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.bannerImages.length;
  }

  previousSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.bannerImages.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    // Restart auto-slide when user manually navigates
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  pauseAutoSlide() {
    this.isPaused = true;
    this.stopAutoSlide();
  }

  resumeAutoSlide() {
    this.isPaused = false;
    this.startAutoSlide();
  }

  goToCollections() {
    // Navigate to collections page
    window.location.href = '/collections?sortBy=asc';
  }

}

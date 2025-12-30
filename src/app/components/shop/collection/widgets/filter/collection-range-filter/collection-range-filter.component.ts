import { Component, Input, OnChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, NavigationStart, Scroll } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { Location } from '@angular/common';
import { Params } from '../../../../../../shared/interface/core.interface';
import { Subscription, filter, take } from 'rxjs';

@Component({
  selector: 'app-collection-range-filter',
  templateUrl: './collection-range-filter.component.html',
  styleUrls: ['./collection-range-filter.component.scss']
})
export class CollectionRangeFilterComponent implements OnChanges, AfterViewInit, OnDestroy {

  @Input() filter: Params;

  public minPrice: number = 0;
  public maxPrice: number = 15000;
  public selectedMinPrice: number = 0;
  public selectedMaxPrice: number = 15000;

  private routerSubscription?: Subscription;
  private scrollRestorationTimeouts: number[] = [];
  private savedScrollPosition: [number, number] | null = null;
  private isFilterNavigation = false;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private viewportScroller: ViewportScroller) {
    this.setupRouterSubscriptions();
  }

  private setupRouterSubscriptions() {
    // Listen to NavigationEnd events to catch any scroll restoration
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd || event instanceof Scroll))
      .subscribe(event => {
        if (this.isFilterNavigation && this.savedScrollPosition) {
          if (event instanceof NavigationEnd || event instanceof Scroll) {
            // Additional restoration attempt after navigation completes
            setTimeout(() => {
              if (this.savedScrollPosition) {
                this.forceScrollRestoration(this.savedScrollPosition[0], this.savedScrollPosition[1]);
              }
            }, 0);
          }
        }
      });
  }

  private restoreScrollPosition() {
    if (!this.savedScrollPosition) return;

    // Clear any existing restoration timeouts
    this.clearScrollRestorationTimeouts();

    // Multiple restoration attempts with different timings
    const restorationAttempts = [
      () => this.viewportScroller.scrollToPosition(this.savedScrollPosition!),
      () => setTimeout(() => this.viewportScroller.scrollToPosition(this.savedScrollPosition!), 0),
      () => setTimeout(() => this.viewportScroller.scrollToPosition(this.savedScrollPosition!), 10),
      () => setTimeout(() => this.viewportScroller.scrollToPosition(this.savedScrollPosition!), 50),
      () => setTimeout(() => requestAnimationFrame(() => this.viewportScroller.scrollToPosition(this.savedScrollPosition!)), 0),
    ];

    restorationAttempts.forEach((attempt, index) => {
      const timeoutId = window.setTimeout(attempt, index * 100);
      this.scrollRestorationTimeouts.push(timeoutId);
    });

    // Clear saved position after restoration attempts
    setTimeout(() => {
      this.savedScrollPosition = null;
    }, 500);
  }

  private clearScrollRestorationTimeouts() {
    this.scrollRestorationTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.scrollRestorationTimeouts = [];
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
    this.clearScrollRestorationTimeouts();
  }

  ngAfterViewInit() {
    // Initialize slider track after view is ready
    setTimeout(() => {
      this.updateSliderTrack();
    }, 0);
  }

  ngOnChanges() {
    // Parse existing price filter if available
    if (this.filter['price']) {
      const priceRanges = this.filter['price'].split(',');
      // Find the range that matches our format (min-max)
      for (const range of priceRanges) {
        if (range.includes('-') && !range.startsWith('-')) {
          const [min, max] = range.split('-').map(Number);
          if (!isNaN(min) && !isNaN(max)) {
            this.selectedMinPrice = min;
            this.selectedMaxPrice = max;
            break;
          }
        }
      }
    } else {
      // Reset to defaults if no filter
      this.selectedMinPrice = this.minPrice;
      this.selectedMaxPrice = this.maxPrice;
    }
    this.updateSliderTrack();
  }

  onMinPriceChange(value: number | Event) {
    let numValue: number;
    
    if (typeof value === 'number') {
      numValue = value;
    } else {
      numValue = Number((<HTMLInputElement>value?.target)?.value);
    }
    
    // Ensure value is within bounds
    if (isNaN(numValue) || numValue < this.minPrice) numValue = this.minPrice;
    if (numValue > this.maxPrice) numValue = this.maxPrice;
    
    // Ensure min doesn't exceed max
    if (numValue > this.selectedMaxPrice) {
      numValue = this.selectedMaxPrice;
    }
    
    this.selectedMinPrice = numValue;
    this.updateSliderTrack();
    this.applyFilter();
  }

  onMaxPriceChange(value: number | Event) {
    let numValue: number;
    
    if (typeof value === 'number') {
      numValue = value;
    } else {
      numValue = Number((<HTMLInputElement>value?.target)?.value);
    }
    
    // Ensure value is within bounds
    if (isNaN(numValue) || numValue < this.minPrice) numValue = this.minPrice;
    if (numValue > this.maxPrice) numValue = this.maxPrice;
    
    // Ensure max is not less than min
    if (numValue < this.selectedMinPrice) {
      numValue = this.selectedMinPrice;
    }
    
    this.selectedMaxPrice = numValue;
    this.updateSliderTrack();
    this.applyFilter();
  }

  onMinRangeChange(event: Event) {
    const value = Number((<HTMLInputElement>event?.target)?.value);
    if (value <= this.selectedMaxPrice) {
      this.selectedMinPrice = value;
      this.updateSliderTrack();
      this.applyFilter();
    } else {
      // If min exceeds max, set min to max
      this.selectedMinPrice = this.selectedMaxPrice;
      this.updateSliderTrack();
      this.applyFilter();
    }
  }

  onMaxRangeChange(event: Event) {
    const value = Number((<HTMLInputElement>event?.target)?.value);
    if (value >= this.selectedMinPrice) {
      this.selectedMaxPrice = value;
      this.updateSliderTrack();
      this.applyFilter();
    } else {
      // If max is less than min, set max to min
      this.selectedMaxPrice = this.selectedMinPrice;
      this.updateSliderTrack();
      this.applyFilter();
    }
  }

  updateSliderTrack() {
    // Calculate percentages for the slider track
    const minPercent = ((this.selectedMinPrice - this.minPrice) / (this.maxPrice - this.minPrice)) * 100;
    const maxPercent = ((this.selectedMaxPrice - this.minPrice) / (this.maxPrice - this.minPrice)) * 100;

    // Update the track background with dark grey for active range
    const trackElement = document.querySelector('.dual-range-slider .slider-track') as HTMLElement;
    if (trackElement) {
      trackElement.style.background = `linear-gradient(to right,
        #d3d3d3 0%,
        #d3d3d3 ${minPercent}%,
        #333 ${minPercent}%,
        #333 ${maxPercent}%,
        #d3d3d3 ${maxPercent}%,
        #d3d3d3 100%)`;
    }
  }

  applyFilter() {
    // Format: min-max (e.g., "100-500")
    const priceValue = `${this.selectedMinPrice}-${this.selectedMaxPrice}`;

    // Save current scroll position using multiple methods for compatibility
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const scrollX = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || 0;
    this.savedScrollPosition = [scrollX, scrollY];
    this.isFilterNavigation = true;

    // Temporarily disable scroll restoration if available
    if (this.viewportScroller.setHistoryScrollRestoration) {
      this.viewportScroller.setHistoryScrollRestoration('manual');
    }

    // Clear any existing restoration timeouts
    this.clearScrollRestorationTimeouts();

    // Get current query params
    const currentParams = { ...this.route.snapshot.queryParams };
    
    // Update price parameter
    if (this.selectedMinPrice !== this.minPrice || this.selectedMaxPrice !== this.maxPrice) {
      currentParams['price'] = priceValue;
    } else {
      delete currentParams['price'];
    }
    
    // Always reset to page 1 when filtering
    currentParams['page'] = '1';

    // Navigate with query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: currentParams,
      queryParamsHandling: 'merge',
      skipLocationChange: false
    }).then(() => {
      // Force scroll restoration immediately and multiple times
      this.forceScrollRestoration(scrollX, scrollY);
      
      // Re-enable scroll restoration after a delay
      setTimeout(() => {
        if (this.viewportScroller.setHistoryScrollRestoration) {
          this.viewportScroller.setHistoryScrollRestoration('auto');
        }
        this.isFilterNavigation = false;
      }, 100);
    }).catch(() => {
      if (this.viewportScroller.setHistoryScrollRestoration) {
        this.viewportScroller.setHistoryScrollRestoration('auto');
      }
      this.isFilterNavigation = false;
    });
  }

  private forceScrollRestoration(x: number, y: number) {
    // Multiple restoration attempts with different methods and timings
    const restore = () => {
      window.scrollTo(x, y);
      this.viewportScroller.scrollToPosition([x, y]);
    };

    // Immediate restoration
    restore();

    // Multiple delayed attempts
    const delays = [0, 10, 50, 100, 200, 300];
    delays.forEach(delay => {
      setTimeout(() => {
        restore();
        requestAnimationFrame(() => restore());
      }, delay);
    });

    // Additional attempts using requestAnimationFrame
    requestAnimationFrame(() => {
      restore();
      requestAnimationFrame(() => {
        restore();
        setTimeout(() => restore(), 0);
      });
    });
  }

  resetFilter() {
    this.selectedMinPrice = this.minPrice;
    this.selectedMaxPrice = this.maxPrice;
    this.updateSliderTrack();
    this.applyFilter();
  }

}


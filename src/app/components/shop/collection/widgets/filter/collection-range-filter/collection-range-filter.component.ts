import { Component, Input, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '../../../../../../shared/interface/core.interface';

@Component({
  selector: 'app-collection-range-filter',
  templateUrl: './collection-range-filter.component.html',
  styleUrls: ['./collection-range-filter.component.scss']
})
export class CollectionRangeFilterComponent implements OnChanges {

  @Input() filter: Params;

  public minPrice: number = 0;
  public maxPrice: number = 8000;
  public selectedMinPrice: number = 0;
  public selectedMaxPrice: number = 8000;

  constructor(private route: ActivatedRoute,
    private router: Router) {
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
    this.applyFilter();
  }

  onMinRangeChange(event: Event) {
    const value = Number((<HTMLInputElement>event?.target)?.value);
    if (value <= this.selectedMaxPrice) {
      this.selectedMinPrice = value;
      this.applyFilter();
    } else {
      // If min exceeds max, set min to max
      this.selectedMinPrice = this.selectedMaxPrice;
      this.applyFilter();
    }
  }

  onMaxRangeChange(event: Event) {
    const value = Number((<HTMLInputElement>event?.target)?.value);
    if (value >= this.selectedMinPrice) {
      this.selectedMaxPrice = value;
      this.applyFilter();
    } else {
      // If max is less than min, set max to min
      this.selectedMaxPrice = this.selectedMinPrice;
      this.applyFilter();
    }
  }

  applyFilter() {
    // Format: min-max (e.g., "100-500")
    const priceValue = `${this.selectedMinPrice}-${this.selectedMaxPrice}`;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        price: (this.selectedMinPrice !== this.minPrice || this.selectedMaxPrice !== this.maxPrice) 
          ? priceValue 
          : null,
        page: 1
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }

  resetFilter() {
    this.selectedMinPrice = this.minPrice;
    this.selectedMaxPrice = this.maxPrice;
    this.applyFilter();
  }

}


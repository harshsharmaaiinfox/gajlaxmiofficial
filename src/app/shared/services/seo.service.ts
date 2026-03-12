import { Injectable, NgZone, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Select } from '@ngxs/store';
import { Observable, filter } from 'rxjs';
import { ThemeOptionState } from '../state/theme-option.state';
import { Meta, Title } from '@angular/platform-browser';
import { ProductState } from '../state/product.state';
import { NavigationEnd, Router } from '@angular/router';
import { BlogState } from '../state/blog.state';
import { BrandState } from '../state/brand.state';
import { PageState } from '../state/page.state';
import { CategoryState } from '../state/category.state';
import { SettingState } from '../state/setting.state';
import { Blog } from '../interface/blog.interface';
import { Option } from '../interface/theme-option.interface';
import { Product } from '../interface/product.interface';
import { Brand } from '../interface/brand.interface';
import { Page } from '../interface/page.interface';
import { Category } from '../interface/category.interface';
import { Values } from '../interface/setting.interface';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  @Select(ThemeOptionState.themeOptions) themeOption$: Observable<Option>;
  @Select(SettingState.setting) setting$: Observable<Values>;
  @Select(ProductState.selectedProduct) product$: Observable<Product>;
  @Select(BlogState.selectedBlog) blog$: Observable<Blog>;
  @Select(BrandState.selectedBrand) brand$: Observable<Brand>;
  @Select(PageState.selectedPage) page$: Observable<Page>;
  @Select(CategoryState.selectedCategory) category$: Observable<Category>;

  // Default meta values
  private readonly DEFAULT_TITLE = "Buy Sarees Online India - Trendy Women's & Men's Clothing | GajLaxmi";
  private readonly DEFAULT_DESCRIPTION = "Shop trendy women's clothing online at GajLaxmi. Buy sarees online India, kurta suit sets, and ethnic wear. Affordable fashion including dresses, tops, and men's wear.";
  private readonly DEFAULT_KEYWORDS = "Buy sarees online India, Women clothing online India, Women ethnic wear online, Affordable fashion online India, Latest fashion for women online, Men clothing online India, Indian ethnic wear for women, Online clothing store India, Kurta suit set for women, Floral printed suit set, Cotton suit set for women, Chanderi lehenga set, Women sleeveless tops online, Stylish tops for women, Women ethnic suit online, Festival wear lehenga set, Silk sarees online India, Designer sarees for women, Traditional sarees online, Party wear sarees India, Men t shirts online India, Men gym jogger pants, Men workout shorts, Casual t shirts for men, Men gym clothing India, Athletic jogger pants for men, Affordable ethnic wear for women online, Buy kurta suit set online India, Stylish women tops under 1000, Best online clothing store for women India, Latest ethnic wear collection online, Buy gym clothing for men online India";

  public path: string;
  public timeoutId: any;
  private currentMessageIndex = 0;
  private messages: string[];
  private currentMessage: string;
  private delay = 1000; // Delay between messages in milliseconds
  public isTabInFocus = true;
  public product: Product;
  public blog: Blog;
  public page: Page;
  public brand: Brand;
  public category: Category;
  public themeOption: Option;
  public scoContent: any = {};
  public setting: Values;
  constructor(private meta: Meta, private router: Router,
    private titleService: Title,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private document: Document) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.path = event.url
      this.updateSeo(this.path)
    });

    this.fetchData();
  }

  private updateCanonicalTag(url: string) {
    // Remove query parameters
    const urlObj = new URL(url, 'https://gajlaxmifashion.in');
    const path = urlObj.pathname;
    const cleanUrl = `https://gajlaxmifashion.in${path}`;

    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', cleanUrl);
  }

  fetchData() {
    this.setting$.subscribe(val => this.setting = val);
    this.product$.subscribe(product => this.product = product);
    this.blog$.subscribe(blog => this.blog = blog);
    this.page$.subscribe(page => this.page = page);
    this.brand$.subscribe(brand => this.brand = brand);
    this.category$.subscribe(blog => this.category = blog);
    this.themeOption$.subscribe(option => {
      this.themeOption = option
    })
  }

  updateSeo(path: string) {
    if (path.includes('product')) {
      if (this.product) {
        this.scoContent = {
          'url': window.location.href,
          'og_title': this.product.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.product.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.product.product_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        };
        this.updateCanonicalTag(window.location.href);
      }
      this.customSCO();
    }
    else if (path.includes('blog')) {
      if (this.blog) {
        this.scoContent = {
          ...this.scoContent,
          'url': window.location.href,
          'og_title': this.blog?.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.blog?.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.blog?.blog_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        }
        this.customSCO();
      }
    }
    else if (path.includes('page')) {
      if (this.page) {
        this.scoContent = {
          ...this.scoContent,
          'url': window.location.href,
          'og_title': this.page?.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.page?.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.page?.page_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        }
      }
      this.customSCO();
    } else if (path.includes('brand')) {
      if (this.brand) {
        this.scoContent = {
          ...this.scoContent,
          'url': window.location.href,
          'og_title': this.brand?.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.brand?.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.brand?.brand_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        }
      }
      this.customSCO();
    } else if (path.includes('category')) {
      if (this.category) {
        this.scoContent = {
          ...this.scoContent,
          'url': window.location.href,
          'og_title': this.category?.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.category?.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.category?.category_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        }
      }
      this.customSCO();
    }
    else {
      this.updateDefaultSeo();
    }
  }

  updateDefaultSeo() {
    this.updateCanonicalTag(window.location.href);

    this.meta.updateTag({ name: 'title', content: this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE });
    this.meta.updateTag({ name: 'description', content: this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION });
    this.meta.updateTag({ name: 'keywords', content: this.DEFAULT_KEYWORDS });

    // Update Facebook Meta Tags
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: this.scoContent['url'] });
    this.meta.updateTag({ property: 'og:title', content: this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE });
    this.meta.updateTag({ property: 'og:description', content: this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION });
    this.meta.updateTag({ property: 'og:image', content: this.scoContent['og_image'] });

    // Update Twitter Meta Tags
    this.meta.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ property: 'twitter:url', content: this.scoContent['url'] });
    this.meta.updateTag({ property: 'twitter:title', content: this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE });
    this.meta.updateTag({ property: 'twitter:description', content: this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION });
    this.meta.updateTag({ property: 'twitter:image', content: this.scoContent['og_image'] });

    if (this.themeOption?.general && this.themeOption?.general?.exit_tagline_enable) {
      document.addEventListener('visibilitychange', () => {
        this.messages = this.themeOption.general.taglines;
        this.ngZone.run(() => {
          this.isTabInFocus = !document.hidden;
          if (this.isTabInFocus) {
            clearTimeout(this.timeoutId);
            return this.titleService.setTitle(this.themeOption?.general?.site_title && this.themeOption?.general?.site_tagline
              ? `${this.themeOption?.general?.site_title} | ${this.themeOption?.general?.site_tagline}` : '')
          } else {
            this.updateMessage();
          }
        });
      });
      this.scoContent = {
        ...this.scoContent,
        'url': window.location.href,
        'og_title': this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
        'og_description': this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
        'og_image': this.themeOption?.seo?.og_image?.original_url,
      }

      this.customSCO()
    } else {
      const siteTitle = this.themeOption?.general?.site_title || "GajLaxmi";
      const siteTagline = this.themeOption?.general?.site_tagline || "Trendy Men's & Women's Clothing Online Store";
      return this.titleService.setTitle(`${siteTitle} | ${siteTagline}`);
    }
  }

  customSCO() {
    this.updateCanonicalTag(this.scoContent['url'] || window.location.href);
    const title = this.scoContent['og_title'] || this.DEFAULT_TITLE;
    const description = this.scoContent['og_description'] || this.DEFAULT_DESCRIPTION;

    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'title', content: title });
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: this.DEFAULT_KEYWORDS });

    // Update Facebook Meta Tags
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: this.scoContent['url'] || window.location.href });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: this.scoContent['og_image'] });

    // Update Twitter Meta Tags
    this.meta.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ property: 'twitter:url', content: this.scoContent['url'] || window.location.href });
    this.meta.updateTag({ property: 'twitter:title', content: title });
    this.meta.updateTag({ property: 'twitter:description', content: description });
    this.meta.updateTag({ property: 'twitter:image', content: this.scoContent['og_image'] });
  }

  updateMessage() {
    // Clear the previous timeout
    clearTimeout(this.timeoutId);

    // Update the current message
    this.currentMessage = this.messages[this.currentMessageIndex];
    this.titleService.setTitle(this.currentMessage);
    // Increment the message index or reset it to 0 if it reaches the end
    this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;

    // Set a new timeout to call the function again after the specified delay
    this.timeoutId = setTimeout(() => {
      this.updateMessage();
    }, this.delay);
  }

  ngOnDestroy() {
    // Clear the timeout when the component is destroyed
    clearTimeout(this.timeoutId);
  }

}

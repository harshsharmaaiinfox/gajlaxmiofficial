import { Routes } from "@angular/router";
import { AuthGuard } from "./../../core/guard/auth.guard";
import { Error404Component } from './../../components/page/error404/error404.component';

export const content: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("../../components/themes/themes.module").then((m) => m.ThemesModule),
    title: 'Gajlaxmi Fashion – Elegant Indian Ethnic Wear Online'
  },
  {
    path: 'privacy-policy',
    loadChildren: () =>
      import('../../privacy-policy/privacy-policy.module').then((m) => m.PrivacyPolicyModule),
    title: 'Privacy Policy – How We Handle Your Data | Gajlaxmi Fashion'
  },
  {
    path: 'return-exchange',
    loadChildren: () =>
      import('../../return-exchange/return-exchange.module').then((m) => m.ReturnExchangeModule),
    title: 'Easy Returns & Exchange – Gajlaxmi Fashion'
  },
  {
    path: 'term-condition',
    loadChildren: () =>
      import('../../term-condition/term-condition.module').then((m) => m.TermConditionModule),
    title: 'Terms & Conditions – Gajlaxmi Fashion'
  },
  {
    path: 'contactus',
    loadChildren: () =>
      import('../../pages/contact-us/contact-us.module').then((m) => m.ContactUsModule),
    title: 'Contact Us – Customer Support | Gajlaxmi Fashion'
  },
  {
    path: 'refund-and-cancellation',
    loadChildren: () =>
      import('../../pages/refund-and-cancellation/refund-and-cancellation.module').then((m) => m.RefundAndCancellationModule),
    title: 'Refund & Cancellation Policy – Shop Securely | Gajlaxmi Fashion'
  },
  {
    path: "shipping-delivery",
    loadChildren: () =>
      import("../../shipping-delevary/shipping-delevary.module").then((m) => m.ShippingDelevaryModule),
    title: 'Shipping & Delivery Info – Gajlaxmi Fashion'
  },
  {
    path: "auth",
    loadChildren: () =>
      import("../../components/auth/auth.module").then((m) => m.AuthModule),
    canActivateChild: [AuthGuard],
    title: 'Login or Register – Gajlaxmi Fashion Account'
  },
  {
    path: "account",
    loadChildren: () =>
      import("../../components/account/account.module").then((m) => m.AccountModule),
    canActivate: [AuthGuard],
    title: 'My Account – Orders & Profile | Gajlaxmi Fashion'
  },
  {
    path: "shop",
    loadChildren: () =>
      import("../../components/shop/shop.module").then((m) => m.ShopModule),
    title: 'Shop Sarees, Lehengas & More – Gajlaxmi Fashion'
  },
  {
    path: "blog",
    loadChildren: () =>
      import("../../components/blog/blog.module").then((m) => m.BlogModule),
    title: 'Gajlaxmi Blog – Fashion Tips & News'
  },
  {
    path: "pages",
    loadChildren: () =>
      import("../../components/page/page.module").then((m) => m.PagesModule),
    title: 'Explore Gajlaxmi – About, Help & More'
  },
  {
    path: '**',
    pathMatch: 'full',
    component: Error404Component,
    title: '404 – Page Not Found | Gajlaxmi Fashion'
  }
];


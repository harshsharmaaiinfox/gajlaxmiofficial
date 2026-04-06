# Guest Checkout Fixes

Summary of changes made to enable guests to view their selected cart items on the checkout page and optionally register from there without losing their cart.

## Files Modified

- `src/app/components/shop/checkout/checkout.component.ts`
- `src/app/components/shop/checkout/checkout.component.html`

---

## 1. Crash on guest checkout load

**Problem:** `JSON.parse(localStorage.getItem('account') || '')` threw `SyntaxError: Unexpected end of JSON input` when the `account` key was missing, breaking component initialization for guests.

**Fix:** Safely parse the value only when it exists.

```ts
const accountData = localStorage.getItem('account');
this.localUserCheck = accountData ? JSON.parse(accountData) : null;
```

---

## 2. Cart wiped when leaving checkout

**Problem:** `ngOnDestroy` dispatched `ClearCart()` unconditionally, so a guest's cart was erased every time they navigated away from `/checkout`. On return, the summary showed "No Items Cart".

**Fix:** Removed the `ClearCart` dispatch from `ngOnDestroy`. Cart should only be cleared after a successful order.

---

## 3. Cart summary empty for guests even when items existed

**Problem:** The right-hand checkout summary only read from `CartState.cartItems` via the async pipe. If the state was stale or temporarily empty, the items flickered and disappeared.

**Fix:**
- Added `guestCartItems: Cart[]` and `guestCartTotal: number` properties.
- New `restoreGuestCartFromStorage()` method called in `ngOnInit`:
  - Subscribes to `cartItem$` and mirrors items into `guestCartItems`.
  - Falls back to reading the persisted `cart` key from `localStorage` (written by `NgxsStoragePlugin`) when the in-memory state is empty.
  - Rebuilds the `products` FormArray so Place Order submits correctly.
- Updated the template to show items if **either** `cartItem$` **or** `guestCartItems` has data:

```html
<ul class="cart-listing" *ngIf="((cartItem$ | async)?.length || guestCartItems?.length)">
    <li *ngFor="let item of ((cartItem$ | async)?.length ? (cartItem$ | async) : guestCartItems)">
```

---

## 4. Totals showed "Not Calculated Yet" for guests

**Problem:** Subtotal, shipping, tax, and total all depended on `checkoutTotal` (the server-side checkout response), which is only fetched once the full form is valid. Guests saw "Not Calculated Yet" placeholders.

**Fix:** Fallback to locally-computed values when `checkoutTotal` is not yet available:

| Field     | Fallback value                        |
| --------- | ------------------------------------- |
| Subtotal  | `guestCartTotal` (sum of `sub_total`) |
| Shipping  | `0`                                   |
| Tax       | `0`                                   |
| Total     | `guestCartTotal`                      |

Once the form is valid and the server responds, `checkoutTotal` takes over with accurate shipping/tax.

---

## 5. In-place Register & Continue

**Requirement:** In the guest Account Details section, show a **Register** button and an **Already have an account? Login** link. Filling the details and clicking Register should create the account, keep the same cart items, and land the user on the logged-in checkout view.

**Changes:**

### Template (`checkout.component.html`)
- Password field is always visible in guest mode (no longer hidden behind the "Create an Account?" checkbox).
- Added a row containing:
  - **Register & Continue** button → calls `registerAndContinue()`.
  - **Already have an account? Login** link → routes to `/auth/login`.

### Component (`checkout.component.ts`)

New imports:
```ts
import { GetCartItems } from '../../../shared/action/cart.action';
import { Register } from '../../../shared/action/auth.action';
import { GetUserDetails } from '../../../shared/action/account.action';
import { CartAddOrUpdate } from '../../../shared/interface/cart.interface';
```

New `registerAndContinue()` method:
1. Validates name, email, phone, and password.
2. Dispatches `Register` with the entered details → backend creates the account and sets the `access_token` in `AuthState`.
3. Sequentially POSTs each `guestCartItems` entry to the real cart endpoint via `cartService.addToCart` so every product is guaranteed on the server under the new account.
4. Dispatches `GetCartItems` and `GetUserDetails` to refresh state.
5. Performs a full reload (`window.location.href = '/checkout'`) so the checkout component rebuilds in logged-in mode, showing address selection, payment options, and the synced cart.

---

## Test Plan

1. Hard-reload the app (Ctrl+Shift+R).
2. While logged out, add one or more products to the cart.
3. Navigate to `/checkout`.
   - The right-hand summary should display the selected items.
   - Subtotal and Total should show the computed amounts immediately.
4. Leave `/checkout` and come back — items should still be present.
5. Fill Name, Email, Phone, and Password in **Account Details**.
6. Click **Register & Continue**.
   - The account is created, cart items sync to the server, and the page reloads.
   - The logged-in checkout view appears with the same cart items and totals.
7. Click **Already have an account? Login** — routes to `/auth/login`.

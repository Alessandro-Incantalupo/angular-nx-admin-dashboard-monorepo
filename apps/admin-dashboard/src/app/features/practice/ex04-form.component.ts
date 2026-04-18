/**
 * ============================================================
 * EXERCISE 04 — Reactive Forms + Accessibility (a11y)
 * ============================================================
 *
 * Build a ProductFormComponent following your sign-in pattern.
 * BONUS: every form field must be accessible — a11y TODOs are
 * marked with 🦮 so you can spot them instantly.
 *
 * A11Y QUICK REFERENCE (keep this open while you work):
 *
 *   <label for="field-id">Label</label>       ← connects label to input
 *   <input id="field-id" aria-required="true"> ← signals required to screen readers
 *   [attr.aria-invalid]="hasError(...) || null" ← null REMOVES the attribute when valid
 *   <span role="alert">Error</span>            ← screen reader announces this immediately
 *   <button type="submit">                     ← always explicit type on buttons
 *   aria-hidden="true"                         ← hides decorative elements from screen readers
 */

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

// ── Custom Validators ─────────────────────────────────────────

/**
 * V1: Validator that rejects prices above `max`.
 * Returns null = valid | { maxPriceExceeded: true } = invalid
 */
export function maxPriceValidator(max: number): ValidatorFn {
  return (_control: AbstractControl): ValidationErrors | null => {
    // TODO V1: return null if valid, { maxPriceExceeded: true } if value > max
    return _control.value > max ? { maxPriceExceeded: true } : null;
  };
}

/**
 * V2: Cross-field group validator.
 * discountedPrice must be LESS THAN price.
 * Returns { discountHigherThanPrice: true } if invalid.
 */
export function discountValidator(): ValidatorFn {
  return (_group: AbstractControl): ValidationErrors | null => {
    // TODO V2: return null if discountedPrice < price, else { discountHigherThanPrice: true }  return (_group: AbstractControl): ValidationErrors | null => {
    const price = _group.get('price')?.value;
    const discountedPrice = _group.get('discountedPrice')?.value;
    if (discountedPrice >= price) return { discountHigherThanPrice: true };
    return null;
  };
}

// ── Component ─────────────────────────────────────────────────

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      TODO T1: bind [formGroup]="form" and (ngSubmit)="onSubmit()"
      🦮 T1-A11Y: add role="form" and aria-label="Add product" to the form
    -->
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <!-- ── Name ──────────────────────────────────────────── -->
      <div>
        <!--
          TODO T2: make the label point to the input below
          🦮 T2-A11Y: the 'for' attribute must match the input's 'id'
        -->
        <label for="name">Product name</label>
        <input
          formControlName="name"
          id="product-name"
          type="text"
          aria-required="true"
          [attr.aria-invalid]="hasError('name', 'required') || null"
        />
        <!-- TODO T4: show error when 'name' has 'required' error and is touched -->
        <!-- 🦮 T4-A11Y: the error span must have role="alert" -->
      </div>

      <!-- ── Price ─────────────────────────────────────────── -->
      <div>
        <!--
          🦮 A11Y: label already wired — notice the for/id match below
        -->
        <label for="product-price">Price (€)</label>
        <input
          id="product-price"
          type="number"
          formControlName="price"
          aria-required="true"
          [attr.aria-invalid]="
            hasError('price', 'required') ||
            hasError('price', 'maxPriceExceeded') ||
            null
          "
        />
        @if (
          form.get('price')?.hasError('required') && form.get('price')?.touched
        ) {
          <span role="alert">Price is required</span>
        }
        <!-- TODO T5: show error when 'price' has 'maxPriceExceeded' error -->
        <!-- 🦮 T5-A11Y: role="alert" on this too -->
      </div>

      <!-- ── Discounted price ───────────────────────────────── -->
      <div>
        <label for="product-discount">Discounted price (€)</label>
        <input
          id="product-discount"
          type="number"
          formControlName="discountedPrice"
          aria-required="true"
        />
        <!--
          TODO T6: show cross-field error from the GROUP (not a single control)
          Hint: form.hasError('discountHigherThanPrice') && form.touched
          🦮 T6-A11Y: use aria-live="polite" instead of role="alert" for cross-field errors
                      (they're less urgent — screen reader reads them after current action)
        -->
      </div>

      <!-- ── Category ──────────────────────────────────────── -->
      <div>
        <label for="product-category">Category</label>
        <select
          id="product-category"
          formControlName="category"
          aria-required="true"
        >
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="food">Food</option>
        </select>
      </div>

      <!--
        TODO T7: submit button
        🦮 T7-A11Y: type="submit" is required (never leave button type implicit)
        🦮 T7-A11Y: if loading, add [disabled]="isLoading()" and aria-busy="true"
      -->
      <button>Add product</button>
    </form>
  `,
})
export class ProductFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly submitted = signal(false);
  readonly isLoading = signal(false); // 🦮 used for aria-busy on the button

  readonly productSubmitted = output<{
    name: string;
    price: number;
    discountedPrice: number;
    category: string;
  }>();

  /**
   * F1: Build the form group:
   *   name:            '' + required
   *   price:           0  + required + maxPriceValidator(10_000)
   *   discountedPrice: 0  + required
   *   category:        'electronics' + required
   *
   * F2: Apply discountValidator() as the GROUP validator
   *   this.fb.group({ ... }, { validators: discountValidator() })
   */
  // TODO F1: add validators to each control (Validators.required, maxPriceValidator(10_000))
  // TODO F2: apply discountValidator() as the GROUP-level validator
  //   this.fb.group({ ... }, { validators: discountValidator() })
  readonly form = this.fb.group({
    name: [''],
    price: [0],
    discountedPrice: [0],
    category: ['electronics'],
  });

  /**
   * F3: hasError — returns true if control has the error AND has been touched.
   * Same pattern as your sign-in.component.ts.
   */
  hasError(_controlName: string, _errorType: string): boolean {
    // TODO F3: return true if the control has the error AND is touched
    return false;
  }

  /**
   * F4: onSubmit:
   *   1. submitted.set(true)
   *   2. if form.invalid → return
   *   3. productSubmitted.emit(form.value)
   *   4. form.reset({ category: 'electronics' })
   *   5. submitted.set(false)
   */
  onSubmit(): void {
    // TODO F4: see JSDoc for the 5-step submit workflow
  }
}

/*
 * ✅ ANSWERS ──────────────────────────────────────────────────
 *
 * V1:
 *   return value > max ? { maxPriceExceeded: true } : null;
 *
 * V2:
 *   if (discountedPrice >= price) return { discountHigherThanPrice: true };
 *   return null;
 *
 * T1: <form [formGroup]="form" (ngSubmit)="onSubmit()" role="form" aria-label="Add product">
 * T2: <label for="product-name">Product name</label>
 * T3: formControlName="name" aria-required="true" [attr.aria-invalid]="hasError('name','required') || null"
 * T4: @if (hasError('name', 'required')) { <span role="alert">Name is required</span> }
 * T5: @if (hasError('price', 'maxPriceExceeded')) { <span role="alert">Price cannot exceed €10,000</span> }
 * T6: @if (form.hasError('discountHigherThanPrice') && form.touched) {
 *       <span aria-live="polite">Discounted price must be lower than the regular price</span>
 *     }
 * T7: <button type="submit" [disabled]="isLoading()" [attr.aria-busy]="isLoading() || null">
 *
 * F1 + F2:
 *   readonly form = this.fb.group(
 *     {
 *       name:            ['', Validators.required],
 *       price:           [0,  [Validators.required, maxPriceValidator(10_000)]],
 *       discountedPrice: [0,  Validators.required],
 *       category:        ['electronics', Validators.required],
 *     },
 *     { validators: discountValidator() }
 *   );
 *
 * F3:
 *   const control = this.form.get(controlName);
 *   return (control?.hasError(errorType) && control.touched) ?? false;
 *
 * F4:
 *   this.submitted.set(true);
 *   if (this.form.invalid) return;
 *   this.productSubmitted.emit(this.form.getRawValue());
 *   this.form.reset({ category: 'electronics' });
 *   this.submitted.set(false);
 *
 * ── A11Y SUMMARY ─────────────────────────────────────────────
 * role="alert"       → urgent errors (field-level validation)
 * aria-live="polite" → non-urgent messages (cross-field, success)
 * aria-required      → tells screen readers the field is required
 * aria-invalid       → tells screen readers the value is wrong
 * aria-busy          → tells screen readers the button is processing
 * for/id pair        → connects label to input (clicking label focuses input)
 * type="submit"      → prevents ambiguous button behavior
 */

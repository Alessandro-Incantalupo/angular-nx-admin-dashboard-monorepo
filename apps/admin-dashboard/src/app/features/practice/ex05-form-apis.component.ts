/**
 * ============================================================
 * EXERCISE 05 — Reactive Forms: The Essential APIs
 * ============================================================
 *
 * These are the form methods you reach for daily.
 * Fill in the TODOs — each section is a standalone snippet.
 *
 * APIs covered:
 *   valueChanges   — Observable of form/control changes
 *   patchValue     — partial update (only fields you pass)
 *   setValue       — full update (ALL fields required)
 *   reset          — clear form back to defaults
 *   statusChanges  — Observable of 'VALID' | 'INVALID' | 'PENDING'
 *   disable/enable — programmatically lock/unlock a control
 *   get()          — access a single control
 *   markAllAsTouched — show all errors at once (on submit)
 */

import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime } from 'rxjs';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  bio: string;
}

@Component({
  selector: 'app-ex05-form-apis',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<div>Exercise 05 — check the class below</div>`,
})
export class Ex05FormApisComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // Signal to track live character count for bio field
  readonly bioCharCount = signal(0);
  readonly formStatus = signal<'VALID' | 'INVALID' | 'PENDING'>('INVALID');

  // ── The form ─────────────────────────────────────────────
  readonly form = this.fb.group({
    id: [''],
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['user' as UserProfile['role']],
    bio: ['', Validators.maxLength(200)],
  });

  ngOnInit() {
    this.setupValueChanges();
    this.loadExistingUser();
  }

  // ─────────────────────────────────────────────────────────
  // TASK 1 — valueChanges: react to a single control changing
  // ─────────────────────────────────────────────────────────
  setupValueChanges() {
    this.form
      .get('bio')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => this.bioCharCount.set(val.length));
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
      .subscribe(val => console.log('Form changed:', val));
    this.form.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val =>
        this.formStatus.set(val as 'VALID' | 'INVALID' | 'PENDING')
      );
    // 1a: Listen to the 'bio' control and update bioCharCount signal
    //     with the length of the new value.
    //     Add takeUntilDestroyed so it auto-cleans up.
    //     Hint: this.form.get('bio')!.valueChanges
    /* TODO 1a */
    // 1b: Listen to the WHOLE form's valueChanges.
    //     Debounce 500ms, then log the entire form value.
    //     Use takeUntilDestroyed.
    /* TODO 1b */
    // 1c: Listen to statusChanges on the whole form.
    //     Update the formStatus signal with 'VALID' | 'INVALID' | 'PENDING'.
    //     Hint: this.form.statusChanges
    /* TODO 1c */
    /*
     * ✅ ANSWERS:
     *
     * 1a:
     * this.form.get('bio')!.valueChanges.pipe(
     *   takeUntilDestroyed(this.destroyRef)
     * ).subscribe(val => this.bioCharCount.set(val.length));
     *
     * 1b:
     * this.form.valueChanges.pipe(
     *   takeUntilDestroyed(this.destroyRef),
     *   debounceTime(500),
     * ).subscribe(val => console.log('Form changed:', val));
     *
     * 1c:
     * this.form.statusChanges.pipe(
     *   takeUntilDestroyed(this.destroyRef)
     * ).subscribe(status => this.formStatus.set(status as any));
     */
  }

  // ─────────────────────────────────────────────────────────
  // TASK 2 — patchValue vs setValue
  // ─────────────────────────────────────────────────────────

  // Simulate loading an existing user from an API response.
  // The API returns a full UserProfile.
  loadExistingUser() {
    const userFromApi: UserProfile = {
      id: 'u-42',
      name: 'Alessandro',
      email: 'a@test.com',
      role: 'admin',
      bio: 'Frontend developer',
    };

    this.form.setValue({
      id: userFromApi.id,
      name: userFromApi.name,
      email: userFromApi.email,
      role: userFromApi.role,
      bio: userFromApi.bio,
    });
    this.form.patchValue({
      role: userFromApi.role,
    });

    this.form.get('id')!.disable();

    // TODO 2a: Use setValue() to populate the form with the full user.
    // setValue requires ALL fields to be provided.
    /* TODO: this.form.setValue({ ... }) */

    // After loading, disable the 'id' field (user can't change their own id)
    // TODO 2b: disable the 'id' control
    /* TODO: this.form.get('id')!.??? */

    /*
     * ✅ ANSWERS:
     *
     * 2a:
     * this.form.setValue({
     *   id:    userFromApi.id,
     *   name:  userFromApi.name,
     *   email: userFromApi.email,
     *   role:  userFromApi.role,
     *   bio:   userFromApi.bio,
     * });
     *
     * 2b:
     * this.form.get('id')!.disable();
     *
     * WHY disable? When 'id' is disabled:
     *   form.value         → { name, email, role, bio }   ← id missing!
     *   form.getRawValue() → { id, name, email, role, bio } ← id included
     * Always use getRawValue() in submit handlers. ← from ex04!
     */
  }

  // Imagine a "Role changed" scenario — only update the role field.
  onRoleReset() {
    // TODO 2c: Use patchValue() to set ONLY the role back to 'user'.
    // patchValue is partial — you only pass the fields you want to change.
    /* TODO: this.form.patchValue({ ... }) */
    /*
     * ✅ ANSWER:
     * this.form.patchValue({ role: 'user' });
     *
     * KEY DIFFERENCE:
     *   patchValue({ role: 'user' })          → only updates 'role', leaves the rest alone
     *   setValue({ role: 'user' })             → ❌ TypeScript error — ALL fields required
     *   setValue({ id:'', name:'', email:'', role:'user', bio:'' }) → ✅ but verbose
     *
     * RULE: editing = patchValue; fresh load = setValue
     */
  }

  // ─────────────────────────────────────────────────────────
  // TASK 3 — reset()
  // ─────────────────────────────────────────────────────────

  onCancelEdit() {
    // TODO 3a: Reset the form to empty defaults.
    // This also clears 'touched' and 'dirty' state — errors disappear.
    /* TODO: this.form.reset() */
    // TODO 3b: Reset the form but keep 'role' as 'user' and 'id' empty.
    // Pass a partial object to reset() to set specific defaults.
    /* TODO: this.form.reset({ role: 'user', id: '' }) */
    /*
     * ✅ ANSWERS:
     *
     * 3a: this.form.reset();
     *     → resets to initial values ('' for strings, as per NonNullableFormBuilder)
     *     → also resets touched/dirty/pristine state (error messages disappear)
     *
     * 3b: this.form.reset({ role: 'user', id: '' });
     *     → only specified fields are reset to given values
     *     → unspecified fields reset to their initial constructor values
     *
     * IMPORTANT: reset() does NOT re-enable disabled controls.
     * If you disabled 'id' in task 2b, it stays disabled after reset().
     */
  }

  // ─────────────────────────────────────────────────────────
  // TASK 4 — markAllAsTouched (the submit pattern)
  // ─────────────────────────────────────────────────────────
  onSubmit() {
    // The PROBLEM with just checking form.invalid:
    // Errors only show when a field is 'touched' (user clicked it).
    // If user clicks submit without touching anything, no errors show.
    //
    // SOLUTION: markAllAsTouched() forces ALL controls to touched state.

    // TODO 4a: mark all controls as touched so all errors show immediately

    /* TODO */

    if (this.form.invalid) {
      return; // errors are now visible — stop here
    }

    const payload = this.form.getRawValue(); // includes disabled 'id'
    console.log('Submitting:', payload);

    /*
     * ✅ ANSWER:
     * this.form.markAllAsTouched();
     *
     * FULL SUBMIT PATTERN (memorise this):
     *
     * onSubmit() {
     *   this.form.markAllAsTouched();   // 1. show all errors
     *   if (this.form.invalid) return;  // 2. stop if invalid
     *   const data = this.form.getRawValue(); // 3. get values incl. disabled
     *   this.service.save(data).subscribe(...); // 4. send to API
     * }
     */
  }

  // ─────────────────────────────────────────────────────────
  // TASK 5 — get() and setValidators / clearValidators
  // ─────────────────────────────────────────────────────────

  // Scenario: make email REQUIRED only when role is 'admin'.
  onRoleChange(role: string) {
    const emailControl = this.form.get('email')!;

    if (role === 'admin') {
      // TODO 5a: set email as required dynamically
      // Hint: emailControl.setValidators([...])
      // After changing validators, you MUST call updateValueAndValidity()
      /* TODO */
    } else {
      // TODO 5b: remove all validators from email
      // Hint: emailControl.clearValidators()
      /* TODO */
    }

    /*
     * ✅ ANSWERS:
     *
     * 5a:
     * emailControl.setValidators([Validators.required, Validators.email]);
     * emailControl.updateValueAndValidity();
     * // updateValueAndValidity() re-runs validation with the new rules
     *
     * 5b:
     * emailControl.clearValidators();
     * emailControl.updateValueAndValidity();
     *
     * IMPORTANT: forgetting updateValueAndValidity() is a common bug.
     * The control won't re-validate until you call it.
     */
  }

  // ─────────────────────────────────────────────────────────
  // BONUS — handy one-liners to memorise
  // ─────────────────────────────────────────────────────────
  cheatSheet() {
    const ctrl = this.form.get('name')!;

    ctrl.value; // current value
    ctrl.valid; // boolean
    ctrl.invalid; // boolean
    ctrl.touched; // user has focused + left the field
    ctrl.dirty; // value has changed from initial
    ctrl.pristine; // value has NOT changed
    ctrl.disabled; // control is locked

    ctrl.setValue('Alice'); // set one control's value
    ctrl.patchValue('Ali'); // same as setValue for a single control
    ctrl.reset(); // clear + untouched
    ctrl.disable(); // lock
    ctrl.enable(); // unlock
    ctrl.markAsTouched(); // show errors on this control
    ctrl.markAsUntouched(); // hide errors on this control

    this.form.valid; // true only if ALL controls are valid
    this.form.invalid; // true if ANY control is invalid
    this.form.dirty; // true if ANY control has changed
    this.form.getRawValue(); // all values including disabled
    this.form.value; // only enabled values
    this.form.reset(); // reset all + pristine/untouched
    this.form.markAllAsTouched(); // show all errors (use before submit check)
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { MemberInput } from '@dashboard/models';
import { MemberForm } from './member-form';

async function setup(save: (v: MemberInput) => Promise<unknown>) {
  const fixture = TestBed.createComponent(MemberForm);
  fixture.componentRef.setInput('save', save);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const type = async (id: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const submit = async () => {
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r));
    await fixture.whenStable();
  };
  return { fixture, el, type, submit };
}

describe('MemberForm', () => {
  it('shows the shared schema messages and does not save an invalid member', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { el, type, submit } = await setup(save);
    await type('m-name', 'A');
    await type('m-email', 'not-an-email');
    await submit();

    expect(save).not.toHaveBeenCalled();
    expect(el.querySelector('#m-name-error')?.textContent).toContain(
      'Use at least 2 characters'
    );
    expect(el.querySelector('#m-email-error')?.textContent).toContain(
      'Enter a valid email address'
    );
    expect(el.querySelector('#m-email')?.getAttribute('aria-invalid')).toBe(
      'true'
    );
  });

  it('sends tidied values and shows a server error under its field', async () => {
    const save = vi.fn().mockRejectedValue(
      new HttpErrorResponse({
        status: 409,
        error: {
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          errors: [
            {
              path: 'email',
              message: 'A member with this email already exists',
            },
          ],
        },
      })
    );
    const { el, type, submit } = await setup(save);
    await type('m-name', '  Ada Lovelace ');
    await type('m-email', ' Ada@Example.com');
    await submit();

    expect(save).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: 'viewer',
      status: 'invited',
    });
    expect(el.querySelector('#m-email-error')?.textContent).toContain(
      'A member with this email already exists'
    );
  });
});

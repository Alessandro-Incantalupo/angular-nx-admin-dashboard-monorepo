import { describe, expect, it } from 'vitest';
import { loginSchema, passwordChangeSchema } from './auth';
import { memberInputSchema, memberListQuerySchema } from './member';
import { workspaceSettingsSchema } from './settings';

const messages = (result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}) =>
  Object.fromEntries(
    (result.error?.issues ?? []).map(i => [i.path.join('.'), i.message])
  );

describe('memberInputSchema', () => {
  const valid = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: 'editor',
    status: 'active',
  };

  it('accepts a valid member and tidies name and email', () => {
    const parsed = memberInputSchema.parse({
      ...valid,
      name: '  Ada Lovelace ',
      email: ' Ada@Example.COM ',
    });
    expect(parsed).toEqual(valid);
  });

  it('explains each invalid field in plain words', () => {
    const result = memberInputSchema.safeParse({
      name: 'A',
      email: 'ada',
      role: 'owner',
      status: '',
    });
    expect(messages(result)).toEqual({
      name: 'Use at least 2 characters',
      email: 'Enter a valid email address, like name@example.com',
      role: 'Choose a role',
      status: 'Choose a status',
    });
  });

  it('rejects an empty email with its own message', () => {
    expect(
      messages(memberInputSchema.safeParse({ ...valid, email: '   ' }))
    ).toEqual({
      email: 'Enter an email address',
    });
  });
});

describe('memberListQuerySchema', () => {
  it('fills defaults and turns query strings into numbers', () => {
    expect(memberListQuerySchema.parse({})).toEqual({ page: 1, size: 10 });
    expect(
      memberListQuerySchema.parse({ page: '3', size: '25', role: 'admin' })
    ).toEqual({
      page: 3,
      size: 25,
      role: 'admin',
    });
  });

  it('caps the page size at 50', () => {
    expect(memberListQuerySchema.safeParse({ size: '500' }).success).toBe(
      false
    );
  });
});

describe('loginSchema', () => {
  it('needs an email and a password', () => {
    expect(
      messages(loginSchema.safeParse({ email: '', password: '' }))
    ).toEqual({
      email: 'Enter an email address',
      password: 'Enter your password',
    });
  });
});

describe('passwordChangeSchema', () => {
  const base = {
    currentPassword: 'old-password-1',
    newPassword: 'a-long-new-password',
    confirmPassword: 'a-long-new-password',
  };

  it('accepts a matching new password of 12 or more characters', () => {
    expect(passwordChangeSchema.safeParse(base).success).toBe(true);
  });

  it('flags a short password, a mismatch and a reused password on the right field', () => {
    expect(
      messages(
        passwordChangeSchema.safeParse({
          ...base,
          newPassword: 'short',
          confirmPassword: 'short',
        })
      )
    ).toEqual({
      newPassword: 'Use at least 12 characters',
    });
    expect(
      messages(
        passwordChangeSchema.safeParse({
          ...base,
          confirmPassword: 'something-else',
        })
      )
    ).toEqual({
      confirmPassword: 'The two new passwords are different',
    });
    expect(
      messages(
        passwordChangeSchema.safeParse({
          ...base,
          newPassword: base.currentPassword,
          confirmPassword: base.currentPassword,
        })
      )
    ).toEqual({ newPassword: 'Choose a password you are not using now' });
  });
});

describe('workspaceSettingsSchema', () => {
  it('accepts the supported languages and week starts only', () => {
    const ok = {
      workspaceName: 'Northwind',
      supportEmail: 'help@example.com',
      defaultLanguage: 'it',
      weekStartsOn: 'monday',
    };
    expect(workspaceSettingsSchema.safeParse(ok).success).toBe(true);
    expect(
      workspaceSettingsSchema.safeParse({ ...ok, defaultLanguage: 'fr' })
        .success
    ).toBe(false);
  });
});

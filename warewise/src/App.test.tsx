import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { safeStorageGet, safeStorageSet } from './utils/storage';

describe('App rendering', () => {
  it('renders the primary app shell without crashing', () => {
    render(<App />);

    expect(screen.getByRole('application', { name: /warewise enterprise operations platform/i })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: /warewise application workspace/i })).toBeInTheDocument();
  });

  it('safely handles malformed localStorage values', () => {
    window.localStorage.setItem('warewise_test_key', '{bad json');

    expect(safeStorageGet('warewise_test_key', { ok: false })).toEqual({ ok: false });

    safeStorageSet('warewise_test_key', { ok: true });
    expect(safeStorageGet('warewise_test_key', { ok: false })).toEqual({ ok: true });
  });
});

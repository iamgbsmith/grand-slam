import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock the PWA module which is not available in the test environment.
vi.mock('virtual:pwa-register/react', () => ({
    useRegisterSW: () => ({
        needRefresh: [false, vi.fn()],
        offlineReady: [false, vi.fn()],
        updateServiceWorker: vi.fn(() => Promise.resolve()),
    }),
}))
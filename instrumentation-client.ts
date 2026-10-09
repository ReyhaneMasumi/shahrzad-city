import { worker } from './src/mocks/browser';

// Start MSW in browser before hydration; first paint is hydrated from server data,
// so there is no data waterfall in this setup.
void worker.start({ onUnhandledRequest: 'bypass' });

window.HTMLElement.prototype.scrollIntoView = function() {};

import '@testing-library/jest-dom';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-key'; 
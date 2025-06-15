<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let isAuthenticated = false;
  let isLoading = true;
  let currentUser = null;
  let darkMode = false;
  let isLoggingOut = false;
  
  onMount(async () => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      darkMode = savedTheme === 'dark';
    } else {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    updateTheme();

    // Check if user is authenticated by trying to access admin stats
    try {
      console.log('Checking authentication status...');
      const response = await fetch('/api/admin/stats', {
        credentials: 'include' // Include cookies
      });

      console.log('Auth check response status:', response.status);
      isAuthenticated = response.ok;

      // Try to get user info from manage endpoint to check if super admin
      if (isAuthenticated) {
        try {
          const manageResponse = await fetch('/api/admin/manage', {
            credentials: 'include'
          });
          if (manageResponse.ok) {
            currentUser = { role: 'super_admin' };
            console.log('User identified as super admin');
          } else {
            currentUser = { role: 'admin' };
            console.log('User identified as regular admin');
          }
        } catch (err) {
          currentUser = { role: 'admin' };
          console.log('Defaulting to regular admin role');
        }
      } else {
        console.log('User not authenticated');
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      isAuthenticated = false;
    }

    isLoading = false;

    // Handle authentication redirects
    if (isAuthenticated && $page.url.pathname.includes('/login')) {
      // If authenticated user tries to access login page, redirect to dashboard
      goto('/admin/dashboard');
    } else if (!isAuthenticated && !$page.url.pathname.includes('/login')) {
      // If not authenticated and not on login page, redirect to login
      goto('/admin/login');
    }
  });

  function toggleTheme() {
    darkMode = !darkMode;
    updateTheme();
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }

  function updateTheme() {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  async function handleLogout() {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    try {
      isLoggingOut = true;
      console.log('Logout initiated...');

      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include' // Ensure cookies are included
      });

      console.log('Logout response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Logout successful:', result.message);
      } else {
        console.error('Logout failed with status:', response.status);
      }

      // Clear any local state regardless of API response
      isAuthenticated = false;
      currentUser = null;

      // Small delay to ensure state is cleared
      setTimeout(() => {
        goto('/admin/login');
      }, 100);

    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if there's an error
      isAuthenticated = false;
      currentUser = null;
      goto('/admin/login');
    } finally {
      isLoggingOut = false;
    }
  }
  
  $: currentPath = $page.url.pathname;
</script>

<style>
  /* Ensure admin layout takes full control */
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>

<!-- Override the root layout completely for admin pages -->
<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  {#if isLoading}
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  {:else if isAuthenticated || (!isAuthenticated && currentPath.includes('/login'))}
    {#if isAuthenticated}
      <!-- Unified Admin Navigation -->
      <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-8">
              <a href="/" class="text-xl font-bold text-primary-600 dark:text-primary-400">
                DonationHub
              </a>
              <span class="text-sm text-gray-500 dark:text-gray-400">|</span>
              <span class="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Admin Dashboard
              </span>
              
              <div class="hidden md:flex space-x-6">
                <a
                  href="/admin/dashboard"
                  class="text-sm font-medium transition-colors"
                  class:text-primary-600={currentPath === '/admin/dashboard'}
                  class:dark:text-primary-400={currentPath === '/admin/dashboard'}
                  class:text-gray-700={currentPath !== '/admin/dashboard'}
                  class:dark:text-gray-300={currentPath !== '/admin/dashboard'}
                  class:hover:text-primary-600={currentPath !== '/admin/dashboard'}
                  class:dark:hover:text-primary-400={currentPath !== '/admin/dashboard'}
                >
                  Dashboard
                </a>
                <a
                  href="/admin/projects"
                  class="text-sm font-medium transition-colors"
                  class:text-primary-600={currentPath === '/admin/projects'}
                  class:dark:text-primary-400={currentPath === '/admin/projects'}
                  class:text-gray-700={currentPath !== '/admin/projects'}
                  class:dark:text-gray-300={currentPath !== '/admin/projects'}
                  class:hover:text-primary-600={currentPath !== '/admin/projects'}
                  class:dark:hover:text-primary-400={currentPath !== '/admin/projects'}
                >
                  Projects
                </a>
                <a
                  href="/admin/donations"
                  class="text-sm font-medium transition-colors"
                  class:text-primary-600={currentPath === '/admin/donations'}
                  class:dark:text-primary-400={currentPath === '/admin/donations'}
                  class:text-gray-700={currentPath !== '/admin/donations'}
                  class:dark:text-gray-300={currentPath !== '/admin/donations'}
                  class:hover:text-primary-600={currentPath !== '/admin/donations'}
                  class:dark:hover:text-primary-400={currentPath !== '/admin/donations'}
                >
                  Donations
                </a>

                {#if currentUser?.role === 'super_admin'}
                  <a
                    href="/admin/manage-admins"
                    class="text-sm font-medium transition-colors"
                    class:text-primary-600={currentPath === '/admin/manage-admins'}
                    class:dark:text-primary-400={currentPath === '/admin/manage-admins'}
                    class:text-gray-700={currentPath !== '/admin/manage-admins'}
                    class:dark:text-gray-300={currentPath !== '/admin/manage-admins'}
                    class:hover:text-primary-600={currentPath !== '/admin/manage-admins'}
                    class:dark:hover:text-primary-400={currentPath !== '/admin/manage-admins'}
                  >
                    Manage Admins
                  </a>
                {/if}
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Theme Toggle -->
              <button
                on:click={toggleTheme}
                class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {#if darkMode}
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
                  </svg>
                {:else}
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                  </svg>
                {/if}
              </button>

              <a
                href="/"
                class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                View Site
              </a>

              {#if currentUser?.role === 'super_admin'}
                <span class="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                  Super Admin
                </span>
              {:else}
                <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                  Admin
                </span>
              {/if}

              <button
                on:click={handleLogout}
                disabled={isLoggingOut}
                class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-danger-600 dark:hover:text-danger-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if isLoggingOut}
                  <span class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging out...
                  </span>
                {:else}
                  Logout
                {/if}
              </button>
            </div>
          </div>
        </div>
      </nav>
    {/if}
    
    <!-- Main Content -->
    <main>
      <slot />
    </main>
  {:else}
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
        <p class="text-gray-600 dark:text-gray-300 mb-6">You need to be logged in to access this area.</p>
        <a href="/admin/login" class="btn btn-primary">Go to Login</a>
      </div>
    </div>
  {/if}
</div>

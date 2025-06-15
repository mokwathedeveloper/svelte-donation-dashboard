<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let specialKey = '';
  let isLoading = false;
  let error = '';
  let SUPER_ADMIN_KEY = '';

  // Fetch the special key from the server
  onMount(async () => {
    try {
      const response = await fetch('/api/admin/keys');
      const keys = await response.json();
      SUPER_ADMIN_KEY = keys.loginKey;
      console.log('Admin keys loaded from server');
    } catch (err) {
      console.error('Failed to load admin keys:', err);
      error = 'Failed to load authentication keys. Please refresh the page.';
    }
  });
  
  async function handleSuperAdminLogin() {
    console.log('Super Admin login attempt started');
    console.log('Form data:', { email, hasPassword: !!password, hasSpecialKey: !!specialKey });

    if (!email || !password || !specialKey) {
      error = 'Please enter email, password, and special key';
      console.log('Missing required fields');
      return;
    }

    if (specialKey !== SUPER_ADMIN_KEY) {
      error = 'Invalid special key. Super Admin access denied.';
      console.log('Invalid special key provided');
      return;
    }

    console.log('All validations passed, making API call...');

    isLoading = true;
    error = '';

    try {
      const requestData = { email, password, specialKey };
      console.log('Request data:', requestData);

      const response = await fetch('/api/superadmin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);

      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok) {
        console.log('Login successful, redirecting...');
        goto('/admin/dashboard');
      } else {
        console.log('Login failed:', result.error);
        error = result.error || 'Super Admin login failed';
      }
    } catch (err) {
      console.error('Network error during login:', err);
      error = 'Network error. Please try again.';
    } finally {
      isLoading = false;
    }
  }
  
  /**
   * @param {KeyboardEvent} event
   */
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      handleSuperAdminLogin();
    }
  }
</script>

<svelte:head>
  <title>Super Admin Login - DonationHub</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
  <div class="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl space-y-6 sm:space-y-8">
    <!-- Header Section -->
    <div class="text-center space-y-4 sm:space-y-6">
      <!-- Professional Super Admin Icon -->
      <div class="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-red-300/50 relative">
        <svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          <path d="M12 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="rgba(255,255,255,0.3)"/>
        </svg>
        <!-- Security Badge -->
        <div class="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-yellow-400 rounded-full flex items-center justify-center">
          <svg class="w-3 h-3 sm:w-4 sm:h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>

      <!-- Title and Description -->
      <div class="space-y-2 sm:space-y-3">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          Super Admin Portal
        </h1>
        <p class="text-sm sm:text-base text-red-200 max-w-md mx-auto leading-relaxed">
          Maximum security access with special authentication key required
        </p>
        <div class="inline-flex items-center space-x-2 bg-red-800/50 px-3 py-1 rounded-full text-xs sm:text-sm text-red-100">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <span>Restricted Access | Monitored</span>
        </div>
      </div>
    </div>

    <!-- Login Card -->
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-red-400/30 p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
      <!-- Error Message -->
      {#if error}
        <div class="p-4 sm:p-5 bg-red-500/20 border border-red-400/50 rounded-xl backdrop-blur-sm">
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5 text-red-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <p class="text-red-100 text-sm sm:text-base font-medium">{error}</p>
          </div>
        </div>
      {/if}

      <!-- Super Admin Form -->
      <form class="space-y-5 sm:space-y-6" on:submit|preventDefault={handleSuperAdminLogin}>
        <!-- Email Field -->
        <div class="space-y-2">
          <label for="email" class="block text-sm sm:text-base font-semibold text-red-100">
            <span class="flex items-center space-x-2">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span>Super Admin Email</span>
            </span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            on:keydown={handleKeyDown}
            class="w-full px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base border border-red-400/50 rounded-xl bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-all duration-200 disabled:opacity-50"
            placeholder="superadmin@donationhub.com"
            disabled={isLoading}
          />
        </div>
        
        <!-- Password Field -->
        <div class="space-y-2">
          <label for="password" class="block text-sm sm:text-base font-semibold text-red-100">
            <span class="flex items-center space-x-2">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              <span>Secure Password</span>
            </span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            bind:value={password}
            on:keydown={handleKeyDown}
            class="w-full px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base border border-red-400/50 rounded-xl bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-all duration-200 disabled:opacity-50"
            placeholder="Enter your secure password"
            disabled={isLoading}
          />
        </div>

        <!-- Special Key Field -->
        <div class="space-y-2">
          <label for="specialKey" class="block text-sm sm:text-base font-semibold text-red-100">
            <span class="flex items-center space-x-2">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4v-4l4-4 4 4 .257-.257A6 6 0 0118 8zm-6-2a2 2 0 11-4 0 2 2 0 014 0z" clip-rule="evenodd"/>
              </svg>
              <span>Special Access Key</span>
            </span>
          </label>
          <input
            id="specialKey"
            name="specialKey"
            type="password"
            required
            bind:value={specialKey}
            on:keydown={handleKeyDown}
            class="w-full px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base border border-yellow-400/50 rounded-xl bg-yellow-50/90 backdrop-blur-sm text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all duration-200 disabled:opacity-50"
            placeholder="SUPER_ADMIN_2024_DONATION_HUB_KEY"
            disabled={isLoading}
          />
          <div class="flex items-center space-x-2 mt-2">
            <svg class="w-4 h-4 text-yellow-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <p class="text-xs sm:text-sm text-red-200 leading-relaxed">
              This special key is required for maximum security super admin access
            </p>
          </div>
        </div>
        
        <!-- Super Admin Login Button -->
        <button
          type="submit"
          disabled={isLoading}
          class="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 sm:py-4 px-6 rounded-xl shadow-2xl hover:shadow-red-500/25 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3 text-sm sm:text-base border border-red-500/50"
        >
          {#if isLoading}
            <svg class="animate-spin w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Authenticating...</span>
          {:else}
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            <span>Super Admin Access</span>
          {/if}
        </button>

        <!-- Navigation Link -->
        <div class="pt-6 border-t border-red-400/30 text-center">
          <a
            href="/admin/login"
            class="inline-flex items-center space-x-2 text-sm sm:text-base text-red-200 hover:text-white transition-colors group"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
            </svg>
            <span>Regular Admin Login</span>
          </a>
        </div>
      </form>
    </div>

    <!-- Security Notices -->
    <div class="text-center space-y-3 px-4">
      <div class="inline-flex items-center space-x-2 bg-red-800/50 px-4 py-2 rounded-full text-xs sm:text-sm text-red-100 border border-red-600/30">
        <svg class="w-4 h-4 text-red-300" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span>Super Admin access is restricted and monitored</span>
      </div>
      <p class="text-xs text-red-300 max-w-md mx-auto leading-relaxed">
        Contact system administrator for access key | All login attempts are logged
      </p>
    </div>
  </div>
</div>

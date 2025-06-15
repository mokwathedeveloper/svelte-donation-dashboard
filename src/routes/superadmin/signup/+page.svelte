<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let specialKey = '';
  let isLoading = false;
  let error = '';
  let success = '';
  let SUPER_ADMIN_CREATION_KEY = '';

  // Fetch the special key from the server
  onMount(async () => {
    try {
      const response = await fetch('/api/admin/keys');
      const keys = await response.json();
      SUPER_ADMIN_CREATION_KEY = keys.creationKey;
      console.log('Admin keys loaded from server');
    } catch (err) {
      console.error('Failed to load admin keys:', err);
      error = 'Failed to load authentication keys. Please refresh the page.';
    }
  });
  
  async function handleSuperAdminSignup() {
    console.log('Super Admin signup attempt started');
    console.log('Form data:', { name, email, hasPassword: !!password, hasConfirmPassword: !!confirmPassword, hasSpecialKey: !!specialKey });

    if (!name || !email || !password || !confirmPassword || !specialKey) {
      error = 'All fields are required';
      console.log('Missing required fields');
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      console.log('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      error = 'Password must be at least 8 characters long';
      console.log('Password too short');
      return;
    }

    if (specialKey !== SUPER_ADMIN_CREATION_KEY) {
      error = 'Invalid creation key. Super Admin creation denied.';
      console.log('Invalid creation key provided');
      return;
    }

    console.log('All validations passed, making API call...');

    isLoading = true;
    error = '';
    success = '';

    try {
      const requestData = { name, email, password, specialKey };
      console.log('Request data:', { ...requestData, password: '[HIDDEN]', specialKey: '[HIDDEN]' });

      const response = await fetch('/api/superadmin/signup', {
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
        console.log('Super Admin created successfully!');
        success = 'Super Admin created successfully! You can now login.';
        // Reset form
        name = '';
        email = '';
        password = '';
        confirmPassword = '';
        specialKey = '';

        // Redirect to login after 3 seconds
        setTimeout(() => {
          console.log('Redirecting to login...');
          goto('/superadmin/login');
        }, 3000);
      } else {
        console.log('Super Admin creation failed:', result.error);
        error = result.error || 'Super Admin creation failed';
      }
    } catch (err) {
      console.error('Network error during signup:', err);
      error = 'Network error. Please try again.';
    } finally {
      isLoading = false;
    }
  }
  
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      handleSuperAdminSignup();
    }
  }
</script>

<svelte:head>
  <title>Create Super Admin - DonationHub</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <div class="mx-auto h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center">
        <svg class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
        👑 Create Super Admin
      </h2>
      <p class="mt-2 text-center text-sm text-purple-200">
        Initialize the first super administrator account
      </p>
    </div>
    
    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-purple-400/30">
      <form class="space-y-6" on:submit|preventDefault={handleSuperAdminSignup}>
        {#if error}
          <div class="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-lg">
            {error}
          </div>
        {/if}
        
        {#if success}
          <div class="bg-green-500/20 border border-green-400 text-green-100 px-4 py-3 rounded-lg">
            {success}
          </div>
        {/if}
        
        <div>
          <label for="name" class="block text-sm font-medium text-purple-100">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            bind:value={name}
            on:keydown={handleKeyDown}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-purple-400/50 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-white/90"
            placeholder="Super Administrator"
          />
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-purple-100">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            on:keydown={handleKeyDown}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-purple-400/50 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-white/90"
            placeholder="superadmin@donationhub.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-purple-100">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            on:keydown={handleKeyDown}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-purple-400/50 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-white/90"
            placeholder="Minimum 8 characters"
          />
        </div>
        
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-purple-100">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            bind:value={confirmPassword}
            on:keydown={handleKeyDown}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-purple-400/50 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-white/90"
            placeholder="Confirm your password"
          />
        </div>
        
        <div>
          <label for="specialKey" class="block text-sm font-medium text-purple-100">
            🔑 Master Creation Key
          </label>
          <input
            id="specialKey"
            name="specialKey"
            type="password"
            required
            bind:value={specialKey}
            on:keydown={handleKeyDown}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-purple-400/50 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-white/90"
            placeholder="Enter master creation key"
          />
          <p class="mt-1 text-xs text-purple-200">
            This key is required to create the first super admin
          </p>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {#if isLoading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Super Admin...
            {:else}
              👑 Create Super Admin
            {/if}
          </button>
        </div>
        
        <div class="text-center">
          <a href="/superadmin/login" class="text-purple-200 hover:text-white text-sm">
            Already have super admin? Login →
          </a>
        </div>
      </form>
    </div>
    
    <div class="text-center text-purple-200 text-xs">
      <p>⚠️ This creates the first super administrator account</p>
      <p>Contact system owner for the master creation key</p>
    </div>
  </div>
</div>

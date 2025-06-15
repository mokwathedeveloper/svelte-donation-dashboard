<script>
  import { onMount } from 'svelte';
  
  let stats = null;
  let isLoading = true;
  let error = '';
  
  onMount(async () => {
    await loadStats();
  });
  
  async function loadStats() {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        stats = await response.json();
      } else {
        error = 'Failed to load statistics';
      }
    } catch (err) {
      error = 'Network error loading statistics';
      console.error('Stats loading error:', err);
    } finally {
      isLoading = false;
    }
  }
  
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  $: progressPercentage = stats?.projectStats ? 
    Math.min((stats.projectStats.totalRaised / stats.projectStats.totalGoal) * 100, 100) : 0;
</script>

<svelte:head>
  <title>Admin Dashboard - DonationHub</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
    <p class="text-gray-600 dark:text-gray-300 mt-2">
      Overview of donation platform performance and statistics
    </p>
  </div>
  
  {#if isLoading}
    <div class="flex items-center justify-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  {:else if error}
    <div class="card p-6 text-center">
      <p class="text-danger-600 dark:text-danger-400">{error}</p>
      <button on:click={loadStats} class="btn btn-primary mt-4">
        Retry
      </button>
    </div>
  {:else if stats}
    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.projectStats.totalProjects}</p>
          </div>
        </div>
      </div>
      
      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
            <svg class="w-6 h-6 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.projectStats.activeProjects}</p>
          </div>
        </div>
      </div>
      
      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Raised</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.projectStats.totalRaised)}</p>
          </div>
        </div>
      </div>
      
      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Donations</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.donationStats.completed}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Progress Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Progress</h3>
        <div class="space-y-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Total Goal</span>
            <span class="font-medium text-gray-900 dark:text-white">{formatCurrency(stats.projectStats.totalGoal)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: {progressPercentage}%"></div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Progress: {progressPercentage.toFixed(1)}%</span>
            <span class="text-gray-600 dark:text-gray-400">Remaining: {formatCurrency(Math.max(0, stats.projectStats.totalGoal - stats.projectStats.totalRaised))}</span>
          </div>
        </div>
      </div>
      
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Donation Status</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">Completed</span>
            <span class="text-sm font-medium text-success-600 dark:text-success-400">{stats.donationStats.completed}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">Pending</span>
            <span class="text-sm font-medium text-yellow-600 dark:text-yellow-400">{stats.donationStats.pending}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">Failed</span>
            <span class="text-sm font-medium text-danger-600 dark:text-danger-400">{stats.donationStats.failed}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{stats.donationStats.cancelled}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Donations</h3>
        {#if stats.recentDonations.length > 0}
          <div class="space-y-3">
            {#each stats.recentDonations as donation}
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{donation.projectTitle}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{formatDate(donation.createdAt)}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(donation.amount)}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{donation.phoneNumber}</p>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-gray-500 dark:text-gray-400 text-sm">No recent donations</p>
        {/if}
      </div>
      
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Projects</h3>
        {#if stats.topProjects.length > 0}
          <div class="space-y-3">
            {#each stats.topProjects as project}
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{project.title}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{project.donationCount} donations</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(project.totalDonations)}</p>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-gray-500 dark:text-gray-400 text-sm">No project data available</p>
        {/if}
      </div>
    </div>
  {/if}
</div>

<script>
  import { onMount } from 'svelte';
  
  let donations = [];
  let isLoading = true;
  let error = '';
  let filters = {
    status: '',
    projectId: '',
    page: 1,
    limit: 20
  };
  let pagination = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  };
  let projects = [];
  
  onMount(async () => {
    await loadProjects();
    await loadDonations();
  });
  
  async function loadProjects() {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        projects = data.projects;
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  }
  
  async function loadDonations() {
    isLoading = true;
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.projectId) params.append('projectId', filters.projectId);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      
      const response = await fetch(`/api/donations?${params}`);
      if (response.ok) {
        const data = await response.json();
        donations = data.donations;
        pagination = data.pagination;
      } else {
        error = 'Failed to load donations';
      }
    } catch (err) {
      error = 'Network error loading donations';
      console.error('Error loading donations:', err);
    } finally {
      isLoading = false;
    }
  }
  
  async function applyFilters() {
    filters.page = 1; // Reset to first page when filtering
    await loadDonations();
  }
  
  async function changePage(newPage) {
    filters.page = newPage;
    await loadDonations();
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
  
  function getStatusColor(status) {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
  
  $: totalDonations = donations.reduce((sum, donation) => 
    donation.status === 'completed' ? sum + donation.amount : sum, 0
  );
</script>

<svelte:head>
  <title>Donations - DonationHub</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Donations</h1>
    <p class="text-gray-600 dark:text-gray-300 mt-2">
      Track and manage all donations made through the platform
    </p>
  </div>
  
  <!-- Summary Stats -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div class="card p-6">
      <div class="flex items-center">
        <div class="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
          <svg class="w-6 h-6 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalDonations)}</p>
        </div>
      </div>
    </div>
    
    <div class="card p-6">
      <div class="flex items-center">
        <div class="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
          <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Donations</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
        </div>
      </div>
    </div>
    
    <div class="card p-6">
      <div class="flex items-center">
        <div class="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
          <svg class="w-6 h-6 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {donations.filter(d => d.status === 'completed').length}
          </p>
        </div>
      </div>
    </div>
    
    <div class="card p-6">
      <div class="flex items-center">
        <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {donations.filter(d => d.status === 'pending').length}
          </p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Filters -->
  <div class="card p-6 mb-8">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <select
          id="status"
          bind:value={filters.status}
          on:change={applyFilters}
          class="input"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div>
        <label for="project" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project
        </label>
        <select
          id="project"
          bind:value={filters.projectId}
          on:change={applyFilters}
          class="input"
        >
          <option value="">All Projects</option>
          {#each projects as project}
            <option value={project._id}>{project.title}</option>
          {/each}
        </select>
      </div>
      
      <div>
        <label for="limit" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Per Page
        </label>
        <select
          id="limit"
          bind:value={filters.limit}
          on:change={applyFilters}
          class="input"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  </div>
  
  {#if error}
    <div class="card p-6 text-center">
      <p class="text-danger-600 dark:text-danger-400">{error}</p>
      <button on:click={loadDonations} class="btn btn-primary mt-4">
        Retry
      </button>
    </div>
  {:else if isLoading}
    <div class="flex items-center justify-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  {:else if donations.length > 0}
    <!-- Donations Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Project
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Receipt
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {#each donations as donation}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {donation.projectTitle}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(donation.amount)}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {donation.phoneNumber}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(donation.status)}">
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(donation.createdAt)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {donation.mpesaReceiptNumber || '-'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      {#if pagination.pages > 1}
        <div class="bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              on:click={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              class="btn btn-secondary"
            >
              Previous
            </button>
            <button
              on:click={() => changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              class="btn btn-secondary"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Showing
                <span class="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                to
                <span class="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                of
                <span class="font-medium">{pagination.total}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  on:click={() => changePage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  class="btn btn-secondary rounded-r-none"
                >
                  Previous
                </button>
                
                {#each Array(Math.min(5, pagination.pages)) as _, i}
                  {@const pageNum = i + 1}
                  <button
                    on:click={() => changePage(pageNum)}
                    class="btn rounded-none"
                    class:btn-primary={pageNum === pagination.page}
                    class:btn-secondary={pageNum !== pagination.page}
                  >
                    {pageNum}
                  </button>
                {/each}
                
                <button
                  on:click={() => changePage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  class="btn btn-secondary rounded-l-none"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="card p-6 text-center">
      <div class="w-24 h-24 mx-auto mb-6 text-gray-400 dark:text-gray-600">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
        No Donations Found
      </h3>
      <p class="text-gray-600 dark:text-gray-300">
        {filters.status || filters.projectId ? 'No donations match your current filters.' : 'No donations have been made yet.'}
      </p>
    </div>
  {/if}
</div>

<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  /** @type {any[]} */
  let admins = [];
  let isLoading = true;
  let error = '';
  let showCreateForm = false;
  /** @type {any} */
  let currentUser = null;

  // Create admin form
  /** @type {{ email: string, password: string, name: string, role: string }} */
  let newAdmin = {
    email: '',
    password: '',
    name: '',
    role: 'admin'
  };
  let createLoading = false;
  let createError = '';
  
  onMount(async () => {
    await loadAdmins();
    await loadCurrentUser();
  });
  
  async function loadCurrentUser() {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        // User is authenticated, we can get user info from token
        currentUser = { role: 'super_admin' }; // Simplified for now
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }
  }
  
  async function loadAdmins() {
    try {
      const response = await fetch('/api/admin/manage', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        admins = data.admins;
      } else if (response.status === 403) {
        error = 'Access denied. Super Admin privileges required.';
      } else {
        error = 'Failed to load admins';
      }
    } catch (err) {
      error = 'Network error loading admins';
      console.error('Error loading admins:', err);
    } finally {
      isLoading = false;
    }
  }
  
  async function createAdmin() {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      createError = 'All fields are required';
      return;
    }
    
    createLoading = true;
    createError = '';
    
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newAdmin)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Reset form
        newAdmin = { email: '', password: '', name: '', role: 'admin' };
        showCreateForm = false;
        await loadAdmins();
      } else {
        createError = result.error || 'Failed to create admin';
      }
    } catch (err) {
      createError = 'Network error creating admin';
      console.error('Error creating admin:', err);
    } finally {
      createLoading = false;
    }
  }
  
  /**
   * @param {string} adminId
   * @param {boolean} currentStatus
   */
  async function toggleAdminStatus(adminId, currentStatus) {
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          adminId,
          isActive: !currentStatus
        })
      });
      
      if (response.ok) {
        await loadAdmins();
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to update admin status');
      }
    } catch (err) {
      alert('Network error updating admin');
      console.error('Error updating admin:', err);
    }
  }
  
  /**
   * @param {string} adminId
   * @param {string} adminName
   */
  async function deleteAdmin(adminId, adminName) {
    if (!confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ adminId })
      });
      
      if (response.ok) {
        await loadAdmins();
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to delete admin');
      }
    } catch (err) {
      alert('Network error deleting admin');
      console.error('Error deleting admin:', err);
    }
  }
  
  /**
   * @param {string} dateString
   */
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<svelte:head>
  <title>Manage Admins - DonationHub</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8 flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Manage Admins</h1>
      <p class="text-gray-600 dark:text-gray-300 mt-2">
        Create and manage admin accounts for the donation platform
      </p>
    </div>
    
    <button
      on:click={() => showCreateForm = !showCreateForm}
      class="btn btn-primary"
    >
      {showCreateForm ? 'Cancel' : 'Create New Admin'}
    </button>
  </div>
  
  {#if error}
    <div class="card p-6 text-center mb-8">
      <p class="text-danger-600 dark:text-danger-400">{error}</p>
      {#if error.includes('Access denied')}
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          This page is only accessible to Super Admins.
        </p>
        <button on:click={() => goto('/admin/dashboard')} class="btn btn-primary mt-4">
          Go to Dashboard
        </button>
      {/if}
    </div>
  {:else}
    <!-- Create Admin Form -->
    {#if showCreateForm}
      <div class="card p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Admin</h2>
        
        {#if createError}
          <div class="mb-4 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
            <p class="text-danger-700 dark:text-danger-300 text-sm">{createError}</p>
          </div>
        {/if}
        
        <form on:submit|preventDefault={createAdmin} class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              bind:value={newAdmin.name}
              placeholder="Enter full name"
              class="input"
              required
              disabled={createLoading}
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              bind:value={newAdmin.email}
              placeholder="admin@example.com"
              class="input"
              required
              disabled={createLoading}
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              bind:value={newAdmin.password}
              placeholder="Minimum 6 characters"
              class="input"
              required
              minlength="6"
              disabled={createLoading}
            />
          </div>
          
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              id="role"
              bind:value={newAdmin.role}
              class="input"
              disabled={createLoading}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          
          <div class="md:col-span-2 flex gap-3">
            <button
              type="submit"
              class="btn btn-primary"
              disabled={createLoading}
            >
              {#if createLoading}
                Creating...
              {:else}
                Create Admin
              {/if}
            </button>
            
            <button
              type="button"
              on:click={() => showCreateForm = false}
              class="btn btn-secondary"
              disabled={createLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    {/if}
    
    <!-- Admins List -->
    {#if isLoading}
      <div class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    {:else if admins.length > 0}
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Admin
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {#each admins as admin}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {admin.name}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {admin.email}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          class:bg-purple-100={admin.role === 'super_admin'}
                          class:text-purple-800={admin.role === 'super_admin'}
                          class:dark:bg-purple-900={admin.role === 'super_admin'}
                          class:dark:text-purple-200={admin.role === 'super_admin'}
                          class:bg-blue-100={admin.role === 'admin'}
                          class:text-blue-800={admin.role === 'admin'}
                          class:dark:bg-blue-900={admin.role === 'admin'}
                          class:dark:text-blue-200={admin.role === 'admin'}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          class:bg-success-100={admin.isActive}
                          class:text-success-800={admin.isActive}
                          class:dark:bg-success-900={admin.isActive}
                          class:dark:text-success-200={admin.isActive}
                          class:bg-gray-100={!admin.isActive}
                          class:text-gray-800={!admin.isActive}
                          class:dark:bg-gray-700={!admin.isActive}
                          class:dark:text-gray-300={!admin.isActive}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(admin.createdAt)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      on:click={() => toggleAdminStatus(admin._id, admin.isActive)}
                      class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                    >
                      {admin.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    {#if admin.role !== 'super_admin'}
                      <button
                        on:click={() => deleteAdmin(admin._id, admin.name)}
                        class="text-danger-600 dark:text-danger-400 hover:text-danger-900 dark:hover:text-danger-300"
                      >
                        Delete
                      </button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {:else}
      <div class="card p-6 text-center">
        <p class="text-gray-500 dark:text-gray-400">No admins found</p>
      </div>
    {/if}
  {/if}
</div>

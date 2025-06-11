<!-- src/routes/admin/manage/+page.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { showSuccessToast, showErrorToast } from '$lib/utils/toast';

    export let data: { admin: any };
    let loading = false;
    let newAdmin = {
        username: '',
        password: '',
        secretKey: ''
    };

    $: if (!$page.data.admin?.superAdmin) {
        goto('/admin/dashboard');
    }

    async function handleCreateAdmin() {
        if (loading) return;
        if (!newAdmin.username || !newAdmin.password || !newAdmin.secretKey) {
            showErrorToast('All fields are required');
            return;
        }

        try {
            loading = true;
            const response = await fetch('/api/admin/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: newAdmin.username,
                    password: newAdmin.password,
                    secretKey: newAdmin.secretKey,
                    isSuperAdmin: false
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create admin');
            }

            showSuccessToast('Admin created successfully');
            newAdmin = {
                username: '',
                password: '',
                secretKey: ''
            };
        } catch (error) {
            showErrorToast(error instanceof Error ? error.message : 'Failed to create admin');
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <nav class="bg-white dark:bg-gray-800 shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex">
                    <div class="flex-shrink-0 flex items-center">
                        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
                    </div>
                </div>
                <div class="flex items-center">
                    <a
                        href="/admin/dashboard"
                        class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                        Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Admin</h2>
                <form on:submit|preventDefault={handleCreateAdmin} class="space-y-6">
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            bind:value={newAdmin.username}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            bind:value={newAdmin.password}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label for="secretKey" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Secret Key
                        </label>
                        <input
                            type="password"
                            id="secretKey"
                            bind:value={newAdmin.secretKey}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {#if loading}
                                <span class="flex items-center">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </span>
                            {:else}
                                Create Admin
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </main>
</div> 
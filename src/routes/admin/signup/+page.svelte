<!-- src/routes/admin/signup/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { showSuccessToast, showErrorToast } from '$lib/utils/toast';

    let loading = false;
    let formData = {
        username: '',
        password: ''
    };

    async function handleSubmit() {
        if (loading) return;
        if (!formData.username || !formData.password) {
            showErrorToast('All fields are required');
            return;
        }

        try {
            loading = true;
            const response = await fetch('/api/admin/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create admin account');
            }

            showSuccessToast('Admin account created successfully');
            goto('/admin/login');
        } catch (error) {
            showErrorToast(error instanceof Error ? error.message : 'Failed to create admin account');
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Create Admin Account
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Sign up to manage the donation platform
            </p>
        </div>
        <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
            <div class="rounded-md shadow-sm -space-y-px">
                <div>
                    <label for="username" class="sr-only">Username</label>
                    <input
                        id="username"
                        type="text"
                        required
                        bind:value={formData.username}
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                        placeholder="Username"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label for="password" class="sr-only">Password</label>
                    <input
                        id="password"
                        type="password"
                        required
                        bind:value={formData.password}
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                        placeholder="Password"
                        disabled={loading}
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                    {#if loading}
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </span>
                        Creating account...
                    {:else}
                        Create account
                    {/if}
                </button>
            </div>

            <div class="text-center">
                <a href="/admin/login" class="font-medium text-primary-600 hover:text-primary-500">
                    Already have an account? Sign in
                </a>
            </div>
        </form>
    </div>
</div> 
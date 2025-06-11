<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { SerializedProject } from '$lib/server/models/project';
    import { showSuccessToast, showErrorToast } from '$lib/utils/toast';

    export let project: SerializedProject;
    export let show = false;

    let amount = '';
    let phone = '';
    let loading = false;

    const dispatch = createEventDispatcher();

    function handleClose() {
        if (!loading) {
            dispatch('close');
        }
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        if (loading) return;

        try {
            loading = true;
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            showSuccessToast('Payment initiated. Please check your phone for the M-Pesa prompt.');
            setTimeout(() => {
                dispatch('close');
            }, 3000);
        } catch (e) {
            showErrorToast(e instanceof Error ? e.message : 'An unexpected error occurred');
        } finally {
            loading = false;
        }
    }
</script>

{#if show}
    <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto"
        on:click|self={handleClose}
        on:keydown={(e) => e.key === 'Escape' && handleClose()}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <div
            class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-[95%] sm:max-w-md shadow-xl transform transition-all"
        >
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white line-clamp-1">
                    Donate to {project.title}
                </h2>
                <button
                    class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                    on:click={handleClose}
                    disabled={loading}
                    aria-label="Close donation modal"
                >
                    <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form on:submit={handleSubmit} class="space-y-4">
                <div>
                    <label for="amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount (KES)
                    </label>
                    <input
                        type="number"
                        id="amount"
                        bind:value={amount}
                        min="1"
                        required
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-base sm:text-lg px-3 py-2"
                        disabled={loading}
                        placeholder="Enter amount"
                    />
                </div>

                <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        M-Pesa Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        bind:value={phone}
                        placeholder="254712345678"
                        pattern="^254[0-9]{9}$"
                        required
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-base sm:text-lg px-3 py-2"
                        disabled={loading}
                    />
                    <p class="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Format: 254XXXXXXXXX</p>
                </div>

                <div class="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        class="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
                        on:click={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Donate Now'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    /* Add line-clamp utility */
    :global(.line-clamp-1) {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style> 
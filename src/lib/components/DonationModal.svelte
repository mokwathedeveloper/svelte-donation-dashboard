<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { SerializedProject } from '$lib/server/models/project';
    import { showSuccessToast, showErrorToast } from '$lib/utils/toast';

    export let project: SerializedProject;
    export let show = false;

    let amount = '';
    let phone = '';
    let loading = false;
    let isValidPhone = false;

    const dispatch = createEventDispatcher();

    function formatPhoneNumber(input: string): string {
        // Remove all non-digit characters
        const cleaned = input.replace(/\D/g, '');
        
        // Format based on the length and starting digits
        if (cleaned.startsWith('254')) {
            return cleaned;
        } else if (cleaned.startsWith('0')) {
            return `254${cleaned.slice(1)}`;
        } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
            return `254${cleaned}`;
        }
        return cleaned;
    }

    function validatePhoneNumber(phone: string): boolean {
        const formatted = formatPhoneNumber(phone);
        // Check if it's a valid Safaricom number (254 followed by 7/1 and 8 more digits)
        return /^254[17]\d{8}$/.test(formatted);
    }

    function handlePhoneInput(e: Event) {
        const input = e.target as HTMLInputElement;
        const cursorPos = input.selectionStart || 0;
        const oldLength = input.value.length;
        
        // Format the number
        const formatted = formatPhoneNumber(input.value);
        phone = formatted;
        
        // Update validation state
        isValidPhone = validatePhoneNumber(formatted);
        
        // Restore cursor position accounting for length change
        setTimeout(() => {
            const newPos = Math.max(0, cursorPos + (formatted.length - oldLength));
            input.setSelectionRange(newPos, newPos);
        }, 0);
    }

    function handleClose() {
        if (!loading) {
            dispatch('close');
        }
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        if (loading) return;

        // Validate phone number
        if (!validatePhoneNumber(phone)) {
            showErrorToast('Please enter a valid Safaricom phone number (e.g., 254712345678)');
            return;
        }

        try {
            loading = true;
            const response = await fetch('/api/donations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectId: project._id,
                    amount: parseFloat(amount),
                    phone: formatPhoneNumber(phone)
                })
            });

            const result = await response.json();

            if (response.ok) {
                showSuccessToast('Payment initiated. Please check your phone for the M-Pesa prompt.');
                setTimeout(() => {
                    dispatch('close');
                }, 3000);
            } else {
                showErrorToast(result.error || 'Failed to process donation');
            }
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
                        required
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-base sm:text-lg px-3 py-2 {!isValidPhone && phone ? 'border-red-500' : ''}"
                        disabled={loading}
                        on:input={handlePhoneInput}
                    />
                    <p class="mt-1 text-sm {!isValidPhone && phone ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}">
                        {#if !isValidPhone && phone}
                            Please enter a valid Safaricom number (e.g., 254712345678)
                        {:else}
                            Format: 254712345678, 0712345678, or 712345678
                        {/if}
                    </p>
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
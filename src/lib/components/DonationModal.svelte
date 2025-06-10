<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { IProject } from '$lib/server/models/project';
    import { showToast } from '$lib/utils/toast';
    import { fade, scale } from 'svelte/transition';
    import type { Donation } from '$lib/types';

    export let project: IProject;
    export let show = false;
    export let donation: Donation;
    export let close: () => void;

    const dispatch = createEventDispatcher();

    let amount = '';
    let phoneNumber = '';
    let loading = false;
    let error: string | null = null;
    let success = false;
    let donationStatus: 'pending' | 'completed' | 'failed' | null = null;
    let statusCheckInterval: NodeJS.Timeout;
    let modalClass = 'opacity-0';

    setTimeout(() => {
        modalClass = 'opacity-100';
    }, 0);

    function handleClose() {
        modalClass = 'opacity-0';
        setTimeout(close, 300);
    }

    function resetForm() {
        amount = '';
        phoneNumber = '';
        error = null;
        success = false;
        donationStatus = null;
    }

    async function checkDonationStatus(donationId: string) {
        try {
            const response = await fetch(`/api/donations/${donationId}/status`);
            const data = await response.json();
            
            if (data.status === 'completed') {
                success = true;
                donationStatus = 'completed';
                clearInterval(statusCheckInterval);
                showToast('Thank you for your donation!', 'success');
            } else if (data.status === 'failed') {
                error = 'Payment failed. Please try again.';
                donationStatus = 'failed';
                clearInterval(statusCheckInterval);
                showToast('Payment failed. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Error checking donation status:', err);
        }
    }

    async function handleSubmit() {
        try {
            if (!amount || !phoneNumber) {
                error = 'Please fill in all fields';
                return;
            }

            loading = true;
            error = null;
            donationStatus = 'pending';

            const response = await fetch('/api/donate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: project._id,
                    amount: Number(amount),
                    phoneNumber,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to process donation');
            }

            showToast('Processing your donation...', 'success');
            // Start polling for donation status
            statusCheckInterval = setInterval(() => checkDonationStatus(data.donationId), 5000);

        } catch (err) {
            console.error('Error processing donation:', err);
            error = err instanceof Error ? err.message : 'An unexpected error occurred';
            donationStatus = 'failed';
            showToast(error, 'error');
        } finally {
            loading = false;
        }
    }

    $: modalClass = show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none';
</script>

<div class="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 {modalClass}">
    <button
        class="absolute inset-0 bg-black bg-opacity-50"
        on:click={handleClose}
        on:keydown={(e) => e.key === 'Escape' && handleClose()}
        aria-label="Close donation details"
    ></button>
    
    <div
        class="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 max-w-md w-full mx-4 relative z-10 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
        <div class="flex justify-between items-center mb-6">
            <h2 id="modal-title" class="text-xl font-semibold text-gray-900 dark:text-white">
                Donation Details
            </h2>
            <button
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                on:click={handleClose}
                aria-label="Close donation details"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <dl class="space-y-4">
            <div>
                <dt class="text-sm font-medium text-gray-700 dark:text-gray-300">Project</dt>
                <dd class="mt-1 text-gray-900 dark:text-white">{donation.projectTitle}</dd>
            </div>

            <div>
                <dt class="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</dt>
                <dd class="mt-1 text-gray-900 dark:text-white">KES {donation.amount.toLocaleString()}</dd>
            </div>

            <div>
                <dt class="text-sm font-medium text-gray-700 dark:text-gray-300">Status</dt>
                <dd class="mt-1 text-gray-900 dark:text-white capitalize">{donation.status}</dd>
            </div>

            <div>
                <dt class="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</dt>
                <dd class="mt-1 text-gray-900 dark:text-white">{donation.phoneNumber}</dd>
            </div>

            {#if donation.mpesaReceiptNumber}
                <div>
                    <dt class="text-sm font-medium text-gray-700 dark:text-gray-300">M-Pesa Receipt</dt>
                    <dd class="mt-1 text-gray-900 dark:text-white">{donation.mpesaReceiptNumber}</dd>
                </div>
            {/if}

            <div>
                <dt class="text-sm font-medium text-gray-700 dark:text-gray-300">Date</dt>
                <dd class="mt-1 text-gray-900 dark:text-white">{new Date(donation.createdAt).toLocaleString()}</dd>
            </div>
        </dl>
    </div>
</div> 
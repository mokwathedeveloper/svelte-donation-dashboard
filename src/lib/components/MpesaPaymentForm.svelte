<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';

    export let amount: number = 0;
    export let reference: string = '';
    export let isProcessing: boolean = false;
    export let showPhoneField: boolean = true;
    export let savedPhoneNumber: string = '';
    export let minAmount: number = 1;
    export let maxAmount: number = 150000;

    let phoneNumber: string = savedPhoneNumber;
    let error: string = '';
    let success: string = '';
    let showReceipt: boolean = false;
    let transactionDetails: any = null;
    let rememberPhone: boolean = false;
    let isValidPhone: boolean = false;

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
        phoneNumber = formatted;
        
        // Update validation state
        isValidPhone = validatePhoneNumber(formatted);
        
        // Restore cursor position accounting for length change
        setTimeout(() => {
            const newPos = Math.max(0, cursorPos + (formatted.length - oldLength));
            input.setSelectionRange(newPos, newPos);
        }, 0);
    }

    async function handleSubmit() {
        error = '';
        success = '';
        showReceipt = false;
        transactionDetails = null;
        
        // Format phone number
        const formattedPhone = formatPhoneNumber(phoneNumber);
        
        // Validate phone number
        if (!formattedPhone || !validatePhoneNumber(formattedPhone)) {
            error = 'Please enter a valid Safaricom phone number (e.g., 254712345678)';
            return;
        }

        if (!amount || amount < minAmount || amount > maxAmount) {
            error = `Please enter an amount between ${minAmount} and ${maxAmount}`;
            return;
        }

        isProcessing = true;

        try {
            const response = await fetch('/api/mpesa/stk-push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: formattedPhone,
                    amount,
                    reference
                }),
            });

            const result = await response.json();

            if (result.success) {
                success = 'Payment initiated. Please check your phone to complete the transaction.';
                transactionDetails = result.data;
                showReceipt = true;
                
                if (rememberPhone) {
                    localStorage.setItem('savedPhoneNumber', formattedPhone);
                }
                
                dispatch('success', result.data);
            } else {
                error = result.message || 'Failed to initiate payment';
                dispatch('error', { message: error });
            }
        } catch (e) {
            error = e instanceof Error ? e.message : 'An error occurred';
            dispatch('error', { message: error });
        } finally {
            isProcessing = false;
        }
    }

    function formatAmount(value: number): string {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(value);
    }
</script>

<div class="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">M-Pesa Payment</h2>

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        {#if showPhoneField}
            <div>
                <label for="phoneNumber" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    M-Pesa Phone Number
                </label>
                <div class="mt-1 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-500 sm:text-sm">+</span>
                    </div>
                    <input
                        type="tel"
                        id="phoneNumber"
                        bind:value={phoneNumber}
                        placeholder="254712345678"
                        class="block w-full pl-7 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white {!isValidPhone && phoneNumber ? 'border-red-500' : ''}"
                        disabled={isProcessing}
                        on:input={handlePhoneInput}
                    />
                </div>
                <p class="mt-1 text-sm {!isValidPhone && phoneNumber ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}">
                    {#if !isValidPhone && phoneNumber}
                        Please enter a valid Safaricom number (e.g., 254712345678)
                    {:else}
                        Format: 254712345678, 0712345678, or 712345678
                    {/if}
                </p>
            </div>

            <div class="flex items-center">
                <input
                    type="checkbox"
                    id="rememberPhone"
                    bind:checked={rememberPhone}
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="rememberPhone" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember phone number
                </label>
            </div>
        {/if}

        <div>
            <label for="amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (KES)
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">KES</span>
                </div>
                <input
                    type="number"
                    id="amount"
                    bind:value={amount}
                    min={minAmount}
                    max={maxAmount}
                    step="1"
                    class="block w-full pl-12 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    disabled={isProcessing}
                />
            </div>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Min: {formatAmount(minAmount)} | Max: {formatAmount(maxAmount)}
            </p>
        </div>

        {#if error}
            <div class="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded" transition:fade>
                {error}
            </div>
        {/if}

        {#if success}
            <div class="text-green-500 text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded" transition:fade>
                {success}
            </div>
        {/if}

        {#if showReceipt && transactionDetails}
            <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Transaction Details</h3>
                <dl class="space-y-2">
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Amount:</dt>
                        <dd class="text-sm text-gray-900 dark:text-white">{formatAmount(amount)}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Reference:</dt>
                        <dd class="text-sm text-gray-900 dark:text-white">{reference}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Request ID:</dt>
                        <dd class="text-sm text-gray-900 dark:text-white">{transactionDetails.CheckoutRequestID}</dd>
                    </div>
                </dl>
            </div>
        {/if}

        <button
            type="submit"
            class="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isProcessing}
        >
            {#if isProcessing}
                <span class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </span>
            {:else}
                Pay with M-Pesa
            {/if}
        </button>
    </form>
</div> 
<script>
  import { createEventDispatcher } from 'svelte';
  
  export let project;
  
  const dispatch = createEventDispatcher();
  
  let amount = '';
  let phoneNumber = '';
  let isLoading = false;
  let error = '';
  let success = '';
  
  function formatPhoneNumber(value) {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as 0XXX XXX XXX
    if (cleaned.length <= 10) {
      if (cleaned.startsWith('254')) {
        const local = cleaned.substring(3);
        return local.replace(/(\d{3})(\d{3})(\d{3})/, '0$1 $2 $3');
      } else if (cleaned.startsWith('0')) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
      } else if (cleaned.length >= 9) {
        return '0' + cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
      }
    }
    return value;
  }
  
  function handlePhoneInput(event) {
    const formatted = formatPhoneNumber(event.target.value);
    phoneNumber = formatted;
  }
  
  function validateForm() {
    error = '';
    
    if (!amount || parseFloat(amount) < 1) {
      error = 'Please enter a valid amount (minimum KES 1)';
      return false;
    }
    
    if (parseFloat(amount) > 150000) {
      error = 'Maximum donation amount is KES 150,000';
      return false;
    }
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      error = 'Please enter a valid phone number';
      return false;
    }
    
    return true;
  }
  
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isLoading = true;
    error = '';
    success = '';
    
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('0') 
        ? '254' + cleanPhone.substring(1)
        : cleanPhone.startsWith('254') 
        ? cleanPhone 
        : '254' + cleanPhone;
      
      const response = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: project._id,
          amount: parseFloat(amount),
          phoneNumber: formattedPhone
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        success = 'Payment request sent! Please check your phone and enter your M-Pesa PIN.';
        dispatch('success', result);
        
        // Reset form
        amount = '';
        phoneNumber = '';
      } else {
        error = result.error || 'Failed to initiate payment. Please try again.';
      }
    } catch (err) {
      error = 'Network error. Please check your connection and try again.';
      console.error('Donation error:', err);
    } finally {
      isLoading = false;
    }
  }
  
  function formatCurrency(value) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(value);
  }
</script>

<div class="card p-6">
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Donate to {project.title}
    </h2>
    <p class="text-gray-600 dark:text-gray-300">
      Support this project with a secure M-Pesa donation
    </p>
  </div>
  
  {#if error}
    <div class="mb-4 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
      <p class="text-danger-700 dark:text-danger-300 text-sm">{error}</p>
    </div>
  {/if}
  
  {#if success}
    <div class="mb-4 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
      <p class="text-success-700 dark:text-success-300 text-sm">{success}</p>
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Donation Amount (KES)
      </label>
      <input
        type="number"
        id="amount"
        bind:value={amount}
        min="1"
        max="150000"
        step="1"
        placeholder="Enter amount"
        class="input"
        required
        disabled={isLoading}
      />
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Minimum: KES 1 | Maximum: KES 150,000
      </p>
    </div>
    
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        M-Pesa Phone Number
      </label>
      <input
        type="tel"
        id="phone"
        value={phoneNumber}
        on:input={handlePhoneInput}
        placeholder="0712 345 678"
        class="input"
        required
        disabled={isLoading}
      />
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Enter your Safaricom number (e.g., 0712 345 678)
      </p>
    </div>
    
    {#if amount && parseFloat(amount) > 0}
      <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 class="font-medium text-gray-900 dark:text-white mb-2">Donation Summary</h3>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Project:</span>
            <span class="text-gray-900 dark:text-white">{project.title}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Amount:</span>
            <span class="text-gray-900 dark:text-white font-medium">{formatCurrency(parseFloat(amount) || 0)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Payment Method:</span>
            <span class="text-gray-900 dark:text-white">M-Pesa</span>
          </div>
        </div>
      </div>
    {/if}
    
    <button
      type="submit"
      class="btn btn-primary w-full"
      disabled={isLoading || !amount || !phoneNumber}
    >
      {#if isLoading}
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      {:else}
        Donate with M-Pesa
      {/if}
    </button>
  </form>
  
  <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
    <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">How it works:</h4>
    <ol class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
      <li>1. Enter your donation amount and M-Pesa number</li>
      <li>2. Click "Donate with M-Pesa" to initiate payment</li>
      <li>3. You'll receive an M-Pesa prompt on your phone</li>
      <li>4. Enter your M-Pesa PIN to complete the donation</li>
      <li>5. You'll receive a confirmation SMS from M-Pesa</li>
    </ol>
  </div>
</div>

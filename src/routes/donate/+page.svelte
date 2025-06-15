<script>
  import DonationForm from '$lib/components/DonationForm.svelte';
  import { goto } from '$app/navigation';
  
  export let data;
  
  $: project = data.project;
  
  function handleDonationSuccess(event) {
    // You could show a success modal or redirect to a thank you page
    console.log('Donation initiated:', event.detail);
  }
  
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  $: progress = Math.min((project.raised / project.goal) * 100, 100);
</script>

<svelte:head>
  <title>Donate to {project.title} - DonationHub</title>
  <meta name="description" content="Support {project.title} with a secure M-Pesa donation. Every contribution helps make a difference." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Back Button -->
  <div class="mb-6">
    <button
      on:click={() => goto('/')}
      class="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
    >
      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path>
      </svg>
      Back to Projects
    </button>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Project Details -->
    <div class="space-y-6">
      <div class="card p-6">
        {#if project.image}
          <div class="mb-6 rounded-lg overflow-hidden">
            <img 
              src={project.image} 
              alt={project.title}
              class="w-full h-64 object-cover"
            />
          </div>
        {/if}
        
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {project.title}
        </h1>
        
        <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {project.description}
        </p>
        
        <!-- Progress Section -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Funding Progress
            </span>
            <span class="text-sm font-medium text-progress-600 dark:text-progress-400">
              {progress.toFixed(1)}%
            </span>
          </div>
          
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              style="width: {progress}%"
            ></div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(project.raised)}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Raised
              </div>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(project.goal)}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Goal
              </div>
            </div>
          </div>
          
          {#if project.raised < project.goal}
            <div class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p class="text-sm text-primary-700 dark:text-primary-300">
                <span class="font-medium">{formatCurrency(project.goal - project.raised)}</span> 
                still needed to reach the funding goal
              </p>
            </div>
          {:else}
            <div class="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
              <p class="text-sm text-success-700 dark:text-success-300 font-medium">
                Funding goal achieved! Additional donations will help expand the project's impact.
              </p>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Security Notice -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Secure & Anonymous Donations
        </h3>
        <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span>Your donation is completely anonymous - no personal information is stored</span>
          </div>
          <div class="flex items-start">
            <svg class="w-5 h-5 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span>Payments are processed securely through Safaricom M-Pesa</span>
          </div>
          <div class="flex items-start">
            <svg class="w-5 h-5 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span>You'll receive an M-Pesa confirmation SMS upon successful donation</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Donation Form -->
    <div>
      <DonationForm {project} on:success={handleDonationSuccess} />
    </div>
  </div>
</div>

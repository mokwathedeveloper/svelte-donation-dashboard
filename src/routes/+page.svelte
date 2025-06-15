<script lang="ts">
  import ProjectCard from '$lib/components/ProjectCard.svelte';

  export let data;

  $: projects = data.projects || [];

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }

  $: totalRaised = projects.reduce((sum, project) => sum + project.raised, 0);
  $: totalGoal = projects.reduce((sum, project) => sum + project.goal, 0);
  $: activeProjects = projects.length;
</script>

<svelte:head>
  <title>DonationHub - Support Social Projects</title>
  <meta name="description" content="Support social projects through anonymous donations with M-Pesa integration. Make a difference in your community today." />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-6">
        Support Social Projects
      </h1>
      <p class="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
        Make anonymous donations to meaningful social projects in your community.
        Every contribution counts towards building a better future.
      </p>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-white">
            {formatCurrency(totalRaised)}
          </div>
          <div class="text-primary-200 mt-2">Total Raised</div>
        </div>
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-white">
            {activeProjects}
          </div>
          <div class="text-primary-200 mt-2">Active Projects</div>
        </div>
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-white">
            {formatCurrency(totalGoal)}
          </div>
          <div class="text-primary-200 mt-2">Total Goal</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Projects Section -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <div class="text-center mb-12">
    <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
      Current Projects
    </h2>
    <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
      Choose a project that resonates with you and make a secure donation using M-Pesa.
      No registration required - your donation is completely anonymous.
    </p>
  </div>

  {#if projects.length > 0}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each projects as project (project._id)}
        <ProjectCard {project} />
      {/each}
    </div>
  {:else}
    <div class="text-center py-16">
      <div class="w-24 h-24 mx-auto mb-6 text-gray-400 dark:text-gray-600">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
        No Active Projects
      </h3>
      <p class="text-gray-600 dark:text-gray-300">
        There are currently no active projects. Please check back later.
      </p>
    </div>
  {/if}
</section>

<!-- How It Works Section -->
<section class="bg-gray-100 dark:bg-gray-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        How It Works
      </h2>
      <p class="text-lg text-gray-600 dark:text-gray-300">
        Making a donation is simple and secure
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
          1
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Choose Project
        </h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          Browse and select a social project that you want to support
        </p>
      </div>

      <div class="text-center">
        <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
          2
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Enter Details
        </h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          Enter your donation amount and M-Pesa phone number
        </p>
      </div>

      <div class="text-center">
        <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
          3
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Complete Payment
        </h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          Receive M-Pesa prompt and enter your PIN to complete donation
        </p>
      </div>

      <div class="text-center">
        <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
          4
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Make Impact
        </h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          Your anonymous donation helps fund important social projects
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <div class="text-center mb-12">
    <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
      Why Choose DonationHub?
    </h2>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div class="text-center">
      <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Secure & Anonymous
      </h3>
      <p class="text-gray-600 dark:text-gray-300 text-sm">
        Your donations are completely anonymous and processed securely through M-Pesa
      </p>
    </div>

    <div class="text-center">
      <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        M-Pesa Integration
      </h3>
      <p class="text-gray-600 dark:text-gray-300 text-sm">
        Easy and familiar payment process using your M-Pesa mobile money account
      </p>
    </div>

    <div class="text-center">
      <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Transparent Impact
      </h3>
      <p class="text-gray-600 dark:text-gray-300 text-sm">
        Track project progress and see exactly how your donations are making a difference
      </p>
    </div>
  </div>
</section>

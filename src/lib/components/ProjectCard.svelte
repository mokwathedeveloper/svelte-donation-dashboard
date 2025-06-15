<script>
  export let project;
  
  $: progress = Math.min((project.raised / project.goal) * 100, 100);
  $: remaining = Math.max(project.goal - project.raised, 0);
  
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }
</script>

<div class="card p-6 hover:shadow-lg transition-shadow duration-300 animate-fade-in">
  {#if project.image}
    <div class="mb-4 rounded-lg overflow-hidden">
      <img
        src={project.image}
        alt={project.title}
        class="w-full h-48 object-cover"
      />
    </div>
  {/if}

  <div class="mb-4">
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {project.title}
    </h3>
    <p class="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
      {project.description}
    </p>
  </div>

  <div class="mb-4">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Progress
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

    <div class="flex justify-between items-center mt-2 text-sm">
      <span class="text-gray-600 dark:text-gray-400">
        Raised: {formatCurrency(project.raised)}
      </span>
      <span class="text-gray-600 dark:text-gray-400">
        Goal: {formatCurrency(project.goal)}
      </span>
    </div>
  </div>

  {#if remaining > 0}
    <div class="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
      <p class="text-sm text-primary-700 dark:text-primary-300">
        <span class="font-medium">{formatCurrency(remaining)}</span> needed to reach the goal
      </p>
    </div>
  {:else}
    <div class="mb-4 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
      <p class="text-sm text-success-700 dark:text-success-300 font-medium">
        Goal achieved! Thank you for your support.
      </p>
    </div>
  {/if}

  <div class="flex gap-3">
    <a
      href="/donate?project={project._id}"
      class="btn btn-primary flex-1 text-center"
      class:opacity-50={project.status !== 'active'}
      class:cursor-not-allowed={project.status !== 'active'}
    >
      {project.status === 'active' ? 'Donate Now' : 'Project Inactive'}
    </a>

    <button
      class="btn btn-secondary px-3"
      title="Share project"
      aria-label="Share project"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
      </svg>
    </button>
  </div>
</div>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>

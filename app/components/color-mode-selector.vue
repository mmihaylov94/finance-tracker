<template>
	<div class="flex space-x-2 items-center">
		<div class="text-gray-500 text-xs" v-if="showNextModeLabel">Change to {{ nextMode }}</div>
		<button @click="toggleMode" @mouseenter="showNextModeLabel = true" @mouseleave="showNextModeLabel = false"
			class="hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 text-gray-500 text-4xl md:text-base">{{ nextModeIcon
			}}</button>
	</div>
</template>

<script setup>
const colorMode = useColorMode();
const showNextModeLabel = ref(false);

const modes = [
	'system',
	'light',
	'dark'
];

const nextModeIcons = {
	system: '🌓',
	light: '🌕',
	dark: '🌑'
}

const nextModeIcon = computed(() => nextModeIcons[nextMode.value]);

const nextMode = computed(() => {
	const i = modes.indexOf(colorMode.preference);
	return modes[(i + 1) % modes.length];
});

const toggleMode = () => colorMode.preference = nextMode.value;
</script>
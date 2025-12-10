<template>
	<div class="grid grid-cols-3 py-4 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
		<div class="flex items-center justify-between space-x-4 col-span-2">
			<div class="flex items-center space-x-1">
				<UIcon :name="icon" :class="[iconColor]"></UIcon>
				<div>{{ transaction.description }}</div>
			</div>
			<div>
				<UBadge color="neutral" variant="outline" v-if="transaction.category">
					{{ transaction.category }}</UBadge>
			</div>
		</div>
		<div class="flex items-center justify-end space-x-4">
			<div>{{ currency }}</div>
			<div>
					<UDropdownMenu :items="items" :content="{ align: 'start', side: 'bottom', sideOffset: 8 }"
					:ui="{ content: 'w-48' }">
					<UButton icon="i-heroicons-ellipsis-horizontal" color="neutral" variant="outline" :loading="isLoading" />
					<TransactionModal v-model="isOpen" :transaction="transaction" @saved="emit('updated')" />
				</UDropdownMenu>
			</div>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	transaction: Object
});

const emit = defineEmits(['deleted', 'updated']);

const isIncome = computed(() => props.transaction.type === 'Income');
const icon = computed(() => isIncome.value ? 'i-heroicons-arrow-up-right' : 'i-heroicons-arrow-down-left')
const iconColor = computed(() => isIncome.value ? 'text-green-600' : 'text-red-600');

const isLoading = ref(false);
const { toastSuccess, toastError } = useAppToast();
const supabase = useSupabaseClient();

const isOpen = ref(false);

const deleteTransaction = async () => {
	isLoading.value = true;
	try {
		await supabase.from('transactions').delete().eq('id', props.transaction.id);

		toastSuccess({
			title: 'Transaction deleted'
		});
		emit('deleted', props.transaction.id);
	} catch (error) {
		toastError({
			title: 'Transaction was not deleted'
		});
	} finally {
		isLoading.value = false;
	}
};


const { currency } = useCurrency(props.transaction.amount);
const items = [
	{
		label: 'Edit',
		icon: 'i-heroicons-pencil-square-20-solid',
		onClick: () => isOpen.value = true
	},
	{
		label: 'Delete',
		icon: 'i-heroicons-trash-20-solid',
		onClick: deleteTransaction
	}
];
</script>
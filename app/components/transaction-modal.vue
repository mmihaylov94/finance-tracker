<template>
	<UModal v-model:open="isOpen">
		<template #header>
			{{ isEditing ? 'Edit' : 'Add' }} Transaction
		</template>
		<template #body>
			<UForm :state="state" :schema="schema" ref="form" @submit="save">
				<UFormField label="Transaction Type" :required="true" name="type" class="mb-4">
					<USelect :disabled="isEditing" placeholder="Select the transaction type" :items="types" class="w-full"
						v-model="state.type">
					</USelect>
				</UFormField>
				<UFormField label="Amount" :required="true" name="amount" class="mb-4">
					<UInput type="number" placeholder="Amount" class="w-full" v-model.number="state.amount"></UInput>
				</UFormField>
				<UFormField label="Transaction Date" :required="true" name="created_at" class="mb-4">
					<UInput type="date" icon="i-heroicons-calendar-days-20-solid" class="w-full" v-model="state.created_at">
					</UInput>
				</UFormField>
				<UFormField label="Description" hint="Optional" name="description" class="mb-4">
					<UInput placeholder="Description" class="w-full" v-model="state.description"></UInput>
				</UFormField>
				<UFormField label="Category" :required="true" name="category" class="mb-4" v-if="state.type === 'Expense'">
					<USelect placeholder="Category" :items="categories" class="w-full" v-model="state.category"></USelect>
				</UFormField>

				<UButton type="submit" color="primary" variant="solid" label="Save" :loading="isLoading"></UButton>
			</UForm>
		</template>
	</UModal>
</template>

<script setup>
import { categories, types } from '~/constants';
import { z } from 'zod';

const props = defineProps({
	modelValue: Boolean,
	transaction: {
		type: Object,
		required: false
	}
});

const emit = defineEmits(['update:modelValue', 'saved']);

const isEditing = computed(() => !!props.transaction);

const initialState = isEditing.value ? {
	type: props.transaction.type,
	amount: props.transaction.amount,
	created_at: props.transaction.created_at.split('T')[0],
	description: props.transaction.description,
	category: props.transaction.category
} : {
	type: 'Income',
	amount: 0,
	created_at: undefined,
	description: undefined,
	category: undefined
};

const state = ref({ ...initialState });

const resetForm = () => {
	Object.assign(state.value, initialState);
	form.value.clear();
}

const defaultSchema = z.object({
	amount: z.number().positive('Amount needs to be more than 0.'),
	created_at: z.string(),
	description: z.string().optional()
});

const incomeSchema = z.object({
	type: z.literal('Income'),
});

const expenseSchema = z.object({
	type: z.literal('Expense'),
	category: z.enum(categories)
});

const investmentSchema = z.object({
	type: z.literal('Investment'),
});

const savingsSchema = z.object({
	type: z.literal('Savings'),
});

const schema = z.intersection(
	z.discriminatedUnion('type', [incomeSchema, expenseSchema, investmentSchema, savingsSchema]),
	defaultSchema
)

const form = ref();
const isLoading = ref(false);
const supabase = useSupabaseClient();
const { toastSuccess, toastError } = useAppToast();

const save = async () => {
	if (form.value.errors.length) return;

	isLoading.value = true;
	try {
		const { error } = await supabase.from('transactions').upsert({ ...state.value, id: props.transaction?.id });

		if (!error) {
			toastSuccess({
				title: 'Transaction Saved'
			});
		}
		isOpen.value = false;
		emit('saved');
	} catch (e) {
		toastError({
			title: 'Transacction not saved',
			description: e.message
		})
	} finally {
		isLoading.value = false;
	}
}

const isOpen = computed({
	get: () => props.modelValue,
	set: (value) => {
		if (!value) resetForm();
		emit('update:modelValue', value)
	}
});
</script>
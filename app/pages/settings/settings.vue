<template>
	<UForm :state="state" :schema="schema" @submit.prevent="saveSettings">
		<UFormField label="Transaction View" class="mb-4" help="Choose how you would like to view transactions">
			<USelect v-model="state.transactionView" :items="transactionViewOptions" class="w-full" />
		</UFormField>

		<UButton type="submit" color="primary" variant="solid" label="Save" :loading="pending" :disabled="pending" />
	</UForm>
</template>

<script setup>
import { z } from 'zod'
import { transactionViewOptions } from '~/constants';

const { supabase, user } = await useGetUserDetais();

const { toastSuccess, toastError } = useAppToast()
const pending = ref(false)
const state = ref({
	transactionView: user.value.user_metadata.transaction_view ?? transactionViewOptions[1]
})

const schema = z.object({
	transactionView: z.enum(transactionViewOptions)
})

const saveSettings = async () => {
	pending.value = true

	try {
		const { error } = await supabase.auth.updateUser({
			data: {
				transaction_view: state.value.transactionView
			}
		})

		if (error) throw error

		toastSuccess({
			title: 'Settings updated',
		})
	} catch (error) {
		toastError({
			title: 'Error updating settings',
			description: error.message,
		})
	} finally {
		pending.value = false
	}
}
</script>
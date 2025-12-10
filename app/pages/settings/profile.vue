<template>
	<UForm :state="state" :schema="schema" @submit="saveProfile">
		<UFormField class="mb-4" label="Full Name" name="name">
			<UInput v-model="state.name" class="w-full" />
		</UFormField>
		<UFormField class="mb-4" label="Email" name="email"
			help="You will receive a confirmation email on both the old and new addresses if you modify your email">
			<UInput v-model="state.email" class="w-full" />
		</UFormField>

		<UButton type="submit" color="primary" variant="solid" label="Save" :loading="pending" :disabled="pending" />
	</UForm>
</template>

<script setup>
import { z } from 'zod'

const { supabase, user } = await useGetUserDetais();

const { toastSuccess, toastError } = useAppToast();
const pending = ref(false);

const state = ref({
	name: user.value.user_metadata?.full_name,
	email: user.value.email
});

const schema = z.object({
	name: z.string().min(2).optional(),
	email: z.email()
});

const saveProfile = async () => {
	pending.value = true;

	try {
		const updatedData = {
			data: {
				full_name: state.value.name
			}
		};

		if (state.value.email !== user.value.email) {
			updatedData.email = state.value.email;
		}

		const { data, error } = await supabase.auth.updateUser(updatedData)

		console.log(data);

		if (error) throw error;
		if (data?.user) user.value = data.user;

		toastSuccess({ title: 'Profile updated' })
	} catch (e) {
		toastError({
			title: 'Error updating profile',
			description: e.message
		})
	} finally {
		pending.value = false;
	}
}
</script>
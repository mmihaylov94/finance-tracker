<template>
	<div>
		<div class="mb-4">
			<UFormField label="Current avatar" class="w-full" help="This would be blank by default">
				<ClientOnly>
					<UAvatar :src="avatarUrl" size="3xl" />
				</ClientOnly>
			</UFormField>
		</div>

		<div class="mb-4">
			<UFormField label="New avatar" class="w-full" name="avatar"
				help="After choosing an image click Save to actually upload the new avatar">
				<UFileUpload v-model="fileInput" accept="image/*" class="w-full min-h-32" />
			</UFormField>
		</div>

		<UButton type="submit" color="primary" variant="solid" label="Save" :loading="uploading" :disabled="uploading"
			@click="saveAvatar" />
	</div>
</template>

<script setup>
const { supabase, user, avatarUrl } = await useGetUserDetais();

// We need to get the actual avatar URL
const { toastSuccess, toastError } = useAppToast()

const uploading = ref(false)
const fileInput = ref(null) // Reference to an input with ref="fileInput" attribute

const saveAvatar = async () => {
	if (!fileInput.value) {
		toastError({ title: 'Select a file to upload first!' });
		return;
	}

	const file = fileInput.value;

	const fileExt = file.name.split('.').pop();
	const fileName = `${Math.random()}.${fileExt}`;

	try {
		uploading.value = true
		const currentAvatarUrl = user.value.user_metadata?.avatar_url;
		const { error } = await supabase.storage.from('avatars').upload(fileName, file);

		if (error) throw error;
		const { data: updateUserData, error: updateUserError } = await supabase.auth.updateUser({
			data: {
				avatar_url: fileName
			}
		});

		if (updateUserError) throw updateUserError;
		if (updateUserData.user) user.value = updateUserData.user;

		if (currentAvatarUrl) {
			const { error: fileDeleteError } = await supabase.storage.from('avatars').remove([currentAvatarUrl]);
			if (fileDeleteError) throw fileDeleteError;
		}

		fileInput.value = null;

		toastSuccess({
			title: 'Avatar uploaded',
		})
	} catch (error) {
		toastError({
			title: 'Error uploading avatar',
			description: error.message
		})
	} finally {
		uploading.value = false
	}
}
</script>
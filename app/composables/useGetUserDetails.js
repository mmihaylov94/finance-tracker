export const useGetUserDetais = async () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const { data, error } = await supabase.auth.getUser()
  if (!error && data.user) user.value = data.user

  const avatarUrl = ref(null)

  const refreshAvatarUrl = async () => {
    if (!user.value?.user_metadata?.avatar_url) {
      avatarUrl.value = null
      return
    }

    const { data, error } = await supabase
      .storage
      .from('avatars')
      .createSignedUrl(user.value.user_metadata.avatar_url, 60 * 60)

    if (!error && data?.signedUrl) {
      avatarUrl.value = data.signedUrl
    }
  }

  if (import.meta.client) {
    watch(user, () => {refreshAvatarUrl()}, { immediate: true, deep: true })
  }

  return {
    supabase,
    user,
    avatarUrl
  }
}

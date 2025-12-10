export const useFetchTransactions = async (period) => {
	const supabase = useSupabaseClient();

	const { data, pending, refresh } = await useAsyncData(`transactions-${period.value.from.toDateString()}-${period.value.to.toDateString()}`, async () => {
		const { data, error } = await supabase
			.from('transactions')
			.select()
			.gte('created_at', period.value.from.toISOString())
			.lte('created_at', period.value.to.toISOString())
			.order('created_at', { ascending: false });
		
			if (error) return [];
		return data;
	});

	watch(period, async() => await refresh());

	const transactionsGroupedByDate = computed(() => {
		let grouped = {};

		for (const transaction of data.value) {
			const date = transaction.created_at.split('T')[0];

			if (!grouped[date]) grouped[date] = [];

			grouped[date].push(transaction);
		}

		// const sortedKeys = Object.keys(grouped).sort().reverse();
		// const sortedGrouped = {};
		// for (const key of sortedKeys) {
		//   sortedGroup[key] = grouped[key];
		// }

		return grouped;
	});

	const income = computed(() => (data.value || []).filter(t => t.type === 'Income'));
	const expense = computed(() => (data.value || []).filter(t => t.type === 'Expense'));

	const incomeCount = computed(() => income.value.length);
	const expenseCount = computed(() => expense.value.length);

	const incomeTotal = computed(() => income.value.reduce(((sum, transaction) => sum + transaction.amount), 0));
	const expenseTotal = computed(() => expense.value.reduce(((sum, transaction) => sum + transaction.amount), 0));

	return {
		transactions: {
			all: data,
			grouped: {
				byDate: transactionsGroupedByDate
			},
			income,
			expense,
			incomeTotal,
			expenseTotal,
			incomeCount,
			expenseCount
		},
		refresh,
		pending
	}
}
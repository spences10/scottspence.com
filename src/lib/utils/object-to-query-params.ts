export const object_to_query_params = (
	obj: { [s: string]: unknown } | ArrayLike<unknown>,
) => {
	const params = Object.entries(obj).map(
		([key, value]) =>
			`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
	)
	return '?' + params.join('&')
}

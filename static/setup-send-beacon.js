function get_session_data_from_cookie() {
	const cookies = document.cookie.split(';');
	const session_cookie = cookies.find((cookie) =>
		cookie.trim().startsWith('session-data='),
	);
	return session_cookie
		? JSON.parse(decodeURIComponent(session_cookie.split('=')[1]))
		: null;
}

function delete_session_cookie() {
  // Set the session cookie to a past date, effectively deleting it
  document.cookie =
    'session-data=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

window.addEventListener('beforeunload', () => {
	const session_data = get_session_data_from_cookie();
	if (session_data) {
		navigator.sendBeacon(
			'/session-end',
			JSON.stringify(session_data),
		);
		delete_session_cookie();
	}
});

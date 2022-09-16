import { error } from '@sveltejs/kit';
import { api } from './api';

/**
 * @typedef {{
 *   uid: string;
 *   created_at: Date;
 *   text: string;
 *   done: boolean;
 *   pending_delete: boolean;
 * }} Todo
 */

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	// locals.userid comes from src/hooks.js
	const response = await api('GET', `todos/${locals.userid}`);

	if (response.status === 404) {
		// user hasn't created a todo list.
		// start with an empty array
		return {
			/** @type {Todo[]} */
			todos: []
		};
	}

	if (response.status === 200) {
		return {
			/** @type {Todo[]} */
			todos: await response.json()
		};
	}

	throw error(response.status);
};

/** @type {import('./$types').Actions} */
export const actions = {
	add: async ({ request, locals }) => {
		const form = await request.formData();

		await api('POST', `todos/${locals.userid}`, {
			text: form.get('text')
		});
	},
	edit: async ({ request, locals }) => {
		const form = await request.formData();

		await api('PATCH', `todos/${locals.userid}/${form.get('uid')}`, {
			text: form.get('text')
		});
	},
	toggle: async ({ request, locals }) => {
		const form = await request.formData();

		await api('PATCH', `todos/${locals.userid}/${form.get('uid')}`, {
			done: !!form.get('done')
		});
	},
	delete: async ({ request, locals }) => {
		const form = await request.formData();

		await api('DELETE', `todos/${locals.userid}/${form.get('uid')}`);
	}
};

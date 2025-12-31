const base_url = 'https://res.cloudinary.com/defkmsrpw/image/upload'
const default_params = 'c_fill,g_faces,c_thumb,q_auto,f_auto'
const square_params = `w_800,h_800,${default_params}`
const thumb_params = `w_100,h_100,${default_params}`
const public_id = 'scottspence.com/upscaled-media'

// Array of file names
const file_names = [
	'scott-mug-face-no-bg',
	'scott-goodlord-office',
	'scott-tall',
	'scott-mug-face',
	'scott-presents-connect-tech-1',
	'scott-profile',
	'scott-at-svelte-london-aug-2023-1',
	'scott-at-svelte-london-aug-2023-2',
	'scott-at-svelte-london-aug-2023-3',
	'scott-at-pixel-pioneers-2023-1',
	'scott-at-pixel-pioneers-2023-2',
	'scott-at-svelte-london-hyde-park',
]

// Generate the images array
export const images = file_names.map((fileName) => ({
	url: `${base_url}/${public_id}/${fileName}`,
	square: `${base_url}/${square_params}/${public_id}/${fileName}`,
	thumb: `${base_url}/${thumb_params}/${public_id}/${fileName}`,
	alt: `Scott Spence ${fileName.split('.')[0].replace(/-/g, ' ')}`,
}))

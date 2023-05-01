let base_url = 'https://res.cloudinary.com/defkmsrpw/image/upload'
let square_params = 'w_800,h_800,c_fill,g_faces,q_auto,f_auto'
let thumb_params = 'w_100,h_100,c_fill,g_faces,c_thumb,q_auto,f_auto'
let public_id = 'scottspence.com/upscaled-media'

// Array of file names
const fileNames = [
  'scott-mug-face-no-bg.jpg',
  'scott-goodlord-office.jpg',
  'scott-tall.jpg',
  'scott-mug-face.jpg',
  'scott-presents-connect-tech-1.jpg',
  'scott-profile.jpg',
]

// Generate the images array
export const images = fileNames.map(fileName => ({
  url: `${base_url}/${public_id}/${fileName}`,
  square: `${base_url}/${square_params}/${public_id}/${fileName}`,
  thumb: `${base_url}/${thumb_params}/${public_id}/${fileName}`,
  alt: `Scott Spence ${fileName.split('.')[0].replace(/-/g, ' ')}`,
}))

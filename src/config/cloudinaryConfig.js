import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({ 
  cloud_name: 'dz6wm8c39', 
  api_key: '246777671678596', 
  api_secret: 'EQlUKZDYLBvMHhPDoL8o-Cev2Wk'
});

export default cloudinary;

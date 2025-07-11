// lib/tailwind.ts

import { create } from 'tailwind-react-native-classnames';
import tailwindConfig from '../tailwind.config.js'; // ← import文に変更

const tw = create(tailwindConfig);

export default tw;
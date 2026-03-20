import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

/**
 * Maps a FontAwesome class string (e.g. "fas fa-wrench" or bare "wrench")
 * to the closest Ionicons icon name.
 */
const FA_MAP: Record<string, IoniconsName> = {
  // Common UI
  home:             'home-outline',
  house:            'home-outline',
  user:             'person-outline',
  users:            'people-outline',
  'user-friends':   'people-outline',
  'user-group':     'people-outline',
  search:           'search-outline',
  star:             'star-outline',
  heart:            'heart-outline',
  bell:             'notifications-outline',
  check:            'checkmark-outline',
  'check-circle':   'checkmark-circle-outline',
  times:            'close-outline',
  'times-circle':   'close-circle-outline',
  'info-circle':    'information-circle-outline',
  'exclamation-circle': 'alert-circle-outline',
  'exclamation-triangle': 'warning-outline',
  'question-circle': 'help-circle-outline',
  eye:              'eye-outline',
  'eye-slash':      'eye-off-outline',
  // Marketplace / classifieds
  tag:              'pricetag-outline',
  tags:             'pricetags-outline',
  'shopping-cart':  'cart-outline',
  store:            'storefront-outline',
  box:              'cube-outline',
  'box-open':       'cube-outline',
  archive:          'archive-outline',
  gift:             'gift-outline',
  // Tools / settings
  cog:              'settings-outline',
  wrench:           'construct-outline',
  tools:            'construct-outline',
  hammer:           'hammer-outline',
  'paint-brush':    'brush-outline',
  recycle:          'refresh-circle-outline',
  // Communication
  envelope:         'mail-outline',
  phone:            'call-outline',
  comment:          'chatbubble-outline',
  comments:         'chatbubbles-outline',
  share:            'share-outline',
  // Location
  'map-marker':     'location-outline',
  'map-marker-alt': 'location-outline',
  map:              'map-outline',
  compass:          'compass-outline',
  globe:            'globe-outline',
  // Media
  camera:           'camera-outline',
  image:            'image-outline',
  video:            'videocam-outline',
  headphones:       'headset-outline',
  music:            'musical-note-outline',
  microphone:       'mic-outline',
  // Documents / reading
  book:             'book-outline',
  'book-open':      'book-outline',
  newspaper:        'newspaper-outline',
  file:             'document-outline',
  'file-alt':       'document-text-outline',
  folder:           'folder-outline',
  'folder-open':    'folder-open-outline',
  // Finance
  'credit-card':    'card-outline',
  'money-bill':     'cash-outline',
  coins:            'cash-outline',
  wallet:           'wallet-outline',
  // Tech / electronics
  laptop:           'laptop-outline',
  'mobile-alt':     'phone-portrait-outline',
  tv:               'tv-outline',
  gamepad:          'game-controller-outline',
  wifi:             'wifi-outline',
  // Vehicles
  car:              'car-outline',
  truck:            'bus-outline',
  bicycle:          'bicycle-outline',
  plane:            'airplane-outline',
  // Real estate
  building:         'business-outline',
  key:              'key-outline',
  // Health
  hospital:         'medkit-outline',
  stethoscope:      'medkit-outline',
  // Food
  utensils:         'restaurant-outline',
  coffee:           'cafe-outline',
  // Nature / environment
  leaf:             'leaf-outline',
  tree:             'leaf-outline',
  sun:              'sunny-outline',
  cloud:            'cloud-outline',
  bolt:             'flash-outline',
  // Education / work
  'graduation-cap': 'school-outline',
  briefcase:        'briefcase-outline',
  brain:            'bulb-outline',
  // Fashion
  tshirt:           'shirt-outline',
  gem:              'diamond-outline',
  // Stats / charts
  'chart-line':     'trending-up-outline',
  'chart-bar':      'bar-chart-outline',
  // Date / time
  calendar:         'calendar-outline',
  'calendar-alt':   'calendar-outline',
  clock:            'time-outline',
  // Actions
  download:         'download-outline',
  upload:           'cloud-upload-outline',
  trash:            'trash-outline',
  edit:             'create-outline',
  pen:              'create-outline',
  'pencil-alt':     'pencil-outline',
  plus:             'add-outline',
  minus:            'remove-outline',
  filter:           'filter-outline',
  flag:             'flag-outline',
  lock:             'lock-closed-outline',
  unlock:           'lock-open-outline',
  fire:             'flame-outline',
  shield:           'shield-outline',
  award:            'ribbon-outline',
  medal:            'medal-outline',
  trophy:           'trophy-outline',
  crown:            'ribbon-outline',
  paw:              'paw-outline',
  link:             'link-outline',
};

/** Convert a FA class string like "fas fa-wrench" or bare "wrench" to an Ionicons name. */
export function faToIonicon(faClass: string): IoniconsName {
  const bare = (faClass ?? '')
    .split(' ')
    .map((s) => s.replace(/^fa-/, ''))
    .filter((s) => !['fas', 'far', 'fal', 'fad', 'fa'].includes(s))
    .pop() ?? '';

  return FA_MAP[bare] ?? 'grid-outline';
}

/** Same as faToIonicon but returns the filled (non-outline) variant. */
export function faToIoniconFilled(faClass: string): IoniconsName {
  const outlined = faToIonicon(faClass);
  return (outlined.replace(/-outline$/, '') as IoniconsName) || outlined;
}

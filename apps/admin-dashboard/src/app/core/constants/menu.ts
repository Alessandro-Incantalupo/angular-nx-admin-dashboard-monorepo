import { CustomMenuItem } from '../models/menu.model';
import { PATHS } from './routes';

export const pages: CustomMenuItem[] = [
  {
    group: 'Base',
    separator: false,
    items: [
      {
        icon: 'assets/icons/heroicons/outline/chart-pie.svg',
        label: 'Dashboard',
        route: PATHS.USERS,
      },
      {
        icon: 'assets/icons/heroicons/outline/lock-closed.svg',
        label: 'Auth',
        route: `${PATHS.AUTH}/${PATHS.SIGN_UP}`, // Concatenated route
        children: [
          {
            label: 'Sign up',
            route: `${PATHS.AUTH}/${PATHS.SIGN_UP}`,
          }, // Concatenated route
          {
            label: 'Sign in',
            route: `${PATHS.AUTH}/${PATHS.SIGN_IN}`,
          }, // Concatenated route
          {
            label: 'Sign in template driven',
            route: `${PATHS.AUTH}/${PATHS.SIGN_IN_TEMPLATE_DRIVEN}`, // Concatenated route
          },

          // {
          //   label: 'Forgot Password',
          //   route: `${PATHS.AUTH}/${PATHS.FORGOT_PASSWORD}`, // Concatenated route
          //   disabled: true,
          // },
          // {
          //   label: 'New Password',
          //   route: `${PATHS.AUTH}/${PATHS.NEW_PASSWORD}`, // Concatenated route
          //   disabled: true,
          // },
          // {
          //   label: 'Two Steps',
          //   route: `${PATHS.AUTH}/${PATHS.TWO_STEPS}`, // Concatenated route
          //   disabled: true,
          // },
        ],
        disabled: true,
      },
      {
        icon: 'assets/icons/heroicons/outline/exclamation-triangle.svg',
        label: 'Errors',
        route: PATHS.ERRORS, // Kept as a single string
        children: [
          { label: '404', route: `${PATHS.ERRORS}/${PATHS.ERROR_404}` }, // Concatenated route
          { label: '500', route: `${PATHS.ERRORS}/${PATHS.ERROR_500}` }, // Concatenated route
        ],
        disabled: true,
      },
      {
        icon: 'assets/icons/heroicons/outline/cube.svg',
        label: 'Features',
        route: PATHS.FEATURES_UI, // Kept as a single string
        children: [
          {
            label: 'Table',
            route: `${PATHS.FEATURES_UI}/${PATHS.FEATURES_TABLE}`,
          }, // Concatenated route
        ],
        disabled: true,
      },
    ],
  },
  {
    group: 'Collaboration',
    separator: true,
    items: [
      {
        icon: 'assets/icons/heroicons/outline/download.svg',
        label: 'Download',
        route: PATHS.DOWNLOAD,
        disabled: true,
      },
      {
        icon: 'assets/icons/heroicons/outline/gift.svg',
        label: 'Gift Card',
        route: PATHS.GIFT,
        disabled: true,
      },
      {
        icon: 'assets/icons/heroicons/outline/users.svg',
        label: 'Users',
        route: PATHS.USERS,
      },
    ],
  },
  {
    group: 'Config',
    separator: false,
    items: [
      {
        icon: 'assets/icons/heroicons/outline/cog.svg',
        label: 'Settings',
        route: PATHS.SETTINGS,
        disabled: true,
      },
      {
        icon: 'assets/icons/heroicons/outline/bell.svg',
        label: 'Notifications',
        route: PATHS.NOTIFICATIONS,
        disabled: true,
      },
      {
        icon: 'assets/icons/heroicons/outline/folder.svg',
        label: 'Folders',
        route: PATHS.FOLDERS,
        children: [
          { label: 'Current Files', route: PATHS.FOLDERS_CURRENT_FILES },
          { label: 'Downloads', route: PATHS.FOLDERS_DOWNLOAD },
          { label: 'Trash', route: PATHS.FOLDERS_TRASH },
        ],
        disabled: true,
      },
    ],
  },
];

import { CustomMenuItem } from '../models/menu.model';
import { PATHS } from './routes';

export const pages: CustomMenuItem[] = [
  {
    group: 'Base',
    separator: false,
    items: [
      {
        icon: 'assets/icons/heroicons/outline/chart-pie.svg',
        labelKey: 'dashboard',
        route: PATHS.USERS,
      },
      {
        icon: 'assets/icons/heroicons/outline/lock-closed.svg',
        labelKey: 'auth',
        route: `${PATHS.AUTH}/${PATHS.SIGN_UP}`, // Concatenated route
        children: [
          {
            labelKey: 'signUp',
            route: `${PATHS.AUTH}/${PATHS.SIGN_UP}`,
          }, // Concatenated route
          {
            labelKey: 'signIn',
            route: `${PATHS.AUTH}/${PATHS.SIGN_IN}`,
          }, // Concatenated route
          {
            labelKey: 'signInTemplateDriven',
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
        labelKey: 'errors',
        route: PATHS.ERRORS,
        expanded: false,
        children: [
          {
            labelKey: 'rfc7807',
            route: `${PATHS.ERRORS}/${PATHS.ERRORS_RFC7807}`,
          },
        ],
      },
      {
        icon: 'assets/icons/heroicons/outline/cube.svg',
        labelKey: 'features',
        route: PATHS.FEATURES_UI, // Kept as a single string
        children: [
          {
            labelKey: 'table',
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
        labelKey: 'download',
        route: PATHS.DOWNLOAD,
        disabled: true,
      },
      {
        icon: 'assets/icons/heroicons/outline/gift.svg',
        labelKey: 'giftCard',
        route: PATHS.GIFT,
        disabled: true,
      },
      {
        icon: 'assets/icons/heroicons/outline/users.svg',
        labelKey: 'users',
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
        labelKey: 'settings',
        route: PATHS.SETTINGS,
        disabled: true,
      },
      {
        icon: 'assets/icons/heroicons/outline/bell.svg',
        labelKey: 'notifications',
        route: PATHS.NOTIFICATIONS,
        disabled: true,
      },
      {
        icon: 'assets/icons/heroicons/outline/folder.svg',
        labelKey: 'folders',
        route: PATHS.FOLDERS,
        children: [
          { labelKey: 'currentFiles', route: PATHS.FOLDERS_CURRENT_FILES },
          { labelKey: 'downloads', route: PATHS.FOLDERS_DOWNLOAD },
          { labelKey: 'trash', route: PATHS.FOLDERS_TRASH },
        ],
        disabled: true,
      },
    ],
  },
];

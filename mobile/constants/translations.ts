import { Language } from '@/types/grocery';

export interface Translations {
  appName: string;
  appDescription: string;
  login: string;
  signOut: string;
  profileSettings: string;
  whatToBuyPlaceholder: string;
  addItem: string;
  addNote: string;
  optionalNotePlaceholder: string;
  optionalNoteLabel: string;
  quickAdd: string;
  category: string;
  selectCategory: string;
  quantity: string;
  unit: string;
  shoppingProgress: string;
  total: string;
  toBuy: string;
  done: string;
  allDone: string;
  toBuySection: string;
  purchasedSection: string;
  tapCheckboxHint: string;
  clearPurchased: string;
  clearAll: string;
  allCheckedOff: string;
  noPurchasedYet: string;
  emptyListTitle: string;
  emptyListSubtitle: string;
  noMatchingFilter: string;
  clearFilter: string;
  searchPlaceholder: string;
  clear: string;
  editItemTitle: string;
  editItemName: string;
  saveChanges: string;
  cancel: string;
  delete: string;
  edit: string;
  added: string;
  edited: string;
  pleaseEnterName: string;
  nameCannotBeEmpty: string;
  usernameCannotBeEmpty: string;
  passwordMinLength: string;
  passwordsDoNotMatch: string;
  deleteItemTitle: string;
  deleteItemDesc: string;
  deleteItemConfirm: string;
  duplicateTitle: string;
  duplicateDesc: string;
  duplicateConfirm: string;
  clearPurchasedTitle: string;
  clearPurchasedDesc: string;
  clearPurchasedConfirm: string;
  clearAllTitle: string;
  clearAllDesc: string;
  clearAllConfirm: string;
  deleteListTitle: string;
  deleteListDesc: string;
  deleteListConfirm: string;
  profileTitle: string;
  yourDisplayName: string;
  nameHelp: string;
  saveName: string;
  changePassword: string;
  newPasswordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  updatePassword: string;
  doneButton: string;
  signInTab: string;
  signUpTab: string;
  accessSubtitle: string;
  signUpSubtitle: string;
  yourNameRole: string;
  emailAddress: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  createAccountButton: string;
  signInButton: string;
  catProduce: string;
  catDairy: string;
  catBakery: string;
  catPantry: string;
  catMeatSeafood: string;
  catFrozen: string;
  catBeverages: string;
  catSnacks: string;
  catHousehold: string;
  catOther: string;
  catAll: string;
  footerSaved: string;
  switchToLight: string;
  switchToDark: string;
  tabHome: string;
  tabLists: string;
  tabBackup: string;
  tabSettings: string;
  offlineReady: string;
  listsTitle: string;
  listsSubtitle: string;
  createList: string;
  listNamePlaceholder: string;
  defaultListName: string;
  activeBadge: string;
  itemsCountLabel: string;
  renameList: string;
  categoriesTitle: string;
  categoriesSubtitle: string;
  addCategory: string;
  categoryNamePlaceholder: string;
  defaultCategoryBadge: string;
  customCategoryBadge: string;
  backupTitle: string;
  backupSubtitle: string;
  exportBackup: string;
  importBackup: string;
  backupSummaryTitle: string;
  backupPhaseNote: string;
  appearanceTitle: string;
  languageTitle: string;
  lightMode: string;
  darkMode: string;
  accountSectionTitle: string;
  accountNotSignedInDesc: string;
  openAuthScreen: string;
  authPhaseNote: string;
  storagePhaseNote: string;
  syncStatusTitle: string;
  syncNow: string;
  syncingLabel: string;
  syncedLabel: string;
  offlineLabel: string;
  pendingSyncLabel: string;
  syncErrorLabel: string;
  lastSyncedLabel: string;
  neverSyncedLabel: string;
  offlineAuthNotice: string;
  claimLocalDataTitle: string;
  claimLocalDataDesc: string;
  claimLocalDataConfirm: string;
  signOutConfirmTitle: string;
  signOutConfirmDesc: string;
  signOutConfirmButton: string;
  signupGmailInstruction: string;
  emailRequiredError: string;
  emailInvalidError: string;
  gmailRequiredError: string;
  markBoughtTitle: string;
  markBoughtDesc: string;
  markBoughtConfirm: string;
  tabHistory: string;
  historyTitle: string;
  historySubtitle: string;
  historyToday: string;
  historyYesterday: string;
  historyItemsCount: string;
  historyEmptyTitle: string;
  historyEmptySubtitle: string;
  historyBoughtAt: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'My Grocery List',
    appDescription: 'Never forget what you need to buy.',
    login: 'Sign In',
    signOut: 'Sign Out',
    profileSettings: 'Profile Settings',
    whatToBuyPlaceholder: 'What do you need to buy? (e.g., Organic Milk)',
    addItem: 'Add Item',
    addNote: 'Add note',
    optionalNotePlaceholder: 'Optional note',
    optionalNoteLabel: 'Optional item note',
    quickAdd: 'Quick add:',
    category: 'Category',
    selectCategory: 'Select category',
    quantity: 'Qty',
    unit: 'Unit',
    shoppingProgress: 'Shopping Progress',
    total: 'Total',
    toBuy: 'To Buy',
    done: 'Done',
    allDone: 'All done!',
    toBuySection: 'To Buy',
    purchasedSection: 'Purchased',
    tapCheckboxHint: 'Tap checkbox when bought',
    clearPurchased: 'Clear Purchased',
    clearAll: 'Clear All',
    allCheckedOff: 'Everything checked off! You are all set.',
    noPurchasedYet: 'No items marked as purchased yet.',
    emptyListTitle: 'Your grocery list is empty',
    emptyListSubtitle: 'Add items above or tap a quick-add suggestion to build your list.',
    noMatchingFilter: 'No items match your current filter',
    clearFilter: 'Reset filters',
    searchPlaceholder: 'Search items, notes, or categories...',
    clear: 'Clear',
    editItemTitle: 'Edit Grocery Item',
    editItemName: 'Item name',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    added: 'Added',
    edited: 'Edited',
    pleaseEnterName: 'Please enter an item name',
    nameCannotBeEmpty: 'Item name cannot be empty',
    usernameCannotBeEmpty: 'Username cannot be empty',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordsDoNotMatch: 'Passwords do not match',
    deleteItemTitle: 'Delete "{name}"?',
    deleteItemDesc: 'Are you sure you want to remove this item from your grocery list?',
    deleteItemConfirm: 'Delete Item',
    duplicateTitle: 'Item already in your list',
    duplicateDesc: '"{name}" is already on this grocery list. Do you still want to add another entry?',
    duplicateConfirm: 'Add Anyway',
    clearPurchasedTitle: 'Clear purchased items?',
    clearPurchasedDesc: 'This will remove {count} purchased items from this list.',
    clearPurchasedConfirm: 'Clear Purchased',
    clearAllTitle: 'Clear entire grocery list?',
    clearAllDesc: 'This will remove all {count} items from this list. This action cannot be undone.',
    clearAllConfirm: 'Clear All Items',
    deleteListTitle: 'Delete "{name}"?',
    deleteListDesc: 'This will delete the list and all items inside it.',
    deleteListConfirm: 'Delete List',
    profileTitle: 'Profile Settings',
    yourDisplayName: 'Display Name',
    nameHelp: 'Shown on your personal profile.',
    saveName: 'Save Name',
    changePassword: 'Change Password',
    newPasswordPlaceholder: 'New password (min 6 characters)',
    confirmPasswordPlaceholder: 'Confirm new password',
    updatePassword: 'Update Password',
    doneButton: 'Done',
    signInTab: 'Sign In',
    signUpTab: 'Sign Up',
    accessSubtitle: 'Sign in with your personal account to sync your grocery list.',
    signUpSubtitle: 'Create your personal account to get started.',
    yourNameRole: 'Display Name',
    emailAddress: 'Email Address',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm Password',
    createAccountButton: 'Create Account',
    signInButton: 'Sign In',
    catProduce: 'Produce',
    catDairy: 'Dairy',
    catBakery: 'Bakery',
    catPantry: 'Pantry',
    catMeatSeafood: 'Meat & Seafood',
    catFrozen: 'Frozen',
    catBeverages: 'Beverages',
    catSnacks: 'Snacks',
    catHousehold: 'Household',
    catOther: 'Other',
    catAll: 'All',
    footerSaved: 'My Grocery List',
    switchToLight: 'Switch to Light Mode',
    switchToDark: 'Switch to Dark Mode',
    tabHome: 'Home',
    tabLists: 'Lists',
    tabBackup: 'Data & Backup',
    tabSettings: 'Settings',
    offlineReady: 'Offline Ready',
    listsTitle: 'Grocery Lists',
    listsSubtitle: 'Organize multiple personal shopping lists.',
    createList: 'Create List',
    listNamePlaceholder: 'New list name (e.g., Weekly Groceries)',
    defaultListName: 'My Grocery List',
    activeBadge: 'Active',
    itemsCountLabel: '{count} items',
    renameList: 'Rename',
    categoriesTitle: 'Categories',
    categoriesSubtitle: 'Built-in categories and your custom categories.',
    addCategory: 'Add Category',
    categoryNamePlaceholder: 'Custom category name',
    defaultCategoryBadge: 'Default',
    customCategoryBadge: 'Custom',
    backupTitle: 'Data & Backup',
    backupSubtitle: 'Save a copy of your lists and items, or restore from a saved file.',
    exportBackup: 'Save Backup Copy',
    importBackup: 'Restore from Backup',
    backupSummaryTitle: 'Saved Lists',
    backupPhaseNote: 'Backup export and restore will be available in a future update.',
    appearanceTitle: 'Appearance',
    languageTitle: 'Language',
    lightMode: 'Light',
    darkMode: 'Dark',
    accountSectionTitle: 'Personal Account',
    accountNotSignedInDesc: 'Sign in once while online to keep your grocery lists in sync.',
    openAuthScreen: 'Open Sign In / Sign Up',
    authPhaseNote: 'Sign in with your account each time you open the app. While signed in, you can continue managing your lists offline.',
    storagePhaseNote: 'Your lists are saved on this device and synced when you are online.',
    syncStatusTitle: 'Cloud Sync',
    syncNow: 'Sync Now',
    syncingLabel: 'Syncing...',
    syncedLabel: 'Synced',
    offlineLabel: 'Offline',
    pendingSyncLabel: '{count} pending',
    syncErrorLabel: 'Sync retry needed',
    lastSyncedLabel: 'Last synced {time}',
    neverSyncedLabel: 'Not synced yet',
    offlineAuthNotice: 'You are offline. Connect to the internet to sign in or create an account.',
    claimLocalDataTitle: 'Keep items saved on this device?',
    claimLocalDataDesc: 'Found {items} items created on this device before sign-in. Move them into {email}?',
    claimLocalDataConfirm: 'Keep Items',
    signOutConfirmTitle: 'Sign out of this account?',
    signOutConfirmDesc: 'Your synced items remain safely stored for your account, and will stay hidden while signed out.',
    signOutConfirmButton: 'Sign Out',
    signupGmailInstruction: 'Please enter a valid Gmail address that you can access. You will need this email address to recover your password.',
    emailRequiredError: 'Please enter your email address.',
    emailInvalidError: 'Please enter a valid email address.',
    gmailRequiredError: 'Please use a Gmail address (@gmail.com).',
    markBoughtTitle: 'Mark as Bought?',
    markBoughtDesc: 'Are you sure you want to mark "{name}" as bought?',
    markBoughtConfirm: 'Yes, Mark as Bought',
    tabHistory: 'History',
    historyTitle: 'Purchase History',
    historySubtitle: 'Items bought during the last 7 days.',
    historyToday: 'Today',
    historyYesterday: 'Yesterday',
    historyItemsCount: '{count} bought',
    historyEmptyTitle: 'No purchases on this date',
    historyEmptySubtitle: 'Items confirmed as bought on this date will appear here.',
    historyBoughtAt: 'Bought at {time}',
  },
  my: {
    appName: 'ကျွန်ုပ်၏ ဈေးဝယ်စာရင်း',
    appDescription: 'ဝယ်ယူရန်လိုအပ်သည်များကို မမေ့လျော့စေရန်။',
    login: 'အကောင့်ဝင်ရန်',
    signOut: 'အကောင့်ထွက်ရန်',
    profileSettings: 'ပရိုဖိုင် ဆက်တင်များ',
    whatToBuyPlaceholder: 'ဘာဝယ်ရန် လိုအပ်ပါသလဲ။ (ဥပမာ - နို့၊ ပန်းသီး)',
    addItem: 'ထည့်သွင်းရန်',
    addNote: 'မှတ်ချက်ထည့်ရန်',
    optionalNotePlaceholder: 'မှတ်ချက်',
    optionalNoteLabel: 'ပစ္စည်းမှတ်ချက်',
    quickAdd: 'အမြန်ထည့်ရန် -',
    category: 'အမျိုးအစား',
    selectCategory: 'အမျိုးအစား ရွေးချယ်ရန်',
    quantity: 'အရေအတွက်',
    unit: 'ယူနစ်',
    shoppingProgress: 'ဈေးဝယ်ပြီးစီးမှု',
    total: 'စုစုပေါင်း',
    toBuy: 'ဝယ်ရန်ကျန်',
    done: 'ဝယ်ပြီး',
    allDone: 'အားလုံးဝယ်ပြီးပါပြီ။',
    toBuySection: 'ဝယ်ယူရန်',
    purchasedSection: 'ဝယ်ပြီးသား',
    tapCheckboxHint: 'ဝယ်ပြီးပါက အမှန်ခြစ်ပါ',
    clearPurchased: 'ဝယ်ပြီးပစ္စည်းများ ဖယ်ရှားရန်',
    clearAll: 'အားလုံးဖျက်ရန်',
    allCheckedOff: 'ဝယ်ယူရန်ပစ္စည်းအားလုံး ဝယ်ပြီးပါပြီ။',
    noPurchasedYet: 'ဝယ်ပြီးအဖြစ် မှတ်သားထားသော ပစ္စည်းမရှိသေးပါ။',
    emptyListTitle: 'သင့်ဈေးဝယ်စာရင်းတွင် ပစ္စည်းမရှိသေးပါ',
    emptyListSubtitle: 'အထက်ပါပုံစံကို အသုံးပြု၍ လိုအပ်သည့်ပစ္စည်းများကို ထည့်သွင်းပါ။',
    noMatchingFilter: 'ရှာဖွေမှုနှင့် ကိုက်ညီသောပစ္စည်း မတွေ့ပါ',
    clearFilter: 'စစ်ထုတ်မှုများ ပြန်လည်သတ်မှတ်ရန်',
    searchPlaceholder: 'ပစ္စည်းများ၊ မှတ်ချက်များ၊ အမျိုးအစားများ ရှာဖွေရန်...',
    clear: 'ဖျက်မည်',
    editItemTitle: 'ပစ္စည်းအချက်အလက် ပြင်ဆင်ရန်',
    editItemName: 'ပစ္စည်းအမည်',
    saveChanges: 'သိမ်းဆည်းရန်',
    cancel: 'ပယ်ဖျက်ရန်',
    delete: 'ဖျက်ရန်',
    edit: 'ပြင်ဆင်ရန်',
    added: 'ထည့်သွင်းချိန်',
    edited: 'ပြင်ဆင်ပြီး',
    pleaseEnterName: 'ကျေးဇူးပြု၍ ပစ္စည်းအမည် ရိုက်ထည့်ပါ',
    nameCannotBeEmpty: 'ပစ္စည်းအမည် အလွတ်မဖြစ်ရပါ',
    usernameCannotBeEmpty: 'အသုံးပြုသူအမည် အလွတ်မဖြစ်ရပါ',
    passwordMinLength: 'စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်',
    passwordsDoNotMatch: 'စကားဝှက်များ ကိုက်ညီမှုမရှိပါ',
    deleteItemTitle: '"{name}" ကို ဖျက်လိုပါသလား။',
    deleteItemDesc: 'ဤပစ္စည်းကို ဈေးဝယ်စာရင်းမှ ဖယ်ရှားရန် သေချာပါသလား။',
    deleteItemConfirm: 'ပစ္စည်းဖျက်ရန်',
    duplicateTitle: 'ပစ္စည်းရှိနှင့်ပြီးဖြစ်သည်',
    duplicateDesc: '"{name}" သည် စာရင်းထဲတွင် ရှိနှင့်ပြီးဖြစ်သည်။ ထပ်မံထည့်သွင်းလိုပါသလား။',
    duplicateConfirm: 'ထပ်မံထည့်မည်',
    clearPurchasedTitle: 'ဝယ်ပြီးပစ္စည်းများကို ဖယ်ရှားလိုပါသလား။',
    clearPurchasedDesc: 'ဝယ်ပြီးပစ္စည်း {count} ခုကို ဤစာရင်းမှ ဖယ်ရှားပါမည်။',
    clearPurchasedConfirm: 'ဝယ်ပြီးပစ္စည်းများ ဖယ်ရှားရန်',
    clearAllTitle: 'ဈေးဝယ်စာရင်းတစ်ခုလုံး ဖျက်လိုပါသလား။',
    clearAllDesc: 'စာရင်းရှိ ပစ္စည်း {count} ခုလုံးကို ဖျက်ပါမည်။ ဤလုပ်ဆောင်ချက်ကို ပြန်ပြင်၍မရပါ။',
    clearAllConfirm: 'အားလုံးဖျက်ရန်',
    deleteListTitle: '"{name}" စာရင်းကို ဖျက်လိုပါသလား။',
    deleteListDesc: 'ဤစာရင်းနှင့် စာရင်းအတွင်းရှိ ပစ္စည်းများအားလုံး ဖျက်သိမ်းပါမည်။',
    deleteListConfirm: 'စာရင်းဖျက်ရန်',
    profileTitle: 'ပရိုဖိုင် ဆက်တင်များ',
    yourDisplayName: 'ပြသမည့်အမည်',
    nameHelp: 'သင့်ကိုယ်ပိုင်ပရိုဖိုင်တွင် ပြသမည်ဖြစ်သည်။',
    saveName: 'အမည်သိမ်းဆည်းရန်',
    changePassword: 'စကားဝှက် ပြောင်းလဲရန်',
    newPasswordPlaceholder: 'စကားဝှက်အသစ် (အနည်းဆုံး ၆ လုံး)',
    confirmPasswordPlaceholder: 'စကားဝှက်အသစ် ထပ်မံရိုက်ထည့်ပါ',
    updatePassword: 'စကားဝှက် ပြောင်းလဲရန်',
    doneButton: 'ပြီးပါပြီ',
    signInTab: 'အကောင့်ဝင်ရန်',
    signUpTab: 'အကောင့်ဖွင့်ရန်',
    accessSubtitle: 'သင့်ကိုယ်ပိုင်ဈေးဝယ်စာရင်းကို Sync လုပ်ရန် အကောင့်ဝင်ပါ။',
    signUpSubtitle: 'စတင်အသုံးပြုရန် ကိုယ်ပိုင်အကောင့်အသစ် ဖွင့်ပါ။',
    yourNameRole: 'ပြသမည့်အမည်',
    emailAddress: 'အီးမေးလ်လိပ်စာ',
    passwordLabel: 'စကားဝှက်',
    confirmPasswordLabel: 'စကားဝှက် ထပ်မံအတည်ပြုပါ',
    createAccountButton: 'အကောင့်အသစ်ဖွင့်ရန်',
    signInButton: 'အကောင့်ဝင်ရန်',
    catProduce: 'သစ်သီးနှင့်ဟင်းသီးဟင်းရွက်',
    catDairy: 'နို့ထွက်ပစ္စည်း',
    catBakery: 'မုန့်ဖုတ်ပစ္စည်း',
    catPantry: 'မီးဖိုချောင်သုံးကုန်',
    catMeatSeafood: 'အသားနှင့်ပင်လယ်စာ',
    catFrozen: 'အအေးခန်းပစ္စည်း',
    catBeverages: 'အဖျော်ယမကာ',
    catSnacks: 'မုန့်ပဲသရေစာ',
    catHousehold: 'အိမ်သုံးပစ္စည်း',
    catOther: 'အခြား',
    catAll: 'အားလုံး',
    footerSaved: 'ကျွန်ုပ်၏ ဈေးဝယ်စာရင်း',
    switchToLight: 'အလင်းမုဒ်သို့ ပြောင်းရန်',
    switchToDark: 'အမှောင်မုဒ်သို့ ပြောင်းရန်',
    tabHome: 'ပင်မ',
    tabLists: 'စာရင်းများ',
    tabBackup: 'အရန်သိမ်း',
    tabSettings: 'ဆက်တင်',
    offlineReady: 'အော့ဖ်လိုင်း အသုံးပြုနိုင်သည်',
    listsTitle: 'ဈေးဝယ်စာရင်းများ',
    listsSubtitle: 'ကိုယ်ပိုင်ဈေးဝယ်စာရင်းများစွာကို စီမံခန့်ခွဲပါ။',
    createList: 'စာရင်းအသစ်',
    listNamePlaceholder: 'စာရင်းအမည် (ဥပမာ - အပတ်စဉ်ဈေးဝယ်)',
    defaultListName: 'ကျွန်ုပ်၏ ဈေးဝယ်စာရင်း',
    activeBadge: 'လက်ရှိ',
    itemsCountLabel: 'ပစ္စည်း {count} ခု',
    renameList: 'အမည်ပြင်မည်',
    categoriesTitle: 'အမျိုးအစားများ',
    categoriesSubtitle: 'မူလအမျိုးအစားများနှင့် ကိုယ်ပိုင်ထည့်သွင်းထားသော အမျိုးအစားများ။',
    addCategory: 'အမျိုးအစားထည့်ရန်',
    categoryNamePlaceholder: 'အမျိုးအစားအမည်အသစ်',
    defaultCategoryBadge: 'မူလ',
    customCategoryBadge: 'ကိုယ်ပိုင်',
    backupTitle: 'ဒေတာနှင့် အရန်သိမ်း',
    backupSubtitle: 'စာရင်းများနှင့် ပစ္စည်းများကို ဖိုင်အဖြစ် သိမ်းဆည်းရန် သို့မဟုတ် ပြန်ယူရန်။',
    exportBackup: 'အရန်မိတ္တူ သိမ်းဆည်းရန်',
    importBackup: 'အရန်ဖိုင်မှ ပြန်ယူရန်',
    backupSummaryTitle: 'သိမ်းဆည်းထားသော စာရင်းများ',
    backupPhaseNote: 'အရန်သိမ်းထုတ်ယူခြင်းနှင့် ပြန်သွင်းခြင်းကို မကြာမီ ထည့်သွင်းပေးပါမည်။',
    appearanceTitle: 'အသွင်အပြင်',
    languageTitle: 'ဘာသာစကား',
    lightMode: 'အလင်း',
    darkMode: 'အမှောင်',
    accountSectionTitle: 'ကိုယ်ပိုင်အကောင့်',
    accountNotSignedInDesc: 'သင့်ဈေးဝယ်စာရင်းများကို ချိတ်ဆက်သိမ်းဆည်းရန် အွန်လိုင်းရှိချိန်တွင် အကောင့်ဝင်ပါ။',
    openAuthScreen: 'အကောင့်ဝင် / ဖွင့်ရန်',
    authPhaseNote: 'အက်ပ်ဖွင့်သည့်အခါတိုင်း အကောင့်ဝင်ရန် လိုအပ်ပါသည်။ အကောင့်ဝင်ထားစဉ် အော့ဖ်လိုင်းတွင်လည်း ဆက်လက်အသုံးပြုနိုင်ပါသည်။',
    storagePhaseNote: 'သင့်စာရင်းများကို စက်ထဲတွင် သိမ်းဆည်းထားပြီး အွန်လိုင်းရှိချိန်တွင် Sync လုပ်ပေးပါသည်။',
    syncStatusTitle: 'အွန်လိုင်း Sync',
    syncNow: 'ယခု Sync လုပ်မည်',
    syncingLabel: 'Sync လုပ်နေသည်...',
    syncedLabel: 'Sync ပြီး',
    offlineLabel: 'အော့ဖ်လိုင်း',
    pendingSyncLabel: 'စောင့်ဆိုင်း {count}',
    syncErrorLabel: 'Sync ပြန်ကြိုးစားရန်',
    lastSyncedLabel: 'နောက်ဆုံး Sync - {time}',
    neverSyncedLabel: 'Sync မလုပ်ရသေးပါ',
    offlineAuthNotice: 'အော့ဖ်လိုင်းဖြစ်နေပါသည်။ အကောင့်ဝင်ရန် သို့မဟုတ် ဖွင့်ရန် အင်တာနက်ချိတ်ဆက်ပါ။',
    claimLocalDataTitle: 'စက်ထဲတွင် ရှိပြီးသား ပစ္စည်းများကို သိမ်းမလား?',
    claimLocalDataDesc: 'အကောင့်မဝင်မီ စက်ထဲတွင် သိမ်းထားသော ပစ္စည်း {items} ခုကို {email} ထဲသို့ ထည့်သွင်းမလား?',
    claimLocalDataConfirm: 'ပစ္စည်းများ ထည့်မည်',
    signOutConfirmTitle: 'အကောင့်မှ ထွက်လိုပါသလား?',
    signOutConfirmDesc: 'သင့်ပစ္စည်းများကို ဤအကောင့်အတွက် သီးသန့်သိမ်းဆည်းထားမည်ဖြစ်ပြီး အကောင့်ထွက်ထားစဉ် ဖုံးကွယ်ထားပါမည်။',
    signOutConfirmButton: 'အကောင့်ထွက်ရန်',
    signupGmailInstruction: 'သင်ဝင်ရောက်အသုံးပြုနိုင်သော မှန်ကန်သည့် Gmail လိပ်စာကို ထည့်သွင်းပါ။ စကားဝှက်ပြန်လည်ရယူရန် ဤအီးမေးလ်ကို လိုအပ်ပါမည်။',
    emailRequiredError: 'ကျေးဇူးပြု၍ သင့်အီးမေးလ်လိပ်စာကို ထည့်သွင်းပါ။',
    emailInvalidError: 'ကျေးဇူးပြု၍ မှန်ကန်သော အီးမေးလ်လိပ်စာ ရိုက်ထည့်ပါ။',
    gmailRequiredError: 'ကျေးဇူးပြု၍ Gmail လိပ်စာ (@gmail.com) ကို အသုံးပြုပါ။',
    markBoughtTitle: 'ဝယ်ပြီးအဖြစ် မှတ်သားမလား?',
    markBoughtDesc: '"{name}" ကို ဝယ်ပြီးအဖြစ် မှတ်သားရန် သေချာပါသလား?',
    markBoughtConfirm: 'ဟုတ်ကဲ့၊ ဝယ်ပြီးပါပြီ',
    tabHistory: 'မှတ်တမ်း',
    historyTitle: 'ဝယ်ယူမှု မှတ်တမ်း',
    historySubtitle: 'လွန်ခဲ့သော ၇ ရက်အတွင်း ဝယ်ယူခဲ့သော ပစ္စည်းများ။',
    historyToday: 'ယနေ့',
    historyYesterday: 'မနေ့က',
    historyItemsCount: 'ဝယ်ပြီး {count} ခု',
    historyEmptyTitle: 'ဤနေ့တွင် ဝယ်ယူထားသော ပစ္စည်းမရှိပါ',
    historyEmptySubtitle: 'ဤနေ့တွင် ဝယ်ပြီးအဖြစ် အတည်ပြုထားသော ပစ္စည်းများ ဤနေရာတွင် ပေါ်လာပါမည်။',
    historyBoughtAt: 'ဝယ်ယူချိန် - {time}',
  },
};

export function getTranslatedCategory(categoryKey: string, lang: Language): string {
  const t = TRANSLATIONS[lang];
  switch (categoryKey) {
    case 'Produce':
      return t.catProduce;
    case 'Dairy':
      return t.catDairy;
    case 'Bakery':
      return t.catBakery;
    case 'Pantry':
      return t.catPantry;
    case 'Meat & Seafood':
      return t.catMeatSeafood;
    case 'Frozen':
      return t.catFrozen;
    case 'Beverages':
      return t.catBeverages;
    case 'Snacks':
      return t.catSnacks;
    case 'Household':
      return t.catHousehold;
    case 'All':
      return t.catAll;
    case 'Other':
      return t.catOther;
    default:
      return categoryKey;
  }
}

import { Language } from '../types/grocery';

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
  displayNamePlaceholder: string;
  emailAddress: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
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
  switchToLight: string;
  switchToDark: string;
  appearanceTitle: string;
  languageTitle: string;
  lightMode: string;
  darkMode: string;
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
  tabList: string;
  tabHistory: string;
  historyTitle: string;
  historySubtitle: string;
  historyToday: string;
  historyYesterday: string;
  historyItemsCount: string;
  historyEmptyTitle: string;
  historyEmptySubtitle: string;
  historyBoughtAt: string;
  loadingItems: string;
  refreshList: string;
  itemAddedToast: string;
  itemUpdatedToast: string;
  itemRemovedToast: string;
  itemBoughtToast: string;
  itemRestoredToast: string;
  clearedPurchasedToast: string;
  clearedAllToast: string;
  nameUpdatedToast: string;
  passwordUpdatedToast: string;
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
    emptyListSubtitle: 'Add items using the form or tap a quick-add suggestion to start.',
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
    clearPurchasedDesc: 'This will remove {count} purchased items from your grocery list.',
    clearPurchasedConfirm: 'Clear Purchased',
    clearAllTitle: 'Clear entire grocery list?',
    clearAllDesc: 'This will remove all {count} items from your grocery list. This action cannot be undone.',
    clearAllConfirm: 'Clear All Items',
    profileTitle: 'Profile Settings',
    yourDisplayName: 'Display Name',
    nameHelp: 'Shown on your personal profile and new grocery items.',
    saveName: 'Save Name',
    changePassword: 'Change Password',
    newPasswordPlaceholder: 'New password (min 6 characters)',
    confirmPasswordPlaceholder: 'Confirm new password',
    updatePassword: 'Update Password',
    doneButton: 'Done',
    signInTab: 'Sign In',
    signUpTab: 'Sign Up',
    accessSubtitle: 'Sign in with your personal account to manage your grocery list.',
    signUpSubtitle: 'Create your personal account to get started.',
    yourNameRole: 'Display Name',
    displayNamePlaceholder: 'Your name',
    emailAddress: 'Email Address',
    emailPlaceholder: 'you@gmail.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
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
    switchToLight: 'Switch to Light Mode',
    switchToDark: 'Switch to Dark Mode',
    appearanceTitle: 'Appearance',
    languageTitle: 'Language',
    lightMode: 'Light',
    darkMode: 'Dark',
    signOutConfirmTitle: 'Sign out of this account?',
    signOutConfirmDesc: 'You will need to sign in again the next time you open My Grocery List.',
    signOutConfirmButton: 'Sign Out',
    signupGmailInstruction: 'Please enter a valid Gmail address (@gmail.com) that you can access.',
    emailRequiredError: 'Please enter your email address.',
    emailInvalidError: 'Please enter a valid email address.',
    gmailRequiredError: 'Please use a Gmail address (@gmail.com).',
    markBoughtTitle: 'Mark as Bought?',
    markBoughtDesc: 'Are you sure you want to mark "{name}" as bought?',
    markBoughtConfirm: 'Yes, Mark as Bought',
    tabList: 'Grocery List',
    tabHistory: '7-Day History',
    historyTitle: 'Purchase History',
    historySubtitle: 'Items bought during the last 7 days.',
    historyToday: 'Today',
    historyYesterday: 'Yesterday',
    historyItemsCount: '{count} bought',
    historyEmptyTitle: 'No purchases on this date',
    historyEmptySubtitle: 'Items confirmed as bought on this date will appear here.',
    historyBoughtAt: 'Bought at {time}',
    loadingItems: 'Loading your grocery list...',
    refreshList: 'Refresh list',
    itemAddedToast: 'Added "{name}" to your grocery list.',
    itemUpdatedToast: 'Updated "{name}".',
    itemRemovedToast: 'Removed "{name}".',
    itemBoughtToast: 'Marked "{name}" as bought.',
    itemRestoredToast: 'Moved "{name}" back to To Buy.',
    clearedPurchasedToast: 'Removed purchased items.',
    clearedAllToast: 'Cleared your grocery list.',
    nameUpdatedToast: 'Display name updated.',
    passwordUpdatedToast: 'Password updated successfully.',
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
    accessSubtitle: 'သင့်ကိုယ်ပိုင်ဈေးဝယ်စာရင်းကို စီမံရန် အကောင့်ဝင်ပါ။',
    signUpSubtitle: 'စတင်အသုံးပြုရန် ကိုယ်ပိုင်အကောင့်အသစ် ဖွင့်ပါ။',
    yourNameRole: 'ပြသမည့်အမည်',
    displayNamePlaceholder: 'သင့်အမည်',
    emailAddress: 'အီးမေးလ်လိပ်စာ',
    emailPlaceholder: 'you@gmail.com',
    passwordLabel: 'စကားဝှက်',
    passwordPlaceholder: 'စကားဝှက် ရိုက်ထည့်ပါ',
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
    switchToLight: 'အလင်းမုဒ်သို့ ပြောင်းရန်',
    switchToDark: 'အမှောင်မုဒ်သို့ ပြောင်းရန်',
    appearanceTitle: 'အသွင်အပြင်',
    languageTitle: 'ဘာသာစကား',
    lightMode: 'အလင်း',
    darkMode: 'အမှောင်',
    signOutConfirmTitle: 'အကောင့်မှ ထွက်လိုပါသလား?',
    signOutConfirmDesc: 'နောက်တစ်ကြိမ် ဝက်ဘ်ဆိုက်ဖွင့်သည့်အခါ အကောင့်ပြန်လည်ဝင်ရောက်ရန် လိုအပ်ပါမည်။',
    signOutConfirmButton: 'အကောင့်ထွက်ရန်',
    signupGmailInstruction: 'သင်ဝင်ရောက်အသုံးပြုနိုင်သော မှန်ကန်သည့် Gmail လိပ်စာ (@gmail.com) ကို ထည့်သွင်းပါ။',
    emailRequiredError: 'ကျေးဇူးပြု၍ သင့်အီးမေးလ်လိပ်စာကို ထည့်သွင်းပါ။',
    emailInvalidError: 'ကျေးဇူးပြု၍ မှန်ကန်သော အီးမေးလ်လိပ်စာ ရိုက်ထည့်ပါ။',
    gmailRequiredError: 'ကျေးဇူးပြု၍ Gmail လိပ်စာ (@gmail.com) ကို အသုံးပြုပါ။',
    markBoughtTitle: 'ဝယ်ပြီးအဖြစ် မှတ်သားမလား?',
    markBoughtDesc: '"{name}" ကို ဝယ်ပြီးအဖြစ် မှတ်သားရန် သေချာပါသလား?',
    markBoughtConfirm: 'ဟုတ်ကဲ့၊ ဝယ်ပြီးပါပြီ',
    tabList: 'ဈေးဝယ်စာရင်း',
    tabHistory: '၇ ရက်မှတ်တမ်း',
    historyTitle: 'ဝယ်ယူမှု မှတ်တမ်း',
    historySubtitle: 'လွန်ခဲ့သော ၇ ရက်အတွင်း ဝယ်ယူခဲ့သော ပစ္စည်းများ။',
    historyToday: 'ယနေ့',
    historyYesterday: 'မနေ့က',
    historyItemsCount: 'ဝယ်ပြီး {count} ခု',
    historyEmptyTitle: 'ဤနေ့တွင် ဝယ်ယူထားသော ပစ္စည်းမရှိပါ',
    historyEmptySubtitle: 'ဤနေ့တွင် ဝယ်ပြီးအဖြစ် အတည်ပြုထားသော ပစ္စည်းများ ဤနေရာတွင် ပေါ်လာပါမည်။',
    historyBoughtAt: 'ဝယ်ယူချိန် - {time}',
    loadingItems: 'သင့်ဈေးဝယ်စာရင်းကို ရယူနေသည်...',
    refreshList: 'စာရင်းပြန်လည်စစ်ဆေးရန်',
    itemAddedToast: '"{name}" ကို စာရင်းထဲသို့ ထည့်သွင်းပြီးပါပြီ။',
    itemUpdatedToast: '"{name}" ကို ပြင်ဆင်ပြီးပါပြီ။',
    itemRemovedToast: '"{name}" ကို ဖယ်ရှားပြီးပါပြီ။',
    itemBoughtToast: '"{name}" ကို ဝယ်ပြီးအဖြစ် မှတ်သားပြီးပါပြီ။',
    itemRestoredToast: '"{name}" ကို ဝယ်ယူရန်စာရင်းသို့ ပြန်ရွှေ့ပြီးပါပြီ။',
    clearedPurchasedToast: 'ဝယ်ပြီးပစ္စည်းများကို ဖယ်ရှားပြီးပါပြီ။',
    clearedAllToast: 'ဈေးဝယ်စာရင်းတစ်ခုလုံးကို ရှင်းလင်းပြီးပါပြီ။',
    nameUpdatedToast: 'ပြသမည့်အမည် ပြောင်းလဲပြီးပါပြီ။',
    passwordUpdatedToast: 'စကားဝှက် ပြောင်းလဲပြီးပါပြီ။',
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

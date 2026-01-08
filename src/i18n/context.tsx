'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'kn';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'welcome.title': 'Welcome to Malpe Meen',
    'welcome.subtitle': 'The digital marketplace connecting local fisheries with buyers. Choose your role to get started.',
    'role.buyer.title': "I'm a Buyer",
    'role.buyer.description': 'Browse and buy the freshest catch directly from the source.',
    'role.buyer.button': 'Find Fish',
    'role.seller.title': "I'm a Seller",
    'role.seller.description': 'List your products and reach a wider market of buyers.',
    'role.seller.button': 'Sell Fish',
    'header.dashboard': 'Dashboard',
    'header.account': 'Account',
    'header.my_account': 'My Account',
    'header.account_settings': 'Account Settings',
    'header.seller_settings': 'Seller Settings',
    'header.help_support': 'Help & Support',
    'header.about': 'About',
    'header.logout': 'Logout',
    'header.sell_fish': 'Sell Fish',
    'header.buyer_login': 'Buyer Login',
    'loading': 'Loading...',
    'redirecting': 'Redirecting to your dashboard...',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'support.description': 'Contact us for any questions or issues.',
    'account.description': 'View and update your personal information.',
    'seller.details': 'Seller Details',
    'seller.description': 'View and update your seller information.',
    'back': 'Back',
    'login.buyer.title': 'Buyer Login',
    'login.buyer.new_account': 'Create Buyer Account',
    'login.buyer.phone_desc': 'Enter your phone number to log in or sign up.',
    'login.buyer.name_desc': 'Enter your name to finish signing up.',
    'login.phone_label': 'Phone Number',
    'login.phone_placeholder': '9876543210',
    'login.phone_hint': 'Country code (+91) is automatically used.',
    'login.send_otp': 'Send OTP',
    'login.otp_label': 'Enter OTP',
    'login.verify_otp': 'Verify & Login',
    'login.verify_otp_simple': 'Verify OTP',
    'login.back_to_phone': 'Back to phone number',
    'login.buyer.name_label': 'Your Name',
    'login.buyer.name_placeholder': 'John Doe',
    'login.complete_signup': 'Complete Sign Up',
    'login.not_buyer': 'Not a buyer?',
    'login.not_seller': 'Not a seller?',
    'login.seller.title': 'Seller Login or Sign Up',
    'login.seller.new_account': 'Create a Seller Account',
    'login.seller.welcome': 'Welcome! Enter your phone number to begin.',
    'login.seller.join': 'Join our network to reach more buyers and grow your business.',
    'login.seller.otp_sent': "We've sent a code to +91 {phone}.",
    'login.seller.contact_name': 'Contact Name',
    'login.seller.company_name': 'Company Name',
    'login.seller.address': 'Address',
    'login.seller.address_placeholder': 'Your business address',
    'login.seller.port': 'Primary Port',
    'login.seller.port_placeholder': 'Select your main port',
    'login.seller.new_hint': 'New seller? This will start the sign up process.',
    'seller.dashboard.title': 'Seller Dashboard',
    'seller.dashboard.create_listing': 'Create New Listing',
    'seller.dashboard.active_listings': 'Active Listings',
    'seller.dashboard.active_listings_desc': 'Your currently active listings',
    'seller.dashboard.total_value': 'Total Stock Value',
    'seller.dashboard.total_value_desc': 'Estimated value of all listings',
    'seller.dashboard.your_listings': 'Your Listings',
    'seller.dashboard.manage_listings': 'Manage your existing product listings below.',
    'seller.dashboard.add_new': 'Add New',
    'seller.dashboard.no_listings': 'No listings yet',
    'seller.dashboard.no_listings_desc': 'Get started by creating your first listing.',
    'seller.dashboard.price_not_set': 'Price not set',
    'seller.dashboard.listed_on': 'Listed on {date}',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.cancel': 'Cancel',
    'common.confirm_delete': 'Are you absolutely sure?',
    'common.delete_warning': 'This action cannot be undone. This will permanently delete your listing for "{name}".',
    'common.yes_delete': 'Yes, delete it',
    'buyer.dashboard.title': 'Available Listings',
    'buyer.dashboard.show_count': 'Show with Count/Kg only',
    'buyer.dashboard.port': 'Port:',
    'buyer.dashboard.select_port': 'Select a port',
    'buyer.dashboard.all_ports': 'All Ports',
    'buyer.dashboard.fish_type': 'Fish Type:',
    'buyer.dashboard.all_fish': 'All Fish',
    'buyer.dashboard.seller': 'Seller:',
    'buyer.dashboard.select_seller': 'Select a seller',
    'buyer.dashboard.all_sellers': 'All Sellers',
    'buyer.dashboard.no_listings': 'No fish available for the selected filters. Check back later!',
  },
  kn: {
    'welcome.title': 'ಮಲ್ಪೆ ಮೀನ್ ಗೆ ಸುಸ್ವಾಗತ',
    'welcome.subtitle': 'ಸ್ಥಳೀಯ ಮೀನುಗಾರಿಕೆಯನ್ನು ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವ ಡಿಜಿಟಲ್ ಮಾರುಕಟ್ಟೆ. ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆರಿಸಿ.',
    'role.buyer.title': 'ನಾನು ಖರೀದಿದಾರ',
    'role.buyer.description': 'ಮೂಲದಿಂದ ನೇರವಾಗಿ ತಾಜಾ ಮೀನುಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ಖರೀದಿಸಿ.',
    'role.buyer.button': 'ಮೀನು ಹುಡುಕಿ',
    'role.seller.title': 'ನಾನು ಮಾರಾಟಗಾರ',
    'role.seller.description': 'ನಿಮ್ಮ ಉತ್ಪನ್ನಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡಿ ಮತ್ತು ಹೆಚ್ಚಿನ ಖರೀದಿದಾರರನ್ನು ತಲುಪಿ.',
    'role.seller.button': 'ಮೀನು ಮಾರಿ',
    'header.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'header.account': 'ಖಾತೆ',
    'header.my_account': 'ನನ್ನ ಖಾತೆ',
    'header.account_settings': 'ಖಾತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    'header.seller_settings': 'ಮಾರಾಟಗಾರರ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    'header.help_support': 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ',
    'header.about': 'ಬಗ್ಗೆ',
    'header.logout': 'ಲಾಗ್ ಔಟ್',
    'header.sell_fish': 'ಮೀನು ಮಾರಿ',
    'header.buyer_login': 'ಖರೀದಿದಾರರ ಲಾಗಿನ್',
    'loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'redirecting': 'ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ...',
    'contact.email': 'ಇಮೇಲ್',
    'contact.phone': 'ದೂರವಾಣಿ',
    'support.description': 'ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳು ಅಥವಾ ಸಮಸ್ಯೆಗಳಿಗಾಗಿ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    'account.description': 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ನವೀಕರಿಸಿ.',
    'seller.details': 'ಮಾರಾಟಗಾರರ ವಿವರಗಳು',
    'seller.description': 'ನಿಮ್ಮ ಮಾರಾಟಗಾರರ ಮಾಹಿತಿಯನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ನವೀಕರಿಸಿ.',
    'back': 'ಹಿಂದಕ್ಕೆ',
    'login.buyer.title': 'ಖರೀದಿದಾರರ ಲಾಗಿನ್',
    'login.buyer.new_account': 'ಖರೀದಿದಾರರ ಖಾತೆಯನ್ನು ರಚಿಸಿ',
    'login.buyer.phone_desc': 'ಲಾಗ್ ಇನ್ ಮಾಡಲು ಅಥವಾ ಸೈನ್ ಅಪ್ ಮಾಡಲು ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    'login.buyer.name_desc': 'ಸೈನ್ ಅಪ್ ಮುಗಿಸಲು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.',
    'login.phone_label': 'ಫೋನ್ ಸಂಖ್ಯೆ',
    'login.phone_placeholder': '9876543210',
    'login.phone_hint': 'ದೇಶದ ಕೋಡ್ (+91) ಅನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ.',
    'login.send_otp': 'OTP ಕಳುಹಿಸಿ',
    'login.otp_label': 'OTP ನಮೂದಿಸಿ',
    'login.verify_otp': 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಲಾಗಿನ್ ಮಾಡಿ',
    'login.verify_otp_simple': 'OTP ಪರಿಶೀಲಿಸಿ',
    'login.back_to_phone': 'ಫೋನ್ ಸಂಖ್ಯೆಗೆ ಹಿಂತಿರುಗಿ',
    'login.buyer.name_label': 'ನಿಮ್ಮ ಹೆಸರು',
    'login.buyer.name_placeholder': 'ಜಾನ್ ಡೋ',
    'login.complete_signup': 'ಸೈನ್ ಅಪ್ ಪೂರ್ಣಗೊಳಿಸಿ',
    'login.not_buyer': 'ಖರೀದಿದಾರರಲ್ಲವೇ?',
    'login.not_seller': 'ಮಾರಾಟಗಾರರಲ್ಲವೇ?',
    'login.seller.title': 'ಮಾರಾಟಗಾರರ ಲಾಗಿನ್ ಅಥವಾ ಸೈನ್ ಅಪ್',
    'login.seller.new_account': 'ಮಾರಾಟಗಾರರ ಖಾತೆಯನ್ನು ರಚಿಸಿ',
    'login.seller.welcome': 'ಸುಸ್ವಾಗತ! ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    'login.seller.join': 'ಹೆಚ್ಚಿನ ಖರೀದಿದಾರರನ್ನು ತಲುಪಲು ಮತ್ತು ನಿಮ್ಮ ವ್ಯವಹಾರವನ್ನು ಬೆಳೆಸಲು ನಮ್ಮ ನೆಟ್‌ವರ್ಕ್‌ಗೆ ಸೇರಿ.',
    'login.seller.otp_sent': "ನಾವು +91 {phone} ಗೆ ಕೋಡ್ ಕಳುಹಿಸಿದ್ದೇವೆ.",
    'login.seller.contact_name': 'ಸಂಪರ್ಕ ಹೆಸರು',
    'login.seller.company_name': 'ಕಂಪನಿ ಹೆಸರು',
    'login.seller.address': 'ವಿಳಾಸ',
    'login.seller.address_placeholder': 'ನಿಮ್ಮ ವ್ಯಾಪಾರ ವಿಳಾಸ',
    'login.seller.port': 'ಪ್ರಾಥಮಿಕ ಬಂದರು',
    'login.seller.port_placeholder': 'ನಿಮ್ಮ ಮುಖ್ಯ ಬಂದರನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'login.seller.new_hint': 'ಹೊಸ ಮಾರಾಟಗಾರರೇ? ಇದು ಸೈನ್ ಅಪ್ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತದೆ.',
    'seller.dashboard.title': 'ಮಾರಾಟಗಾರರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'seller.dashboard.create_listing': 'ಹೊಸ ಪಟ್ಟಿಯನ್ನು ರಚಿಸಿ',
    'seller.dashboard.active_listings': 'ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳು',
    'seller.dashboard.active_listings_desc': 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳು',
    'seller.dashboard.total_value': 'ಒಟ್ಟು ದಾಸ್ತಾನು ಮೌಲ್ಯ',
    'seller.dashboard.total_value_desc': 'ಎಲ್ಲಾ ಪಟ್ಟಿಗಳ ಅಂದಾಜು ಮೌಲ್ಯ',
    'seller.dashboard.your_listings': 'ನಿಮ್ಮ ಪಟ್ಟಿಗಳು',
    'seller.dashboard.manage_listings': 'ಕೆಳಗೆ ನಿಮ್ಮ ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಉತ್ಪನ್ನ ಪಟ್ಟಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ.',
    'seller.dashboard.add_new': 'ಹೊಸದನ್ನು ಸೇರಿಸಿ',
    'seller.dashboard.no_listings': 'ಇನ್ನೂ ಯಾವುದೇ ಪಟ್ಟಿಗಳಿಲ್ಲ',
    'seller.dashboard.no_listings_desc': 'ನಿಮ್ಮ ಮೊದಲ ಪಟ್ಟಿಯನ್ನು ರಚಿಸುವ ಮೂಲಕ ಪ್ರಾರಂಭಿಸಿ.',
    'seller.dashboard.price_not_set': 'ಬೆಲೆ ನಿಗದಿಪಡಿಸಿಲ್ಲ',
    'seller.dashboard.listed_on': '{date} ರಂದು ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ',
    'common.delete': 'ಅಳಿಸಿ',
    'common.edit': 'ತಿದ್ದಿ',
    'common.cancel': 'ರದ್ದುಮಾಡಿ',
    'common.confirm_delete': 'ನೀವು ಖಚಿತವಾಗಿ ಅಳಿಸಲು ಬಯಸುವಿರಾ?',
    'common.delete_warning': 'ಈ ಕ್ರಮವನ್ನು ರದ್ದುಗೊಳಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ಇದು "{name}" ಗಾಗಿ ನಿಮ್ಮ ಪಟ್ಟಿಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸುತ್ತದೆ.',
    'common.yes_delete': 'ಹೌದು, ಅಳಿಸಿ',
    'buyer.dashboard.title': 'ಲಭ್ಯವಿರುವ ಪಟ್ಟಿಗಳು',
    'buyer.dashboard.show_count': 'ಕೌಂಟ್/ಕೆಜಿ ಮಾತ್ರ ತೋರಿಸು',
    'buyer.dashboard.port': 'ಬಂದರು:',
    'buyer.dashboard.select_port': 'ಒಂದು ಬಂದರನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'buyer.dashboard.all_ports': 'ಎಲ್ಲಾ ಬಂದರುಗಳು',
    'buyer.dashboard.fish_type': 'ಮೀನಿನ ವಿಧ:',
    'buyer.dashboard.all_fish': 'ಎಲ್ಲಾ ಮೀನುಗಳು',
    'buyer.dashboard.seller': 'ಮಾರಾಟಗಾರ:',
    'buyer.dashboard.select_seller': 'ಮಾರಾಟಗಾರನನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'buyer.dashboard.all_sellers': 'ಎಲ್ಲಾ ಮಾರಾಟಗಾರರು',
    'buyer.dashboard.no_listings': 'ಆಯ್ದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಯಾವುದೇ ಮೀನು ಲಭ್ಯವಿಲ್ಲ. ನಂತರ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ!',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'kn')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

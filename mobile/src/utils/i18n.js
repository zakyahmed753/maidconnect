import useLangStore from '../store/langStore';

const T = {
  en: {
    // Common
    continue: 'Continue', cancel: 'Cancel', save: 'Save', back: 'Back',
    submit: 'Submit', loading: 'Loading…', done: 'Done', ok: 'OK',
    error: 'Error', success: 'Success', retry: 'Try Again',

    // Auth
    sign_in: 'Sign In', sign_up: 'Sign Up', logout: 'Log Out',
    email: 'Email', password: 'Password', phone: 'Phone',
    full_name: 'Full Name', nationality: 'Nationality',
    age: 'Age', experience: 'Experience (yrs)', salary: 'Expected Salary (USD/mo)',
    bio: 'About You', skills: 'Skills', photos: 'Photos',
    passport_number: 'Passport Number', passport_photo: 'Passport Photo',
    no_account: "Don't have an account?", have_account: 'Already have an account?',
    sign_in_link: 'Sign In', sign_up_link: 'Sign Up',
    create_profile: 'Create Profile', step1: 'Step 1 of 2 — Profile Information',
    fill_required: 'Fill required fields',
    min_photos: 'Upload at least 3 photos',
    max_photos: 'Max 5 photos allowed',
    photos_later: 'Photos will be added later',
    photos_continue: 'Continue to complete your profile',
    registration_failed: 'Registration failed',
    age_range: 'Maid age must be between 20 and 45',
    select_nationality: 'Select Nationality',
    search_country: 'Search country…',

    // Browse
    good_morning: 'Good morning',
    welcome: 'Welcome',
    search_placeholder: 'Search name, nationality, skill…',
    browse_maids: 'Browse Maids',
    no_maids: 'No maids found',
    load_failed: 'Failed to load maids',
    save_failed: 'Failed to save',

    // Saved
    saved_maids: 'Saved Maids',
    no_saved: 'No saved maids yet',

    // Subscription
    subscription_title: 'Maid Subscription',
    subscription_sub: 'Stay visible to hundreds of families',
    monthly_plan: 'Monthly Plan', annual_plan: 'Annual Plan',
    most_popular: '⭐ Most Popular', proceed_payment: 'Proceed to Payment →',
    skip_dev: 'Skip for now (Dev only)',

    // Pending
    under_review: 'Under Review',
    review_sub: 'Your passport and selfie are being verified by the Servix team.',
    check_status: 'Check Status',
    verified_title: 'Identity Verified!',
    verified_sub: 'Your documents have been approved. Proceed to choose a subscription plan.',
    rejected_title: 'Verification Rejected',
    rejected_sub: 'Your documents did not meet requirements. Please resubmit.',
    resubmit: 'Resubmit Documents',
    choose_subscription: 'Choose Subscription →',
    auto_check: 'Auto-checking every 30 seconds. You can close the app and come back.',

    // Login
    login_maid: 'Sign in as Maid',
    login_hw: 'Sign in as Customer',
    sign_in_maid: 'Maid Sign In',
    sign_in_hw: 'Customer Sign In',

    // Settings / Language
    language: 'Language', change_language: 'Change Language',
    lang_en: 'English', lang_ar: 'Arabic', lang_fr: 'French', lang_ha: 'Hausa',
  },

  ar: {
    // Common
    continue: 'متابعة', cancel: 'إلغاء', save: 'حفظ', back: 'رجوع',
    submit: 'إرسال', loading: 'جارٍ التحميل…', done: 'تم', ok: 'حسنًا',
    error: 'خطأ', success: 'نجاح', retry: 'حاول مجددًا',

    // Auth
    sign_in: 'تسجيل الدخول', sign_up: 'إنشاء حساب', logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني', password: 'كلمة المرور', phone: 'رقم الهاتف',
    full_name: 'الاسم الكامل', nationality: 'الجنسية',
    age: 'العمر', experience: 'الخبرة (سنوات)', salary: 'الراتب المتوقع (دولار/شهر)',
    bio: 'نبذة عنك', skills: 'المهارات', photos: 'الصور',
    passport_number: 'رقم جواز السفر', passport_photo: 'صورة جواز السفر',
    no_account: 'ليس لديك حساب؟', have_account: 'لديك حساب بالفعل؟',
    sign_in_link: 'تسجيل الدخول', sign_up_link: 'إنشاء حساب',
    create_profile: 'إنشاء ملف شخصي', step1: 'الخطوة 1 من 2 — معلومات الملف الشخصي',
    fill_required: 'يرجى ملء الحقول المطلوبة',
    min_photos: 'يرجى رفع 3 صور على الأقل',
    max_photos: 'الحد الأقصى 5 صور',
    photos_later: 'ستُضاف الصور لاحقًا',
    photos_continue: 'أكمل إنشاء ملفك الشخصي',
    registration_failed: 'فشل التسجيل',
    age_range: 'يجب أن يكون عمر العاملة بين 20 و 45 سنة',
    select_nationality: 'اختر الجنسية',
    search_country: 'ابحث عن دولة…',

    // Browse
    good_morning: 'صباح الخير',
    welcome: 'أهلاً',
    search_placeholder: 'ابحث بالاسم أو الجنسية أو المهارة…',
    browse_maids: 'تصفح العمالة',
    no_maids: 'لا توجد نتائج',
    load_failed: 'فشل تحميل البيانات',
    save_failed: 'فشل الحفظ',

    // Saved
    saved_maids: 'المحفوظات',
    no_saved: 'لا توجد عمالة محفوظة بعد',

    // Subscription
    subscription_title: 'اشتراك العاملة',
    subscription_sub: 'ابقَ ظاهرًا لمئات الأسر',
    monthly_plan: 'الاشتراك الشهري', annual_plan: 'الاشتراك السنوي',
    most_popular: '⭐ الأكثر شيوعًا', proceed_payment: 'المتابعة للدفع ←',
    skip_dev: 'تخطي (للمطورين فقط)',

    // Pending
    under_review: 'قيد المراجعة',
    review_sub: 'يتم التحقق من جواز سفرك وصورتك الشخصية من قِبل فريق Servix.',
    check_status: 'التحقق من الحالة',
    verified_title: 'تم التحقق من الهوية!',
    verified_sub: 'تمت الموافقة على مستنداتك. تابع لاختيار خطة الاشتراك.',
    rejected_title: 'تم رفض التحقق',
    rejected_sub: 'لم تستوفِ مستنداتك المتطلبات. يرجى إعادة الإرسال.',
    resubmit: 'إعادة إرسال المستندات',
    choose_subscription: 'اختر الاشتراك ←',
    auto_check: 'يتم الفحص تلقائيًا كل 30 ثانية. يمكنك إغلاق التطبيق والعودة لاحقًا.',

    // Login
    login_maid: 'تسجيل دخول العاملة',
    login_hw: 'تسجيل دخول ربة البيت',
    sign_in_maid: 'دخول العاملة',
    sign_in_hw: 'دخول ربة البيت',

    // Settings / Language
    language: 'اللغة', change_language: 'تغيير اللغة',
    lang_en: 'الإنجليزية', lang_ar: 'العربية', lang_fr: 'الفرنسية', lang_ha: 'الهوسا',
  },

  fr: {
    // Common
    continue: 'Continuer', cancel: 'Annuler', save: 'Enregistrer', back: 'Retour',
    submit: 'Soumettre', loading: 'Chargement…', done: 'Terminé', ok: 'OK',
    error: 'Erreur', success: 'Succès', retry: 'Réessayer',

    // Auth
    sign_in: 'Se connecter', sign_up: "S'inscrire", logout: 'Se déconnecter',
    email: 'E-mail', password: 'Mot de passe', phone: 'Téléphone',
    full_name: 'Nom complet', nationality: 'Nationalité',
    age: 'Âge', experience: 'Expérience (ans)', salary: 'Salaire attendu (USD/mois)',
    bio: 'À propos de vous', skills: 'Compétences', photos: 'Photos',
    passport_number: 'Numéro de passeport', passport_photo: 'Photo du passeport',
    no_account: 'Pas de compte ?', have_account: 'Vous avez déjà un compte ?',
    sign_in_link: 'Se connecter', sign_up_link: "S'inscrire",
    create_profile: 'Créer un profil', step1: 'Étape 1 sur 2 — Informations du profil',
    fill_required: 'Remplissez les champs requis',
    min_photos: 'Téléchargez au moins 3 photos',
    max_photos: '5 photos maximum',
    photos_later: 'Les photos seront ajoutées plus tard',
    photos_continue: 'Continuez pour compléter votre profil',
    registration_failed: "Échec de l'inscription",
    age_range: "L'âge de l'employée doit être entre 20 et 45 ans",
    select_nationality: 'Sélectionner la nationalité',
    search_country: 'Rechercher un pays…',

    // Browse
    good_morning: 'Bonjour',
    welcome: 'Bienvenue',
    search_placeholder: 'Rechercher nom, nationalité, compétence…',
    browse_maids: 'Parcourir les employées',
    no_maids: 'Aucune employée trouvée',
    load_failed: 'Échec du chargement',
    save_failed: 'Échec de la sauvegarde',

    // Saved
    saved_maids: 'Profils sauvegardés',
    no_saved: 'Aucun profil sauvegardé',

    // Subscription
    subscription_title: 'Abonnement Employée',
    subscription_sub: 'Restez visible pour des centaines de familles',
    monthly_plan: 'Plan mensuel', annual_plan: 'Plan annuel',
    most_popular: '⭐ Le plus populaire', proceed_payment: 'Procéder au paiement →',
    skip_dev: 'Passer (développeurs uniquement)',

    // Pending
    under_review: 'En cours d\'examen',
    review_sub: 'Votre passeport et selfie sont vérifiés par l\'équipe Servix.',
    check_status: 'Vérifier le statut',
    verified_title: 'Identité vérifiée !',
    verified_sub: 'Vos documents ont été approuvés. Choisissez un plan d\'abonnement.',
    rejected_title: 'Vérification rejetée',
    rejected_sub: 'Vos documents ne répondaient pas aux exigences. Veuillez resoumettre.',
    resubmit: 'Resoumettre les documents',
    choose_subscription: 'Choisir un abonnement →',
    auto_check: 'Vérification automatique toutes les 30 secondes.',

    // Login
    login_maid: 'Connexion Employée',
    login_hw: 'Connexion Femme au foyer',
    sign_in_maid: 'Connexion Employée',
    sign_in_hw: 'Connexion Femme au foyer',

    // Settings / Language
    language: 'Langue', change_language: 'Changer de langue',
    lang_en: 'Anglais', lang_ar: 'Arabe', lang_fr: 'Français', lang_ha: 'Haoussa',
  },

  ha: {
    // Common (Hausa)
    continue: 'Ci gaba', cancel: 'Soke', save: 'Ajiye', back: 'Komawa',
    submit: 'Aika', loading: 'Ana lodi…', done: 'An gama', ok: 'To',
    error: 'Kuskure', success: 'An yi nasara', retry: 'Sake gwadawa',

    // Auth
    sign_in: 'Shiga', sign_up: 'Yi rajista', logout: 'Fita',
    email: 'Imel', password: 'Kalmar sirri', phone: 'Waya',
    full_name: 'Cikakken suna', nationality: 'Ƙasa',
    age: 'Shekaru', experience: 'Ƙwarewa (shekaru)', salary: 'Albashin da ake sa ran (USD/wata)',
    bio: 'Game da kai', skills: 'Iyawa', photos: 'Hotuna',
    passport_number: 'Lambar fasfo', passport_photo: 'Hoto na fasfo',
    no_account: 'Ba ka da asusun?', have_account: 'Kana da asusun?',
    sign_in_link: 'Shiga', sign_up_link: 'Yi rajista',
    create_profile: 'Ƙirƙiri bayanin martaba', step1: 'Mataki na 1 daga 2 — Bayanan martaba',
    fill_required: 'Cika filayen da ake bukata',
    min_photos: 'Loda hotuna 3 aƙalla',
    max_photos: 'Mafi yawan hotuna 5',
    photos_later: 'Za a ƙara hotuna daga baya',
    photos_continue: 'Ci gaba don kammala bayanin martabarka',
    registration_failed: 'Rajista ta kasa',
    age_range: 'Shekaru na mai aikin gida ya zama tsakanin 20 zuwa 45',
    select_nationality: 'Zaɓi ƙasa',
    search_country: 'Nemi ƙasa…',

    // Browse
    good_morning: 'Ina kwana',
    welcome: 'Barka da zuwa',
    search_placeholder: 'Nemi suna, ƙasa, ko iyawa…',
    browse_maids: 'Duba ma\'aikata',
    no_maids: 'Ba a sami ma\'aikata ba',
    load_failed: 'Lodi ya kasa',
    save_failed: 'Ajiye ya kasa',

    // Saved
    saved_maids: 'Ma\'aikata da aka adana',
    no_saved: 'Babu ma\'aikata da aka adana tukuna',

    // Subscription
    subscription_title: 'Biyan kuɗi na ma\'aikata',
    subscription_sub: 'Kasance a gani ga iyalai ɗaruruwa',
    monthly_plan: 'Tsarin wata-wata', annual_plan: 'Tsarin shekara-shekara',
    most_popular: '⭐ Mafi shahara', proceed_payment: 'Ci gaba zuwa biyan kuɗi →',
    skip_dev: 'Tsallake yanzu (masu haɓakawa kawai)',

    // Pending
    under_review: 'Ana nazari',
    review_sub: 'Ana tabbatar da fasfo da hoton fuska ta ƙungiyar Servix.',
    check_status: 'Duba matsayi',
    verified_title: 'An tabbatar da asali!',
    verified_sub: 'An amince da takardun ku. Ci gaba don zaɓar tsarin biyan kuɗi.',
    rejected_title: 'An ƙi tabbatarwa',
    rejected_sub: 'Takardun ku ba su cika bukatun ba. Da fatan sake aika.',
    resubmit: 'Sake aika takardun',
    choose_subscription: 'Zaɓi tsarin biyan kuɗi →',
    auto_check: 'Ana bincike kai tsaye kowane daƙiƙa 30.',

    // Login
    login_maid: 'Shiga a matsayin ma\'aikaci',
    login_hw: 'Shiga a matsayin uwargida',
    sign_in_maid: "Shigan ma'aikaci",
    sign_in_hw: 'Shigan uwargida',

    // Settings / Language
    language: 'Harshe', change_language: 'Canza harshe',
    lang_en: 'Turanci', lang_ar: 'Larabci', lang_fr: 'Faransanci', lang_ha: 'Hausa',
  },
};

export function useTranslation() {
  const lang = useLangStore(s => s.lang);
  const t = (key) => T[lang]?.[key] ?? T.en[key] ?? key;
  return { t, lang };
}

export const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'ar', label: 'العربية',  flag: '🇪🇬' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ha', label: 'Hausa',    flag: '🇳🇬' },
];

export default T;

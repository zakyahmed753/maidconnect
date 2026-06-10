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

    // MaidDetail
    open_chat: 'Open Chat', opening: 'Opening…',
    hire_this_maid: 'Hire this Maid', already_hired: 'Already Hired ✅',
    hire_success: 'Maid hired successfully!', hire_failed: 'Failed to hire',
    about: 'About', details: 'Details', languages_spoken: 'Languages',
    reviews_section: 'Reviews', no_reviews_yet: 'No reviews yet. Be the first!',
    write_review: '✍️ Write Review', submit_review: 'Submit Review',
    profile_title: 'Profile',

    // HW Profile menu
    menu_saved: 'Saved Maids', menu_messages: 'Messages',
    menu_payments: 'Payments', menu_notifications: 'Notifications',
    menu_support: 'Support', menu_sign_out: 'Sign Out',
    edit_btn: '✏️ Edit', edit_profile: 'Edit Profile',

    // Notifications
    notifications_title: 'Notifications', mark_all_read: 'Mark all read',

    // Chats
    chats_title: 'Messages', no_chats: 'No chats yet',
    subscribe_chat_title: 'Subscribe to Access Messages',
    subscribe_chat_body: 'Chat with maids and manage your hiring process with a monthly subscription.',
    subscribe_btn: 'Subscribe — EGP 1,000/mo',

    // Saved
    saved_title: 'Saved Maids ❤️', no_saved_maids: 'No saved maids yet',

    // Maid dash
    views: 'Views', likes: 'Likes', chats_stat: 'Chats',

    // Tab labels
    tab_browse: 'Browse', tab_saved: 'Saved', tab_chats: 'Chats', tab_alerts: 'Alerts', tab_me: 'Me', tab_home: 'Home',

    // Filters
    filter_all: 'All', filter_available: 'Available', filter_top_rated: 'Top Rated',
    filter_african: 'African', filter_asian: 'Asian', filter_cooking: 'Cooking',
    filter_childcare: 'Childcare', filter_eldercare: 'Eldercare',
    filter_title: 'Filters', filter_salary: 'Salary Range (EGP)',
    filter_min: 'Min', filter_max: 'Max', filter_age: 'Age Range',
    filter_exp: 'Min Experience', filter_sort: 'Sort By',
    filter_newest: 'Newest', filter_top_rated_sort: 'Top Rated', filter_highest_salary: 'Highest Salary',
    filter_reset: 'Reset', filter_apply: 'Apply Filters', filter_any: 'Any',

    // Login
    welcome_back: 'Welcome Back', role_customer: '🏠 Customer', role_maid: '👩 Maid',

    // Register
    select_nationality_err: 'Select nationality', bio_required: 'Bio is required',
    phone_required: 'Phone number is required',
    phone_invalid_eg: 'Phone must be a valid Egyptian number (e.g. 01012345678)',
    upload_passport_photo_err: 'Upload a photo of your passport',
    national_id_label: 'National ID Number', national_id_ph: '14-digit National ID',
    valid_format: '✓ Valid format', must_be_20_45: 'Must be 20–45',
    tap_upload_passport: 'Tap to Upload Passport Photo',
    clear_photo_of_page: 'Clear photo of the photo page',
    expected_salary_egp: 'Expected Salary (EGP/mo)',
    languages_spoken_label: 'Languages Spoken',
    tap_upload_photos: 'Tap to Upload Photos',
    professional_photos_note: 'Clear, professional photos only',

    // RegisterHousewife
    customer_subtitle: 'Customer — Find your trusted maid',
    select_area_err: 'Please select your area in Cairo',
    phone_invalid_hw: 'Phone must be a valid Egyptian mobile number (e.g. 01012345678)',
    your_area_cairo: 'Your area in Cairo', area_soon_badge: 'soon',

    // Chat
    chat_online: '● Online', voice_note: '🎙 Voice note',
    type_message: 'Type a message…',
    failed_load_msgs: 'Failed to load messages', failed_send_msg: 'Failed to send',

    // MaidCard
    available_badge: '● Available', unavailable_badge: 'Unavailable',
    exp_stat: 'Exp', salary_stat: 'Salary', reviews_short: 'rev',

    // MaidDetail
    terms_title: 'Terms & Conditions',
    terms_body_short: 'Servix is a communication platform only. We connect customers with domestic service providers and are not responsible for the conduct, performance, or actions of any maid or customer. All agreements are between the two parties directly.',
    terms_read_full: '📄 Read Full Terms & Conditions (PDF)',
    terms_agree_label: 'I have read and agree to the Terms & Conditions',
    confirm_hire_btn: '👑 Confirm Hire Request',
    details_experience: 'Experience', details_salary: 'Expected Salary',
    details_age: 'Age', details_origin: 'Origin',
    no_bio: 'No bio provided.',
    no_reviews_label: 'No reviews yet', no_reviews_sub: 'Be the first to leave a review after hiring',
    saved_label: '❤️ Saved', save_label: '🤍 Save',
    request_sent_awaiting: '⏳ Request Sent — Awaiting Approval',
    review_after_hire_note: 'Only available after hiring this maid',
    share_exp_optional: 'Share your experience (optional)…',
    no_comment_left: 'No comment left',
    please_agree_terms: 'Please agree to the Terms & Conditions',

    // HiredMaids
    hired_maid_title: 'My Hired Maid 👑', hired_maid_sub: 'Manage your current domestic helper',
    no_hired_maid: 'No hired maid yet',
    no_hired_sub: 'Browse available maids and send a hire request to get started.',
    browse_maids_btn: '🔍 Browse Maids',
    hired_on: 'Hired on', skills_label_info: 'Skills', release_vacancy: '↩ Release Vacancy',
    rate_required_release: 'A review is required before releasing the vacancy. Your feedback helps other families.',
    share_exp_release: 'Share your experience (optional but appreciated)…',
    submit_review_release: 'Submit Review & Release Vacancy',
    please_rate_before_release: 'Please select a star rating before releasing',

    // HireRequest
    incoming_label: 'Incoming', hire_requests_title: 'Hire Requests 👑',
    review_before_deciding: 'Review customer profile before deciding',
    no_pending_requests: 'No pending requests',
    no_pending_sub: 'When a customer wants to hire you, their request will appear here.',
    monthly_limit_reached: 'Monthly limit reached',
    monthly_limit_desc: 'You have 2 hires this month. Renew to accept more.',
    request_declined: 'Request declined', failed_to_respond: 'Failed to respond',
    view_customer_profile: '👁 View Customer Profile',
    verified_subscriber: '✓ Verified Subscriber',
    sub_status_unknown: 'Subscription status unknown',
    area_info: 'Area', phone_info: 'Phone', country_info: 'Country',
    request_date_info: 'Request date',
    btn_decline: '✗ Decline', btn_accept_hire: '✓ Accept Hire',

    // HiredCelebration
    congratulations: 'Congratulations!', youre_hired: "You're Hired! 👑",
    hired_body: 'You have officially accepted the hire request. The customer has been notified.',
    hired_profile_unavail: 'Your profile is now marked unavailable',
    hired_email_sent: 'Customer received a confirmation email',
    hired_chat_employer: 'Chat with your employer via Messages',
    go_to_dashboard: 'Go to Dashboard →',

    // MaidDash
    active_subscription: 'Active Subscription',
    areas_you_serve: 'Areas You Serve',
    areas_serve_sub: "Select all Cairo areas where you're available to work",
    service_areas_updated: 'Service areas updated!', save_areas_fail: 'Failed to save areas',
    hire_req_waiting: 'Hire Request Waiting!', hire_reqs_waiting: 'Hire Requests Waiting!',
    tap_review_decide: 'Tap to review and accept or decline',
    set_service_areas: 'Set your service areas', tap_to_update: 'Tap to update',
    area_find_notice: 'Customers can only find you if your area is set',
    currently_hired_badge: '✓ Currently Hired',
    currently_hired_desc: 'You are in an active engagement. When released by the customer you will return to browse.',
    open_support: 'Open Support Ticket', contact_admin_note: 'Contact admin for any issues',
    deactivates_profile: 'Deactivates your profile',
    my_reviews: '⭐ My Reviews', no_reviews_maid: 'No reviews yet',
    no_reviews_maid_sub: 'Work hard and deliver great service — your reviews will appear here!',
    no_comment_short: 'No comment',
    menu_hire_requests: 'Hire Requests', menu_messages2: 'Messages',
    menu_payments2: 'Payments', menu_referrals: 'Referrals',
    menu_analytics: 'Analytics', menu_notifications2: 'Notifications',
    menu_support2: 'Support', menu_delete_account: 'Delete Account',
    menu_sign_out: 'Sign Out', share_code_earn: 'Share your code & earn rewards',

    // HWProfile
    my_hired_maid: 'My Hired Maid', delete_account: 'Delete Account',
    delete_confirm_title: 'Delete Account',
    delete_confirm_body: 'Your account will be deactivated. Only admin can restore it. Are you sure?',
    confirm_deletion: 'Confirm Deletion',
    confirm_deletion_body: 'This action cannot be undone by yourself. Proceed?',
    yes_delete: 'Yes, Delete', failed_delete: 'Failed to delete account',

    // Support
    support_title: 'Customer Support', support_sub: 'We typically respond within 24 hours',
    new_ticket: 'New Ticket', my_tickets: 'My Tickets',
    priority_label: 'Priority', priority_low: 'Low', priority_medium: 'Medium', priority_high: 'High',
    subject_label: 'Subject', message_label2: 'Message',
    subject_ph: 'Brief description of your issue',
    message_ph: 'Describe your issue in detail…',
    submitting: 'Submitting…', submit_ticket: 'Submit Ticket', no_tickets: 'No tickets yet',
    subject_msg_required: 'Subject and message are required',
    ticket_submitted: 'Ticket submitted', ticket_submitted_sub: "We'll get back to you soon",

    // PaymentResult
    sub_activated: 'Subscription Activated!', receipt_submitted_title: 'Receipt Submitted',
    offline_confirmed_body: 'Your offline payment has been confirmed by admin.\nYour subscription is now active.',
    offline_pending_body: "Your payment receipt has been sent to admin.\nWe'll activate your subscription within 24 hours after confirming your transfer.",
    amount_confirmed_label: 'Amount Confirmed', amount_submitted_label: 'Amount Submitted',
    confirmed_badge: '✓ Confirmed', pending_admin_badge: '⏳ Pending Admin Confirmation',
    go_to_app: 'Go to App →', check_status_btn2: '🔄 Check Status',
    payment_confirmed_online: 'Payment Confirmed!', amount_paid_label: 'Amount Paid',
    verifying_payment: 'Verifying payment…', go_home: 'Go to Home →',
    still_pending: 'Still pending', could_not_check: 'Could not check status',
    payment_of_egp: 'Your payment of EGP ',
    payment_was_successful: ' was successful.\nYour subscription is now active.',
    offline_notification_note: "You'll also receive a notification when admin confirms your payment.\nYou can close this screen and come back later.",

    // Chats list
    no_msgs_yet: 'No messages yet',

    // Analytics
    analytics_title: 'Analytics', analytics_sub: 'Your profile performance',
    stat_views: 'Profile Views', stat_likes: 'Likes Received',
    stat_chats2: 'Chat Requests', stat_hired: 'Times Hired', summary_label: 'Summary',

    // PaymentHistory
    payments_title: 'Payments', payments_sub: 'Subscriptions & commissions',
    no_payments: 'No payments yet', transactions_here: 'Your transactions will appear here',

    // EditHWProfile
    edit_profile_title2: 'Edit Profile', field_full_name: 'Full Name',
    field_city: 'City', field_country: 'Country',
    name_ph: 'Your name', city_ph: 'e.g. Cairo', country_ph: 'e.g. Egypt',
    name_required_err: 'Name is required', profile_updated: 'Profile updated',
    update_failed: 'Update failed', saving: 'Saving…', save_changes: 'Save Changes',

    // Subscription extra
    monthly_plan_name: 'Monthly Plan', pricing_for: 'Pricing for',
    standard_pricing: 'Standard pricing',
    plan_active_listing: 'Active profile listing', plan_photos: 'Up to 5 photos',
    plan_chat: 'Chat messaging', plan_analytics: 'Basic analytics', plan_support: 'Priority support',
    have_coupon: 'Have a referral or promo code? (Optional)',
    coupon_applied_pct: 'Code applied —', you_save: 'You save EGP',
    remove_coupon: 'Remove', pay_cash: 'Pay via Cash Transfer',
    arrange_offline: 'Arrange payment offline with admin', per_month: '/month',
    receipt_under_review: '⏳ Receipt Under Review',
    receipt_review_body: 'Your payment receipt was submitted and is awaiting admin confirmation. You\'ll receive a notification once confirmed.',
    check_confirmation_status: '🔄 Check Confirmation Status',
    submit_new_receipt: 'Submit a new receipt instead',
    cash_transfer_title: '💵 Cash Transfer Payment',
    cash_transfer_sub: 'Transfer your subscription fee to one of the accounts below, then upload your receipt to submit.',
    amount_due: 'Amount Due', transfer_to: 'Transfer To', account_name: 'Account Name',
    upload_receipt: 'Upload Receipt',
    tap_upload_receipt: 'Tap to Upload Receipt',
    receipt_screenshot_note: 'Screenshot or photo of transfer confirmation',
    try_again_btn: 'Try Again', submit_receipt_btn: 'Submit Receipt for Confirmation',
    already_paid_check: "Already paid? Tap to check if admin activated your subscription",

    // Subscription extra 2
    receipt_rejected: 'Receipt rejected', receipt_rejected_sub: 'Please re-upload a clear receipt.',
    admin_not_confirmed_yet: "Admin hasn't confirmed yet.",
    checking_label: 'Checking…', coupon_invalid: 'Invalid coupon code',
    discount_applied_suffix: '% discount applied!', apply_label: 'Apply',

    // MaidDetail extra
    review_submitted: 'Review submitted!', review_submit_failed: 'Failed to submit review',
    hire_req_sent: '👑 Request Sent!', hire_req_sent_sub: 'Waiting for the maid to approve.',
    chat_open_failed: 'Failed to open chat', please_rate_star: 'Please select a star rating',
    rate_label: 'Rate', login_success_toast: 'Welcome back! 👋',

    // HiredMaids extra
    next_hire_free:     '✓ Next hire is free (grace period)',
    next_hire_fee_500:  '⚠ Next hire fee: EGP 500',
    next_hire_fee_700:  '⚠ Next hire fee: EGP 700',
    next_hire_fee_1000: '⚠ Next hire fee: EGP 1,000',
    vacancy_released: 'Maid released', vacancy_released_sub: 'You have 3 days to hire a free replacement.',
    release_failed: 'Failed to release',
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

    // MaidDetail
    open_chat: 'فتح المحادثة', opening: 'جارٍ الفتح…',
    hire_this_maid: 'توظيف هذه العاملة', already_hired: 'تم التوظيف ✅',
    hire_success: 'تم توظيف العاملة بنجاح!', hire_failed: 'فشل التوظيف',
    about: 'نبذة', details: 'التفاصيل', languages_spoken: 'اللغات',
    reviews_section: 'التقييمات', no_reviews_yet: 'لا توجد تقييمات بعد. كن الأول!',
    write_review: '✍️ كتابة تقييم', submit_review: 'إرسال التقييم',
    profile_title: 'الملف الشخصي',

    // HW Profile menu
    menu_saved: 'العمالة المحفوظة', menu_messages: 'الرسائل',
    menu_payments: 'المدفوعات', menu_notifications: 'الإشعارات',
    menu_support: 'الدعم', menu_sign_out: 'تسجيل الخروج',
    edit_btn: '✏️ تعديل', edit_profile: 'تعديل الملف الشخصي',

    // Notifications
    notifications_title: 'الإشعارات', mark_all_read: 'تحديد الكل كمقروء',

    // Chats
    chats_title: 'الرسائل', no_chats: 'لا محادثات بعد',
    subscribe_chat_title: 'اشترك للوصول إلى الرسائل',
    subscribe_chat_body: 'تحدث مع العمالة وأدر عملية التوظيف باشتراك شهري.',
    subscribe_btn: 'اشتراك — 1,000 جنيه/شهر',

    // Saved
    saved_title: 'العمالة المحفوظة ❤️', no_saved_maids: 'لا توجد عمالة محفوظة بعد',

    // Maid dash
    views: 'مشاهدات', likes: 'إعجابات', chats_stat: 'محادثات',

    // Tab labels
    tab_browse: 'تصفح', tab_saved: 'محفوظ', tab_chats: 'رسائل', tab_alerts: 'تنبيهات', tab_me: 'أنا', tab_home: 'الرئيسية',

    // Filters
    filter_all: 'الكل', filter_available: 'متاحة', filter_top_rated: 'الأعلى تقييماً',
    filter_african: 'أفريقية', filter_asian: 'آسيوية', filter_cooking: 'طبخ',
    filter_childcare: 'رعاية أطفال', filter_eldercare: 'رعاية مسنين',
    filter_title: 'التصفية', filter_salary: 'نطاق الراتب (جنيه)',
    filter_min: 'أدنى', filter_max: 'أقصى', filter_age: 'نطاق العمر',
    filter_exp: 'أدنى خبرة', filter_sort: 'ترتيب حسب',
    filter_newest: 'الأحدث', filter_top_rated_sort: 'الأعلى تقييماً', filter_highest_salary: 'أعلى راتب',
    filter_reset: 'إعادة تعيين', filter_apply: 'تطبيق التصفية', filter_any: 'الكل',

    // Login
    welcome_back: 'أهلاً بعودتك', role_customer: '🏠 عميلة', role_maid: '👩 عاملة',

    // Register
    select_nationality_err: 'اختر الجنسية', bio_required: 'السيرة الذاتية مطلوبة',
    phone_required: 'رقم الهاتف مطلوب',
    phone_invalid_eg: 'يجب أن يكون رقم هاتف مصري صالح (مثل: 01012345678)',
    upload_passport_photo_err: 'يرجى رفع صورة جواز السفر',
    national_id_label: 'رقم الهوية الوطنية', national_id_ph: '14 رقماً',
    valid_format: '✓ صيغة صحيحة', must_be_20_45: 'يجب أن يكون بين 20 و45',
    tap_upload_passport: 'انقر لرفع صورة جواز السفر',
    clear_photo_of_page: 'صورة واضحة لصفحة البيانات',
    expected_salary_egp: 'الراتب المتوقع (جنيه/شهر)',
    languages_spoken_label: 'اللغات المنطوقة',
    tap_upload_photos: 'انقر لرفع الصور',
    professional_photos_note: 'صور واضحة ومهنية فقط',

    // RegisterHousewife
    customer_subtitle: 'عميلة — ابحثي عن عاملتك الموثوقة',
    select_area_err: 'يرجى اختيار منطقتك في القاهرة',
    phone_invalid_hw: 'يجب أن يكون رقم هاتف محمول مصري صالح (مثل: 01012345678)',
    your_area_cairo: 'منطقتك في القاهرة', area_soon_badge: 'قريباً',

    // Chat
    chat_online: '● متصل', voice_note: '🎙 رسالة صوتية',
    type_message: 'اكتب رسالة…',
    failed_load_msgs: 'فشل تحميل الرسائل', failed_send_msg: 'فشل الإرسال',

    // MaidCard
    available_badge: '● متاحة', unavailable_badge: 'غير متاحة',
    exp_stat: 'خبرة', salary_stat: 'الراتب', reviews_short: 'تقييم',

    // MaidDetail
    terms_title: 'الشروط والأحكام',
    terms_body_short: 'Servix منصة تواصل فقط. نربط العملاء بمزودي الخدمة المنزلية ولا نتحمل مسؤولية أي تصرفات من أي طرف.',
    terms_read_full: '📄 قراءة كامل الشروط والأحكام (PDF)',
    terms_agree_label: 'لقد قرأت الشروط والأحكام وأوافق عليها',
    confirm_hire_btn: '👑 تأكيد طلب التوظيف',
    details_experience: 'الخبرة', details_salary: 'الراتب المتوقع',
    details_age: 'العمر', details_origin: 'الجنسية',
    no_bio: 'لا توجد نبذة.',
    no_reviews_label: 'لا توجد تقييمات بعد',
    no_reviews_sub: 'كن أول من يترك تقييماً بعد التوظيف',
    saved_label: '❤️ محفوظة', save_label: '🤍 حفظ',
    request_sent_awaiting: '⏳ تم إرسال الطلب — في انتظار الموافقة',
    review_after_hire_note: 'متاح فقط بعد توظيف هذه العاملة',
    share_exp_optional: 'شارك تجربتك (اختياري)…',
    no_comment_left: 'لا يوجد تعليق',
    please_agree_terms: 'يرجى الموافقة على الشروط والأحكام',

    // HiredMaids
    hired_maid_title: 'عاملتي المُوظَّفة 👑', hired_maid_sub: 'إدارة عاملتك المنزلية الحالية',
    no_hired_maid: 'لا توجد عاملة موظفة بعد',
    no_hired_sub: 'تصفح العمالة المتاحة وأرسل طلب توظيف للبدء.',
    browse_maids_btn: '🔍 تصفح العمالة',
    hired_on: 'تاريخ التوظيف', skills_label_info: 'المهارات', release_vacancy: '↩ إخلاء الشاغر',
    rate_required_release: 'التقييم مطلوب قبل إخلاء الشاغر. مشاركتك تساعد الأسر الأخرى.',
    share_exp_release: 'شارك تجربتك (اختياري لكن مُقدَّر)…',
    submit_review_release: 'إرسال التقييم وإخلاء الشاغر',
    please_rate_before_release: 'يرجى اختيار تقييم بالنجوم أولاً',

    // HireRequest
    incoming_label: 'واردة', hire_requests_title: 'طلبات التوظيف 👑',
    review_before_deciding: 'راجع ملف العميلة قبل اتخاذ القرار',
    no_pending_requests: 'لا توجد طلبات معلقة',
    no_pending_sub: 'عندما تريد عميلة توظيفك، سيظهر طلبها هنا.',
    monthly_limit_reached: 'تم الوصول إلى الحد الشهري',
    monthly_limit_desc: 'لديك توظيفان هذا الشهر. جدد للقبول بالمزيد.',
    request_declined: 'تم رفض الطلب', failed_to_respond: 'فشل الرد',
    view_customer_profile: '👁 عرض ملف العميلة',
    verified_subscriber: '✓ مشتركة موثقة',
    sub_status_unknown: 'حالة الاشتراك غير معروفة',
    area_info: 'المنطقة', phone_info: 'الهاتف', country_info: 'البلد',
    request_date_info: 'تاريخ الطلب',
    btn_decline: '✗ رفض', btn_accept_hire: '✓ قبول التوظيف',

    // HiredCelebration
    congratulations: 'مبروك!', youre_hired: 'تم قبولك! 👑',
    hired_body: 'لقد قبلت رسمياً طلب التوظيف. تم إخطار العميلة.',
    hired_profile_unavail: 'ملفك الشخصي محدد الآن كغير متاح',
    hired_email_sent: 'تم إرسال بريد تأكيد للعميلة',
    hired_chat_employer: 'تواصل مع صاحب العمل عبر الرسائل',
    go_to_dashboard: 'الذهاب إلى لوحة التحكم →',

    // MaidDash
    active_subscription: 'اشتراك نشط',
    areas_you_serve: 'مناطق خدمتك',
    areas_serve_sub: 'اختر جميع مناطق القاهرة التي تستطيعين العمل فيها',
    service_areas_updated: 'تم تحديث مناطق الخدمة!', save_areas_fail: 'فشل حفظ المناطق',
    hire_req_waiting: 'طلب توظيف في الانتظار!', hire_reqs_waiting: 'طلبات توظيف في الانتظار!',
    tap_review_decide: 'اضغط للمراجعة والقبول أو الرفض',
    set_service_areas: 'حدد مناطق خدمتك', tap_to_update: 'اضغط للتحديث',
    area_find_notice: 'يمكن للعملاء إيجادك فقط إذا تم تحديد منطقتك',
    currently_hired_badge: '✓ موظفة حالياً',
    currently_hired_desc: 'أنت في ارتباط نشط. عند إخلاء الشاغر ستعودين للتصفح.',
    open_support: 'فتح تذكرة دعم', contact_admin_note: 'تواصل مع الإدارة لأي مشكلة',
    deactivates_profile: 'يوقف تشغيل ملفك الشخصي',
    my_reviews: '⭐ تقييماتي', no_reviews_maid: 'لا توجد تقييمات بعد',
    no_reviews_maid_sub: 'اعملي بجد وقدمي خدمة ممتازة — ستظهر تقييماتك هنا!',
    no_comment_short: 'لا تعليق',
    menu_hire_requests: 'طلبات التوظيف', menu_messages2: 'الرسائل',
    menu_payments2: 'المدفوعات', menu_referrals: 'الإحالات',
    menu_analytics: 'التحليلات', menu_notifications2: 'الإشعارات',
    menu_support2: 'الدعم', menu_delete_account: 'حذف الحساب',
    menu_sign_out: 'تسجيل الخروج', share_code_earn: 'شارك كودك واكسب مكافآت',

    // HWProfile
    my_hired_maid: 'عاملتي المُوظَّفة', delete_account: 'حذف الحساب',
    delete_confirm_title: 'حذف الحساب',
    delete_confirm_body: 'سيتم تعطيل حسابك. يمكن للإدارة فقط استعادته. هل أنت متأكد؟',
    confirm_deletion: 'تأكيد الحذف',
    confirm_deletion_body: 'لا يمكنك التراجع عن هذا الإجراء بنفسك. هل تريد المتابعة؟',
    yes_delete: 'نعم، احذف', failed_delete: 'فشل حذف الحساب',

    // Support
    support_title: 'دعم العملاء', support_sub: 'نرد في العادة خلال 24 ساعة',
    new_ticket: 'تذكرة جديدة', my_tickets: 'تذاكري',
    priority_label: 'الأولوية', priority_low: 'منخفضة', priority_medium: 'متوسطة', priority_high: 'عالية',
    subject_label: 'الموضوع', message_label2: 'الرسالة',
    subject_ph: 'وصف مختصر لمشكلتك',
    message_ph: 'اشرح مشكلتك بالتفصيل…',
    submitting: 'جارٍ الإرسال…', submit_ticket: 'إرسال التذكرة', no_tickets: 'لا توجد تذاكر بعد',
    subject_msg_required: 'الموضوع والرسالة مطلوبان',
    ticket_submitted: 'تم إرسال التذكرة', ticket_submitted_sub: 'سنتواصل معك قريباً',

    // PaymentResult
    sub_activated: 'تم تفعيل الاشتراك!', receipt_submitted_title: 'تم إرسال الإيصال',
    offline_confirmed_body: 'تم تأكيد دفعتك غير المتصلة من قِبل الإدارة.\nاشتراكك الآن نشط.',
    offline_pending_body: 'تم إرسال إيصال دفعتك إلى الإدارة.\nسنفعّل اشتراكك خلال 24 ساعة.',
    amount_confirmed_label: 'المبلغ المؤكد', amount_submitted_label: 'المبلغ المرسل',
    confirmed_badge: '✓ مؤكد', pending_admin_badge: '⏳ في انتظار تأكيد الإدارة',
    go_to_app: 'الذهاب إلى التطبيق →', check_status_btn2: '🔄 التحقق من الحالة',
    payment_confirmed_online: 'تم تأكيد الدفع!', amount_paid_label: 'المبلغ المدفوع',
    verifying_payment: 'جارٍ التحقق من الدفع…', go_home: 'الذهاب إلى الرئيسية →',
    still_pending: 'لا يزال معلقاً', could_not_check: 'تعذّر التحقق من الحالة',
    payment_of_egp: 'دفعتك بمبلغ ',
    payment_was_successful: ' كانت ناجحة.\nاشتراكك الآن نشط.',
    offline_notification_note: 'ستتلقى أيضًا إشعارًا عند تأكيد الإدارة لدفعتك.\nيمكنك إغلاق الشاشة والعودة لاحقًا.',

    // Chats list
    no_msgs_yet: 'لا رسائل بعد',

    // Analytics
    analytics_title: 'التحليلات', analytics_sub: 'أداء ملفك الشخصي',
    stat_views: 'مشاهدات الملف', stat_likes: 'الإعجابات',
    stat_chats2: 'طلبات المحادثة', stat_hired: 'مرات التوظيف', summary_label: 'ملخص',

    // PaymentHistory
    payments_title: 'المدفوعات', payments_sub: 'الاشتراكات والعمولات',
    no_payments: 'لا مدفوعات بعد', transactions_here: 'ستظهر معاملاتك هنا',

    // EditHWProfile
    edit_profile_title2: 'تعديل الملف الشخصي', field_full_name: 'الاسم الكامل',
    field_city: 'المدينة', field_country: 'البلد',
    name_ph: 'اسمك', city_ph: 'مثل: القاهرة', country_ph: 'مثل: مصر',
    name_required_err: 'الاسم مطلوب', profile_updated: 'تم تحديث الملف الشخصي',
    update_failed: 'فشل التحديث', saving: 'جارٍ الحفظ…', save_changes: 'حفظ التغييرات',

    // Subscription extra
    monthly_plan_name: 'الخطة الشهرية', pricing_for: 'تسعير خاص بـ',
    standard_pricing: 'التسعير القياسي',
    plan_active_listing: 'إدراج نشط للملف الشخصي', plan_photos: 'حتى 5 صور',
    plan_chat: 'المراسلة الفورية', plan_analytics: 'تحليلات أساسية', plan_support: 'دعم ذو أولوية',
    have_coupon: 'هل لديك رمز إحالة أو عرض؟ (اختياري)',
    coupon_applied_pct: 'تم تطبيق الكود —', you_save: 'توفر',
    remove_coupon: 'إزالة', pay_cash: 'الدفع عبر التحويل النقدي',
    arrange_offline: 'ترتيب الدفع مع الإدارة', per_month: '/شهر',
    receipt_under_review: '⏳ الإيصال قيد المراجعة',
    receipt_review_body: 'تم إرسال إيصال دفعتك وينتظر تأكيد الإدارة. ستتلقى إشعاراً عند التأكيد.',
    check_confirmation_status: '🔄 التحقق من حالة التأكيد',
    submit_new_receipt: 'إرسال إيصال جديد',
    cash_transfer_title: '💵 الدفع بالتحويل النقدي',
    cash_transfer_sub: 'حوّل رسوم اشتراكك إلى أحد الحسابات أدناه، ثم ارفع إيصالك.',
    amount_due: 'المبلغ المستحق', transfer_to: 'التحويل إلى', account_name: 'اسم الحساب',
    upload_receipt: 'رفع الإيصال', tap_upload_receipt: 'انقر لرفع الإيصال',
    receipt_screenshot_note: 'لقطة شاشة أو صورة من تأكيد التحويل',
    try_again_btn: 'حاول مجدداً', submit_receipt_btn: 'إرسال الإيصال للتأكيد',
    already_paid_check: 'دفعت بالفعل؟ انقر للتحقق إذا فعّلت الإدارة اشتراكك',

    // Subscription extra 2
    receipt_rejected: 'تم رفض الإيصال', receipt_rejected_sub: 'يرجى إعادة رفع إيصال واضح.',
    admin_not_confirmed_yet: 'لم يؤكد المسؤول بعد.',
    checking_label: 'جارٍ التحقق…', coupon_invalid: 'رمز كوبون غير صالح',
    discount_applied_suffix: '% خصم مُطبَّق!', apply_label: 'تطبيق',

    // MaidDetail extra
    review_submitted: 'تم إرسال التقييم!', review_submit_failed: 'فشل إرسال التقييم',
    hire_req_sent: '👑 تم إرسال الطلب!', hire_req_sent_sub: 'في انتظار موافقة العاملة.',
    chat_open_failed: 'فشل فتح المحادثة', please_rate_star: 'يرجى اختيار تقييم بالنجوم',
    rate_label: 'تقييم', login_success_toast: 'أهلاً بعودتك! 👋',

    // HiredMaids extra
    next_hire_free:     '✓ التوظيف التالي مجاني (فترة السماح)',
    next_hire_fee_500:  '⚠ رسوم التوظيف التالي: 500 جنيه',
    next_hire_fee_700:  '⚠ رسوم التوظيف التالي: 700 جنيه',
    next_hire_fee_1000: '⚠ رسوم التوظيف التالي: 1,000 جنيه',
    vacancy_released: 'تم إخلاء الشاغر', vacancy_released_sub: 'لديك 3 أيام لتوظيف بديل.',
    release_failed: 'فشل الإخلاء',
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

    // MaidDetail
    open_chat: 'Ouvrir le chat', opening: 'Ouverture…',
    hire_this_maid: 'Embaucher cette employée', already_hired: 'Déjà embauchée ✅',
    hire_success: 'Employée embauchée avec succès!', hire_failed: "Échec de l'embauche",
    about: 'À propos', details: 'Détails', languages_spoken: 'Langues',
    reviews_section: 'Avis', no_reviews_yet: 'Pas encore d\'avis. Soyez le premier!',
    write_review: '✍️ Écrire un avis', submit_review: 'Soumettre l\'avis',
    profile_title: 'Profil',

    // HW Profile menu
    menu_saved: 'Profils sauvegardés', menu_messages: 'Messages',
    menu_payments: 'Paiements', menu_notifications: 'Notifications',
    menu_support: 'Support', menu_sign_out: 'Se déconnecter',
    edit_btn: '✏️ Modifier', edit_profile: 'Modifier le profil',

    // Notifications
    notifications_title: 'Notifications', mark_all_read: 'Tout marquer comme lu',

    // Chats
    chats_title: 'Messages', no_chats: 'Aucune conversation',
    subscribe_chat_title: "S'abonner pour accéder aux messages",
    subscribe_chat_body: 'Discutez avec les employées et gérez votre processus d\'embauche.',
    subscribe_btn: "S'abonner — 1 000 EGP/mois",

    // Saved
    saved_title: 'Profils sauvegardés ❤️', no_saved_maids: 'Aucun profil sauvegardé',

    // Maid dash
    views: 'Vues', likes: 'J\'aime', chats_stat: 'Chats',

    // Tab labels
    tab_browse: 'Parcourir', tab_saved: 'Sauvegardés', tab_chats: 'Messages', tab_alerts: 'Alertes', tab_me: 'Moi', tab_home: 'Accueil',

    // Filters
    filter_all: 'Tous', filter_available: 'Disponible', filter_top_rated: 'Mieux notés',
    filter_african: 'Africaine', filter_asian: 'Asiatique', filter_cooking: 'Cuisine',
    filter_childcare: 'Garde enfants', filter_eldercare: 'Soins seniors',
    filter_title: 'Filtres', filter_salary: 'Salaire (EGP)',
    filter_min: 'Min', filter_max: 'Max', filter_age: "Tranche d'âge",
    filter_exp: 'Expérience min', filter_sort: 'Trier par',
    filter_newest: 'Plus récent', filter_top_rated_sort: 'Mieux notés', filter_highest_salary: 'Salaire élevé',
    filter_reset: 'Réinitialiser', filter_apply: 'Appliquer', filter_any: 'Tout',

    // Login
    welcome_back: 'Bon retour', role_customer: '🏠 Cliente', role_maid: '👩 Employée',

    // Register
    select_nationality_err: 'Sélectionnez la nationalité', bio_required: 'La biographie est requise',
    phone_required: 'Numéro de téléphone requis',
    phone_invalid_eg: 'Téléphone égyptien valide requis (ex: 01012345678)',
    upload_passport_photo_err: 'Téléchargez une photo du passeport',
    national_id_label: 'Numéro CIN', national_id_ph: 'CIN de 14 chiffres',
    valid_format: '✓ Format valide', must_be_20_45: 'Doit être entre 20 et 45',
    tap_upload_passport: 'Appuyez pour télécharger la photo passeport',
    clear_photo_of_page: 'Photo claire de la page de données',
    expected_salary_egp: 'Salaire attendu (EGP/mois)',
    languages_spoken_label: 'Langues parlées',
    tap_upload_photos: 'Appuyez pour télécharger les photos',
    professional_photos_note: 'Photos claires et professionnelles uniquement',

    // RegisterHousewife
    customer_subtitle: 'Cliente — Trouvez votre employée de confiance',
    select_area_err: 'Sélectionnez votre zone au Caire',
    phone_invalid_hw: 'Téléphone mobile égyptien valide requis (ex: 01012345678)',
    your_area_cairo: 'Votre zone au Caire', area_soon_badge: 'bientôt',

    // Chat
    chat_online: '● En ligne', voice_note: '🎙 Note vocale',
    type_message: 'Écrire un message…',
    failed_load_msgs: 'Échec du chargement', failed_send_msg: "Échec de l'envoi",

    // MaidCard
    available_badge: '● Disponible', unavailable_badge: 'Indisponible',
    exp_stat: 'Exp', salary_stat: 'Salaire', reviews_short: 'avis',

    // MaidDetail
    terms_title: 'Conditions générales',
    terms_body_short: "Servix est une plateforme de communication uniquement. Nous connectons les clientes avec des prestataires de services et ne sommes pas responsables de leur conduite.",
    terms_read_full: '📄 Lire les CGU complètes (PDF)',
    terms_agree_label: "J'ai lu et j'accepte les conditions générales",
    confirm_hire_btn: "👑 Confirmer la demande d'embauche",
    details_experience: 'Expérience', details_salary: 'Salaire attendu',
    details_age: 'Âge', details_origin: 'Origine',
    no_bio: 'Aucune biographie fournie.',
    no_reviews_label: "Pas encore d'avis",
    no_reviews_sub: "Soyez le premier à laisser un avis après l'embauche",
    saved_label: '❤️ Sauvegardé', save_label: '🤍 Sauvegarder',
    request_sent_awaiting: '⏳ Demande envoyée — En attente',
    review_after_hire_note: "Disponible seulement après l'embauche",
    share_exp_optional: 'Partagez votre expérience (optionnel)…',
    no_comment_left: 'Aucun commentaire',
    please_agree_terms: 'Veuillez accepter les CGU',

    // HiredMaids
    hired_maid_title: 'Mon employée 👑', hired_maid_sub: 'Gérez votre aide ménagère actuelle',
    no_hired_maid: 'Pas encore de employée',
    no_hired_sub: 'Parcourez les employées disponibles et envoyez une demande.',
    browse_maids_btn: '🔍 Parcourir les employées',
    hired_on: 'Embauchée le', skills_label_info: 'Compétences', release_vacancy: '↩ Libérer le poste',
    rate_required_release: 'Un avis est requis avant de libérer le poste.',
    share_exp_release: 'Partagez votre expérience (optionnel)…',
    submit_review_release: "Soumettre l'avis et libérer",
    please_rate_before_release: 'Sélectionnez une note en étoiles',

    // HireRequest
    incoming_label: 'Entrant', hire_requests_title: "Demandes d'embauche 👑",
    review_before_deciding: 'Consultez le profil avant de décider',
    no_pending_requests: 'Aucune demande en attente',
    no_pending_sub: "Quand une cliente veut vous embaucher, sa demande apparaîtra ici.",
    monthly_limit_reached: 'Limite mensuelle atteinte',
    monthly_limit_desc: 'Vous avez 2 embauches ce mois. Renouvelez pour en accepter plus.',
    request_declined: 'Demande refusée', failed_to_respond: 'Échec de la réponse',
    view_customer_profile: '👁 Voir le profil cliente',
    verified_subscriber: '✓ Abonnée vérifiée',
    sub_status_unknown: "Statut d'abonnement inconnu",
    area_info: 'Zone', phone_info: 'Téléphone', country_info: 'Pays',
    request_date_info: 'Date de demande',
    btn_decline: '✗ Refuser', btn_accept_hire: "✓ Accepter l'embauche",

    // HiredCelebration
    congratulations: 'Félicitations !', youre_hired: 'Vous êtes embauchée ! 👑',
    hired_body: "Vous avez officiellement accepté la demande. La cliente a été notifiée.",
    hired_profile_unavail: 'Votre profil est désormais indisponible',
    hired_email_sent: "La cliente a reçu un email de confirmation",
    hired_chat_employer: 'Discutez avec votre employeur via Messages',
    go_to_dashboard: 'Aller au tableau de bord →',

    // MaidDash
    active_subscription: 'Abonnement actif',
    areas_you_serve: 'Zones desservies',
    areas_serve_sub: 'Sélectionnez toutes les zones du Caire où vous pouvez travailler',
    service_areas_updated: 'Zones mises à jour !', save_areas_fail: 'Échec de la sauvegarde',
    hire_req_waiting: 'Demande en attente !', hire_reqs_waiting: 'Demandes en attente !',
    tap_review_decide: 'Appuyez pour réviser',
    set_service_areas: 'Définir vos zones', tap_to_update: 'Appuyez pour mettre à jour',
    area_find_notice: 'Les clientes ne peuvent vous trouver que si votre zone est définie',
    currently_hired_badge: '✓ Actuellement embauchée',
    currently_hired_desc: "Vous êtes en engagement actif. Quand libérée, vous retournerez dans la liste.",
    open_support: 'Ouvrir un ticket', contact_admin_note: 'Contactez admin pour tout problème',
    deactivates_profile: 'Désactive votre profil',
    my_reviews: '⭐ Mes avis', no_reviews_maid: "Pas encore d'avis",
    no_reviews_maid_sub: 'Travaillez bien — vos avis apparaîtront ici !',
    no_comment_short: 'Pas de commentaire',
    menu_hire_requests: "Demandes d'embauche", menu_messages2: 'Messages',
    menu_payments2: 'Paiements', menu_referrals: 'Parrainages',
    menu_analytics: 'Analytiques', menu_notifications2: 'Notifications',
    menu_support2: 'Support', menu_delete_account: 'Supprimer le compte',
    menu_sign_out: 'Se déconnecter', share_code_earn: 'Partagez votre code et gagnez des récompenses',

    // HWProfile
    my_hired_maid: 'Mon employée', delete_account: 'Supprimer le compte',
    delete_confirm_title: 'Supprimer le compte',
    delete_confirm_body: 'Votre compte sera désactivé. Seul un admin peut le restaurer. Êtes-vous sûr?',
    confirm_deletion: 'Confirmer la suppression',
    confirm_deletion_body: 'Cette action ne peut pas être annulée par vous-même. Continuer?',
    yes_delete: 'Oui, supprimer', failed_delete: 'Échec de la suppression',

    // Support
    support_title: 'Support client', support_sub: 'Nous répondons généralement en 24h',
    new_ticket: 'Nouveau ticket', my_tickets: 'Mes tickets',
    priority_label: 'Priorité', priority_low: 'Faible', priority_medium: 'Moyenne', priority_high: 'Haute',
    subject_label: 'Sujet', message_label2: 'Message',
    subject_ph: 'Brève description de votre problème',
    message_ph: 'Décrivez votre problème en détail…',
    submitting: 'Envoi en cours…', submit_ticket: 'Envoyer le ticket', no_tickets: 'Pas encore de tickets',
    subject_msg_required: 'Sujet et message requis',
    ticket_submitted: 'Ticket envoyé', ticket_submitted_sub: "Nous vous répondrons bientôt",

    // PaymentResult
    sub_activated: 'Abonnement activé !', receipt_submitted_title: 'Reçu envoyé',
    offline_confirmed_body: 'Votre paiement hors ligne a été confirmé.\nVotre abonnement est actif.',
    offline_pending_body: "Votre reçu a été envoyé à l'admin.\nNous activerons votre abonnement sous 24h.",
    amount_confirmed_label: 'Montant confirmé', amount_submitted_label: 'Montant soumis',
    confirmed_badge: '✓ Confirmé', pending_admin_badge: "⏳ En attente de l'admin",
    go_to_app: "Aller à l'appli →", check_status_btn2: '🔄 Vérifier le statut',
    payment_confirmed_online: 'Paiement confirmé !', amount_paid_label: 'Montant payé',
    verifying_payment: 'Vérification du paiement…', go_home: "Aller à l'accueil →",
    still_pending: 'Toujours en attente', could_not_check: 'Impossible de vérifier',
    payment_of_egp: 'Votre paiement de EGP ',
    payment_was_successful: ' a réussi.\nVotre abonnement est maintenant actif.',
    offline_notification_note: "Vous recevrez aussi une notification quand l'admin confirme.\nVous pouvez fermer cet écran et revenir plus tard.",

    // Chats list
    no_msgs_yet: 'Pas encore de messages',

    // Analytics
    analytics_title: 'Analytiques', analytics_sub: 'Performances de votre profil',
    stat_views: 'Vues du profil', stat_likes: "J'aime reçus",
    stat_chats2: 'Demandes de chat', stat_hired: 'Fois embauchée', summary_label: 'Résumé',

    // PaymentHistory
    payments_title: 'Paiements', payments_sub: 'Abonnements & commissions',
    no_payments: 'Pas encore de paiements', transactions_here: 'Vos transactions apparaîtront ici',

    // EditHWProfile
    edit_profile_title2: 'Modifier le profil', field_full_name: 'Nom complet',
    field_city: 'Ville', field_country: 'Pays',
    name_ph: 'Votre nom', city_ph: 'ex: Le Caire', country_ph: 'ex: Égypte',
    name_required_err: 'Nom requis', profile_updated: 'Profil mis à jour',
    update_failed: 'Mise à jour échouée', saving: 'Sauvegarde…', save_changes: 'Sauvegarder',

    // Subscription extra
    monthly_plan_name: 'Plan mensuel', pricing_for: 'Prix pour',
    standard_pricing: 'Tarif standard',
    plan_active_listing: 'Profil actif', plan_photos: "Jusqu'à 5 photos",
    plan_chat: 'Messagerie', plan_analytics: 'Analytiques de base', plan_support: 'Support prioritaire',
    have_coupon: 'Vous avez un code promo ? (Optionnel)',
    coupon_applied_pct: 'Code appliqué —', you_save: 'Vous économisez EGP',
    remove_coupon: 'Supprimer', pay_cash: 'Payer par virement',
    arrange_offline: 'Organiser le paiement avec admin', per_month: '/mois',
    receipt_under_review: '⏳ Reçu en cours de révision',
    receipt_review_body: "Votre reçu attend la confirmation de l'admin. Vous recevrez une notification.",
    check_confirmation_status: '🔄 Vérifier la confirmation',
    submit_new_receipt: 'Soumettre un nouveau reçu',
    cash_transfer_title: '💵 Virement bancaire',
    cash_transfer_sub: 'Transférez vos frais sur un des comptes ci-dessous, puis téléchargez votre reçu.',
    amount_due: 'Montant dû', transfer_to: 'Transférer à', account_name: 'Nom du compte',
    upload_receipt: 'Télécharger le reçu', tap_upload_receipt: 'Appuyez pour télécharger',
    receipt_screenshot_note: 'Capture ou photo de la confirmation',
    try_again_btn: 'Réessayer', submit_receipt_btn: 'Soumettre le reçu',
    already_paid_check: "Déjà payé? Appuyez pour vérifier si l'admin a activé votre abonnement",

    // Subscription extra 2
    receipt_rejected: 'Reçu rejeté', receipt_rejected_sub: 'Veuillez re-télécharger un reçu clair.',
    admin_not_confirmed_yet: "L'admin n'a pas encore confirmé.",
    checking_label: 'Vérification…', coupon_invalid: 'Code promo invalide',
    discount_applied_suffix: '% de réduction appliqué !', apply_label: 'Appliquer',

    // MaidDetail extra
    review_submitted: 'Avis soumis !', review_submit_failed: "Échec de l'envoi de l'avis",
    hire_req_sent: '👑 Demande envoyée !', hire_req_sent_sub: "En attente de l'approbation.",
    chat_open_failed: 'Impossible d\'ouvrir le chat', please_rate_star: 'Sélectionnez une note en étoiles',
    rate_label: 'Évaluer', login_success_toast: 'Bon retour ! 👋',

    // HiredMaids extra
    next_hire_free:     '✓ Prochaine embauche gratuite (grâce)',
    next_hire_fee_500:  '⚠ Frais prochaine embauche : EGP 500',
    next_hire_fee_700:  '⚠ Frais prochaine embauche : EGP 700',
    next_hire_fee_1000: '⚠ Frais prochaine embauche : EGP 1 000',
    vacancy_released: 'Employée libérée', vacancy_released_sub: 'Vous avez 3 jours pour embaucher un remplaçant.',
    release_failed: 'Échec de la libération',
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

    // MaidDetail
    open_chat: 'Buɗe tattaunawa', opening: 'Ana buɗewa…',
    hire_this_maid: 'Ɗauki wannan ma\'aikata', already_hired: 'An ɗauka ✅',
    hire_success: 'An ɗauki ma\'aikata!', hire_failed: 'Ɗaukar ya kasa',
    about: 'Game da', details: 'Bayani', languages_spoken: 'Harsunan da ake magana',
    reviews_section: 'Bita', no_reviews_yet: 'Babu bita tukuna. Ku zama na farko!',
    write_review: '✍️ Rubuta bita', submit_review: 'Aika bita',
    profile_title: 'Bayanin martaba',

    // HW Profile menu
    menu_saved: "Ma'aikata da aka ajiye", menu_messages: 'Saƙonni',
    menu_payments: 'Biyan kuɗi', menu_notifications: 'Sanarwa',
    menu_support: 'Tallafi', menu_sign_out: 'Fita',
    edit_btn: '✏️ Gyara', edit_profile: 'Gyara bayanin martaba',

    // Notifications
    notifications_title: 'Sanarwa', mark_all_read: 'Alama duka an karanta',

    // Chats
    chats_title: 'Saƙonni', no_chats: 'Babu tattaunawa tukuna',
    subscribe_chat_title: 'Yi rajista don samun damar saƙonni',
    subscribe_chat_body: 'Yi hira da ma\'aikata kuma sarrafa tsarin ɗaukar ma\'aikata.',
    subscribe_btn: 'Yi rajista — EGP 1,000/wata',

    // Saved
    saved_title: "Ma'aikata da aka adana ❤️", no_saved_maids: "Babu ma'aikata da aka adana tukuna",

    // Maid dash
    views: 'Kallon', likes: 'Son', chats_stat: 'Tattaunawa',

    // Tab labels
    tab_browse: 'Bincike', tab_saved: 'Ajiye', tab_chats: 'Saƙonni', tab_alerts: 'Sanarwa', tab_me: 'Ni', tab_home: 'Gida',

    // Filters
    filter_all: 'Duka', filter_available: 'Akwai', filter_top_rated: 'Mafi kyau',
    filter_african: 'Afirka', filter_asian: 'Asiya', filter_cooking: 'Girki',
    filter_childcare: 'Kula yara', filter_eldercare: 'Kula tsofaffi',
    filter_title: 'Tace', filter_salary: 'Albashi (EGP)',
    filter_min: 'Kadan', filter_max: 'Yawa', filter_age: 'Shekaru',
    filter_exp: 'Gogagge', filter_sort: 'Tsari',
    filter_newest: 'Sabon', filter_top_rated_sort: 'Mafi kyau', filter_highest_salary: 'Babban albashi',
    filter_reset: 'Sifili', filter_apply: 'Amfani', filter_any: 'Kowane',

    // Login
    welcome_back: 'Barka da komawa', role_customer: '🏠 Abokin ciniki', role_maid: "👩 Ma'aikaci",

    // Register
    select_nationality_err: 'Zaɓi ƙasa', bio_required: 'Bayanin game da kai ya zama dole',
    phone_required: 'Lambar waya ya zama dole',
    phone_invalid_eg: 'Lambar waya ta Masar mai inganci (misali: 01012345678)',
    upload_passport_photo_err: 'Loda hoto na fasfo',
    national_id_label: 'Lambar ID ta Ƙasa', national_id_ph: 'ID na lambobi 14',
    valid_format: '✓ Tsari mai inganci', must_be_20_45: 'Dole ya kasance tsakanin 20-45',
    tap_upload_passport: 'Taɓa don loda hoto na fasfo',
    clear_photo_of_page: 'Hoto mai kyau na shafin fasfo',
    expected_salary_egp: 'Albashin da ake sa ran (EGP/wata)',
    languages_spoken_label: 'Harshen da ake magana',
    tap_upload_photos: 'Taɓa don loda hotuna',
    professional_photos_note: 'Hotuna masu kyau kawai',

    // RegisterHousewife
    customer_subtitle: "Abokin ciniki — Nemi ma'aikatarki",
    select_area_err: 'Da fatan zaɓi yankinki a Alkahira',
    phone_invalid_hw: 'Lambar wayar hannu ta Masar mai inganci (misali: 01012345678)',
    your_area_cairo: 'Yankinki a Alkahira', area_soon_badge: 'nan gaba',

    // Chat
    chat_online: '● A kan layi', voice_note: '🎙 Saƙon murya',
    type_message: 'Rubuta saƙo…',
    failed_load_msgs: 'Lodi ya kasa', failed_send_msg: 'Aika ya kasa',

    // MaidCard
    available_badge: '● Akwai', unavailable_badge: 'Ba a nan',
    exp_stat: 'Ƙwarewa', salary_stat: 'Albashi', reviews_short: 'bita',

    // MaidDetail
    terms_title: 'Sharuɗɗa da Yanayi',
    terms_body_short: "Servix dandali ne kawai. Ba mu da alhakin ayyukan kowane ma'aikaci ko abokin ciniki.",
    terms_read_full: '📄 Karanta cikakkun sharuɗɗa (PDF)',
    terms_agree_label: 'Na karanta kuma na yarda da sharuɗɗan',
    confirm_hire_btn: '👑 Tabbatar da Neman Aiki',
    details_experience: 'Ƙwarewa', details_salary: 'Albashin da ake sa ran',
    details_age: 'Shekaru', details_origin: 'Asali',
    no_bio: 'Babu bayani.',
    no_reviews_label: 'Babu bita tukuna',
    no_reviews_sub: "Ku zama na farko bayan ɗaukar ma'aikaci",
    saved_label: '❤️ An ajiye', save_label: '🤍 Ajiye',
    request_sent_awaiting: '⏳ An aika buƙata — Ana jira',
    review_after_hire_note: "Yana samuwa kawai bayan ɗauka",
    share_exp_optional: 'Raba ƙwarewarku (zaɓi)…',
    no_comment_left: 'Babu sharhi',
    please_agree_terms: 'Da fatan yarda da sharuɗɗan',

    // HiredMaids
    hired_maid_title: "Ma'aikatar da aka ɗauka 👑", hired_maid_sub: "Gudanar da ma'aikatarku ta yanzu",
    no_hired_maid: "Babu ma'aikatar da aka ɗauka tukuna",
    no_hired_sub: "Duba ma'aikata masu akwai kuma aika buƙatar ɗauka.",
    browse_maids_btn: "🔍 Duba Ma'aikata",
    hired_on: "An ɗauka a", skills_label_info: 'Iyawa', release_vacancy: '↩ Sakin Wurin Aiki',
    rate_required_release: 'Ana buƙatar bita kafin sakin wurin aiki.',
    share_exp_release: 'Raba ƙwarewarku (zaɓi amma ana godiya)…',
    submit_review_release: 'Aika Bita kuma Sake Wuri',
    please_rate_before_release: 'Da fatan zaɓi tauraron da',

    // HireRequest
    incoming_label: 'Shigowa', hire_requests_title: "Buƙatun Ɗauka 👑",
    review_before_deciding: 'Duba bayanin abokin ciniki kafin yanke shawarar',
    no_pending_requests: 'Babu buƙatun da ke jira',
    no_pending_sub: "Lokacin da abokin ciniki ya so ya ɗauke ki, buƙatarsa za ta bayyana nan.",
    monthly_limit_reached: 'An kai iyakar wata',
    monthly_limit_desc: 'Kuna da ɗauka 2 a wannan wata. Sabunta don karɓar ƙari.',
    request_declined: 'An ƙi buƙatar', failed_to_respond: 'Amsa ta kasa',
    view_customer_profile: '👁 Duba Bayanin Abokin Ciniki',
    verified_subscriber: '✓ Mambobar da aka tabbatar',
    sub_status_unknown: 'Matsayin biyan kuɗi ba a sani ba',
    area_info: 'Yanki', phone_info: 'Waya', country_info: 'Ƙasa',
    request_date_info: 'Ranar buƙata',
    btn_decline: '✗ Ƙi', btn_accept_hire: '✓ Karɓi Ɗaukan',

    // HiredCelebration
    congratulations: 'Taya murna!', youre_hired: 'An ɗauke ki! 👑',
    hired_body: 'An karɓi buƙatar ɗaukarka a hukumance. An sanar da abokin ciniki.',
    hired_profile_unavail: 'An nuna bayananku a matsayin ba a nan',
    hired_email_sent: 'Abokin ciniki ya karɓi imel na tabbatarwa',
    hired_chat_employer: 'Yi hira da mai aikin ku ta Saƙonni',
    go_to_dashboard: 'Tafi ga Allon Sarrafa →',

    // MaidDash
    active_subscription: 'Biyan kuɗi mai aiki',
    areas_you_serve: 'Yankuna da kuke Bauta',
    areas_serve_sub: 'Zaɓi duk yankuna a Alkahira da za ku iya aiki a cikinsu',
    service_areas_updated: 'An sabunta yankuna!', save_areas_fail: 'Ajiye yankuna ya kasa',
    hire_req_waiting: 'Buƙatar Ɗauka na jira!', hire_reqs_waiting: 'Buƙatun Ɗauka na jira!',
    tap_review_decide: 'Taɓa don duba',
    set_service_areas: 'Saita yankuna', tap_to_update: 'Taɓa don sabuntawa',
    area_find_notice: 'Abokan ciniki za su iya samun ku ne kawai idan an saita yankinku',
    currently_hired_badge: '✓ An ɗauke ki yanzu',
    currently_hired_desc: 'Kuna cikin yarjejeniya mai aiki. Lokacin da abokin ciniki ya sake ku, za ku koma.',
    open_support: 'Bude tikiti na tallafi', contact_admin_note: 'Tuntuɓi gudanarwa don kowane matsala',
    deactivates_profile: 'Yanke kunshinku',
    my_reviews: '⭐ Bitocina', no_reviews_maid: 'Babu bita tukuna',
    no_reviews_maid_sub: "Yi aiki tuƙuru — bitocin ku za su bayyana nan!",
    no_comment_short: 'Babu sharhi',
    menu_hire_requests: 'Buƙatun Ɗauka', menu_messages2: 'Saƙonni',
    menu_payments2: 'Biyan kuɗi', menu_referrals: 'Shawarwari',
    menu_analytics: 'Bincike', menu_notifications2: 'Sanarwa',
    menu_support2: 'Tallafi', menu_delete_account: 'Goge asusun',
    menu_sign_out: 'Fita', share_code_earn: 'Raba lambarku kuma samu lada',

    // HWProfile
    my_hired_maid: "Ma'aikatar da aka ɗauka", delete_account: 'Goge asusun',
    delete_confirm_title: 'Goge asusun',
    delete_confirm_body: 'Za a ba da damar kunshinku. Admin ne kaɗai zai iya maido shi. Shin kuna tabbata?',
    confirm_deletion: 'Tabbatar da Gogewa',
    confirm_deletion_body: 'Ba za ku iya bace wannan da kanku ba. Ci gaba?',
    yes_delete: 'Eh, gogewa', failed_delete: 'Gogewa ta kasa',

    // Support
    support_title: 'Tallafi na Abokan Ciniki', support_sub: "Yawanci muna amsa cikin sa'a 24",
    new_ticket: 'Sabon tikiti', my_tickets: 'Tiketocina',
    priority_label: 'Fifiko', priority_low: 'Ƙasa', priority_medium: 'Matsakaici', priority_high: 'Sama',
    subject_label: 'Batun', message_label2: 'Saƙo',
    subject_ph: 'Taƙaitaccen bayanin matsalarka',
    message_ph: 'Bayyana matsalarka dalla-dalla…',
    submitting: 'Ana aika…', submit_ticket: 'Aika tikiti', no_tickets: 'Babu tikitoci tukuna',
    subject_msg_required: 'Batun da saƙo ana buƙata',
    ticket_submitted: 'An aika tikiti', ticket_submitted_sub: "Za mu dawo da ku nan gaba",

    // PaymentResult
    sub_activated: 'An kunna biyan kuɗi!', receipt_submitted_title: 'An aika rasit',
    offline_confirmed_body: "An tabbatar da biyan ku na waje.\nBiyan ku yana aiki yanzu.",
    offline_pending_body: "An aika rasitin ku zuwa admin.\nZa mu kunna biyan ku cikin sa'a 24.",
    amount_confirmed_label: 'Adadin da aka tabbatar', amount_submitted_label: 'Adadin da aka aika',
    confirmed_badge: '✓ An tabbatar', pending_admin_badge: '⏳ Ana jiran admin',
    go_to_app: 'Tafi ga App →', check_status_btn2: '🔄 Duba Matsayi',
    payment_confirmed_online: 'An tabbatar da biyan kuɗi!', amount_paid_label: 'Adadin da aka biya',
    verifying_payment: 'Ana tabbatar da biyan kuɗi…', go_home: 'Tafi gida →',
    still_pending: 'Har yanzu a jira', could_not_check: 'Ba a iya duba matsayin ba',
    payment_of_egp: 'Biyan ku na EGP ',
    payment_was_successful: ' ya yi nasara.\nSubscription ɗinku yanzu yana aiki.',
    offline_notification_note: 'Za ku sami sanarwa lokacin da admin ya tabbatar.\nZa ku iya rufe wannan allon ku dawo.',

    // Chats list
    no_msgs_yet: 'Babu saƙonni tukuna',

    // Analytics
    analytics_title: 'Bincike', analytics_sub: 'Aikin bayananku',
    stat_views: 'Kallon Bayanai', stat_likes: 'Son da aka samu',
    stat_chats2: 'Buƙatun Tattaunawa', stat_hired: 'Sau da aka ɗauka', summary_label: 'Takaitawa',

    // PaymentHistory
    payments_title: 'Biyan kuɗi', payments_sub: "Subscriptions da kwamiti",
    no_payments: 'Babu biyan kuɗi tukuna', transactions_here: "Mu'amalolin ku za su bayyana nan",

    // EditHWProfile
    edit_profile_title2: 'Gyara Bayanin Martaba', field_full_name: 'Cikakkun sunaye',
    field_city: 'Birni', field_country: 'Ƙasa',
    name_ph: 'Sunanka', city_ph: 'misali: Alkahira', country_ph: 'misali: Masar',
    name_required_err: 'Suna ya zama dole', profile_updated: 'An sabunta bayanin martaba',
    update_failed: 'Sabuntawa ta kasa', saving: 'Ana ajiye…', save_changes: 'Ajiye sauye-sauye',

    // Subscription extra
    monthly_plan_name: 'Tsarin Wata-wata', pricing_for: 'Farashi na',
    standard_pricing: "Farashin ma'auni",
    plan_active_listing: 'Jerin bayanai mai aiki', plan_photos: 'Hotuna har 5',
    plan_chat: 'Saƙon hannu', plan_analytics: 'Bincike na asali', plan_support: 'Tallafi na fifiko',
    have_coupon: 'Kuna da lambar promo? (Zaɓi)',
    coupon_applied_pct: 'An yi amfani da lambar —', you_save: 'Kuna adana EGP',
    remove_coupon: 'Cire', pay_cash: 'Biya ta Canja kuɗi',
    arrange_offline: 'Shirya biyan kuɗi tare da admin', per_month: '/wata',
    receipt_under_review: '⏳ Rasit yana a ƙarƙashin nazari',
    receipt_review_body: 'An aika rasitin ku kuma yana jiran tabbatarwar admin. Za ku sami sanarwa.',
    check_confirmation_status: '🔄 Duba Matsayin Tabbatarwa',
    submit_new_receipt: 'Aika sabon rasit',
    cash_transfer_title: '💵 Biyan Kuɗi ta Canja',
    cash_transfer_sub: 'Canja kuɗin biyan ku zuwa ɗaya daga cikin asusun da ke ƙasa, sannan loda rasitin ku.',
    amount_due: 'Adadin da ake biya', transfer_to: 'Canja zuwa', account_name: 'Sunan asusun',
    upload_receipt: 'Loda rasit', tap_upload_receipt: 'Taɓa don loda rasit',
    receipt_screenshot_note: 'Hoton allo ko hoto na tabbatarwa',
    try_again_btn: 'Sake gwadawa', submit_receipt_btn: 'Aika Rasit don Tabbatarwa',
    already_paid_check: "Kun riga kun biya? Taɓa don duba idan admin ya kunna biyan ku",

    // Subscription extra 2
    receipt_rejected: 'An ƙi rasit', receipt_rejected_sub: 'Da fatan sake loda rasit mai kyau.',
    admin_not_confirmed_yet: 'Admin bai tabbatar ba tukuna.',
    checking_label: 'Ana duba…', coupon_invalid: 'Lambar kupon ba ta da inganci',
    discount_applied_suffix: '% ragi an yi amfani!', apply_label: 'Amfani',

    // MaidDetail extra
    review_submitted: 'An aika bita!', review_submit_failed: 'Aika bita ya kasa',
    hire_req_sent: '👑 An aika buƙata!', hire_req_sent_sub: 'Ana jiran amincewa.',
    chat_open_failed: 'Buɗe tattaunawa ya kasa', please_rate_star: 'Da fatan zaɓi tauraron da',
    rate_label: 'Ƙimar', login_success_toast: 'Barka da komawa! 👋',

    // HiredMaids extra
    next_hire_free:     '✓ Ɗaukar aiki na gaba kyauta (alheri)',
    next_hire_fee_500:  '⚠ Kuɗin ɗaukar aiki na gaba: EGP 500',
    next_hire_fee_700:  '⚠ Kuɗin ɗaukar aiki na gaba: EGP 700',
    next_hire_fee_1000: '⚠ Kuɗin ɗaukar aiki na gaba: EGP 1,000',
    vacancy_released: 'An sake ma\'aikaciya', vacancy_released_sub: 'Kuna da kwanaki 3 don ɗaukar maye gurbi.',
    release_failed: 'Sakin ya kasa',
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

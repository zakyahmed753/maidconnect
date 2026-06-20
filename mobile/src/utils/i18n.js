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
    good_morning: 'Welcome back,',
    welcome: 'Welcome',
    search_placeholder: 'Search name, nationality, skill…',
    browse_maids: 'Browse Maids',
    no_maids: 'Your helper is not here yet',
    no_maids_sub: "We're growing every day — a perfect home helper for you will be available soon.",
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
    open_chat: 'Message', opening: 'Opening…',
    hire_this_maid: "I'm Interested", already_hired: 'Already Hired ✅',
    hire_success: 'Maid hired successfully!', hire_failed: 'Failed to hire',
    about: 'About', details: 'Details', languages_spoken: 'Languages',
    reviews_section: 'Reviews', no_reviews_yet: 'No reviews yet. Be the first!',
    write_review: '✍️ Write Review', submit_review: 'Submit Review',
    profile_title: 'Profile',

    // HW Profile menu
    menu_saved: 'Saved Helpers', menu_messages: 'Messages',
    menu_payments: 'Payments', menu_notifications: 'Notifications',
    menu_support: 'Support', menu_sign_out: 'Sign Out',
    menu_activity: 'My Activity', menu_settings: 'Settings', menu_account: 'Account',
    edit_btn: '✏️ Edit', edit_profile: 'Edit Profile',

    // Notifications
    notifications_title: 'Notifications', mark_all_read: 'Mark all read',

    // Chats
    chats_title: 'Messages', no_chats: 'No chats yet',
    subscribe_chat_title: 'Subscribe to Access Messages',
    subscribe_chat_body: 'Chat with maids and manage your hiring process with a monthly subscription.',
    subscribe_btn: 'Subscribe — EGP 1,000/mo',

    // Saved
    saved_title: 'Saved Helpers', no_saved_maids: 'No saved helpers yet',

    // Maid dash
    views: 'Views', likes: 'Likes', chats_stat: 'Chats',

    // Tab labels
    tab_browse: 'Browse', tab_saved: 'Saved', tab_chats: 'Chats', tab_alerts: 'Alerts', tab_me: 'Me', tab_home: 'Home',

    // Filters
    filter_all: 'All', filter_available: 'Available', filter_top_rated: 'Top Rated',
    filter_african: 'African', filter_asian: 'Asian', filter_cooking: 'Cooking',
    filter_childcare: 'Childcare', filter_eldercare: 'Eldercare',
    filter_cleaning: 'Cleaning', filter_laundry: 'Laundry', filter_ironing: 'Ironing',
    filter_driving: 'Driving', filter_petcare: 'Pet Care',
    filter_title: 'Filters', filter_salary: 'Salary Range (EGP)',
    filter_min: 'Min', filter_max: 'Max', filter_age: 'Age Range',
    filter_exp: 'Min Experience', filter_sort: 'Sort By',
    filter_newest: 'Newest', filter_top_rated_sort: 'Top Rated', filter_highest_salary: 'Highest Salary',
    filter_reset: 'Reset', filter_apply: 'Apply Filters', filter_any: 'Any',

    // Login
    welcome_back: 'Welcome Back', role_customer: '🏠 Customer', role_maid: '👩 Helper',

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
    available_badge: 'Available', unavailable_badge: 'Unavailable',
    exp_stat: 'Exp', salary_stat: 'Salary', reviews_short: 'rev',

    // MaidDetail
    terms_title: 'Terms & Conditions',
    terms_body_short: 'Servix is a communication platform only. We connect customers with domestic service providers and are not responsible for the conduct, performance, or actions of any maid or customer. All agreements are between the two parties directly.',
    terms_read_full: '📄 Read Full Terms & Conditions (PDF)',
    terms_agree_label: 'I have read and agree to the Terms & Conditions',
    confirm_hire_btn: 'Confirm Hire',
    details_experience: 'Experience', details_salary: 'Expected Salary',
    details_age: 'Age', details_origin: 'Origin',
    no_bio: 'No bio provided.',
    no_reviews_label: 'No reviews yet', no_reviews_sub: 'Hire this helper and be the first to share your experience',
    saved_label: 'Saved', save_label: 'Save', yrs: 'years',
    notif_new_hire_title: 'New Hire Request! 🔔',
    notif_support_reply_title: '💬 Support Reply',
    notif_hire_declined_title: 'Hire Request Declined',
    notif_approved_title: '✅ Profile Approved!',
    notif_rejected_title: '❌ Profile Rejected',
    notif_sub_title: '💵 Subscription Activated!',
    notif_released_hw_title: '↩ Helper Released',
    notif_released_maid_title: '🆓 You Are Available Again',
    request_sent_awaiting: '⏳ Request Sent — Awaiting Approval',
    review_after_hire_note: 'Only available after hiring this maid',
    share_exp_optional: 'Share your experience (optional)…',
    no_comment_left: 'No comment left',
    please_agree_terms: 'Please agree to the Terms & Conditions',
    view_profile: 'View Profile',
    old_helpers: 'Past Helpers', no_history_yet: 'No history yet',
    released_here_sub: 'Maids you release will appear here.',
    released_on: 'Released', past_placements: 'past placements',
    release_to_chat_title: 'Chat with previous employer?',
    release_to_chat_body: 'You have been released. Would you like to message your previous employer?',

    // HiredMaids
    hired_maid_title: 'My Helper', hired_maid_sub: 'Manage your current placement',
    no_hired_maid: 'No helper yet',
    no_hired_sub: 'Browse available maids and send a hire request to get started.',
    browse_maids_btn: '🔍 Browse Maids',
    hired_on: 'Hired on', skills_label_info: 'Skills', release_vacancy: 'I need another helper',
    rate_required_release: 'A review is required before releasing the vacancy. Your feedback helps other families.',
    share_exp_release: 'Share your experience (optional but appreciated)…',
    submit_review_release: 'Submit Review & Release Vacancy',
    please_rate_before_release: 'Please select a star rating before releasing',

    // HireRequest
    incoming_label: 'Incoming', hire_requests_title: 'Hire Requests',
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
    congratulations: 'Congratulations!', youre_hired: "You're Hired! 🎉",
    hired_body: 'You have officially accepted the hire request. The customer has been notified.',
    hired_profile_unavail: 'Your profile is now marked unavailable',
    hired_email_sent: 'Customer received a confirmation email',
    hired_chat_employer: 'Chat with your employer via Messages',
    go_to_dashboard: 'Go to Dashboard →',

    // MaidDash
    active_subscription: 'Active Subscription', sub_ends: 'Ends',
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
    my_hired_maid: 'My Helper', delete_account: 'Delete Account',
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
    monthly_plan_name: 'Subscription Plan', pricing_for: 'Pricing for',
    standard_pricing: 'Standard pricing',
    plan_active_listing: 'Your profile shown to families actively looking for maids',
    plan_photos: 'Showcase up to 5 photos to stand out',
    plan_chat: 'Chat directly with interested families anytime',
    plan_analytics: 'See how many families viewed your profile',
    plan_support: 'Accept up to 2 hire requests per month',
    have_coupon: 'Have a referral or promo code? (Optional)',
    coupon_applied_pct: 'Code applied —', you_save: 'You save EGP',
    remove_coupon: 'Remove', pay_cash: 'Pay via Cash Transfer',
    arrange_offline: 'Arrange payment offline with admin', per_month: '/month',
    receipt_under_review: 'Receipt Under Review',
    receipt_review_body: 'Your payment receipt was submitted and is awaiting admin confirmation. You\'ll receive a notification once confirmed.',
    check_confirmation_status: 'Check Confirmation Status',
    submit_new_receipt: 'Submit a new receipt instead',
    cash_transfer_title: 'Cash Transfer Payment',
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
    hire_req_sent: '✅ Request Sent!', hire_req_sent_sub: 'Waiting for the maid to approve.',
    chat_open_failed: 'Failed to open chat', please_rate_star: 'Please select a star rating',
    rate_label: 'Rate', login_success_toast: 'Welcome back! 👋',

    // HiredMaids extra
    next_hire_free:     '✓ Next hire is free (grace period)',
    next_hire_fee_500:  '⚠ Next hire fee: EGP 500',
    next_hire_fee_700:  '⚠ Next hire fee: EGP 700',
    next_hire_fee_1000: '⚠ Next hire fee: EGP 1,000',
    vacancy_released: 'Maid Released',
    release_failed: 'Failed to release',
    release_btn: 'Release',
    release_dialog_title: '↩ Release Maid',
    // Grace period dialog (penalty = 0)
    release_confirm_grace_body_1: 'You are in the 3-day grace period. Releasing this maid is completely free.',
    release_confirm_grace_body_2: 'Your next hire will also be free. You have 3 days to choose a replacement.',
    // Fee dialog (penalty > 0)
    release_confirm_fee_body_1: '⚠ A replacement fee is required before you can chat or hire your next maid.',
    release_confirm_fee_body_2_prefix: 'Fee amount:',
    release_confirm_fee_body_2_suffix: 'This fee must be paid before starting any new chat or hire request.',
    // Toast after release
    release_toast_free: 'Free 3-day replacement window is now active.',
    release_toast_fee_prefix: 'Pay',
    release_toast_fee_suffix: 'to unlock chatting with your next maid.',
    // Replacement policy modal
    rp_title: 'Replacement Policy',
    rp_short: "If your helper isn't the right fit, you can request a replacement.",
    rp_learn_more: 'Learn how replacement fees work',
    rp_period_col: 'Working Period',
    rp_fee_col: 'Replacement Fee',
    rp_row0: '0–3 days',     rp_row0_fee: '✅ Free (Trial period)',
    rp_row1: '4–7 days',     rp_row1_fee: 'EGP 500',
    rp_row2: '8–30 days',    rp_row2_fee: 'EGP 700',
    rp_row3: 'After 30 days',rp_row3_fee: 'EGP 1,000',
    rp_good_to_know: 'Good to know',
    rp_note1: 'The replacement fee is charged only when you hire your replacement helper, not when you release your current helper.',
    rp_note2: 'After ending the current helper\'s service, you have 30 days to choose a replacement under this policy.',
    rp_note3: 'This policy helps us maintain service quality while giving you flexibility if the match isn\'t suitable.',
  },

  ar: {
    // Common
    continue: 'كمّل', cancel: 'إلغاء', save: 'احفظ', back: 'رجوع',
    submit: 'ابعت', loading: 'لحظة…', done: 'خلاص!', ok: 'تمام',
    error: 'في مشكلة صغيرة', success: 'تمام! 🎉', retry: 'جرب تاني',

    // Auth
    sign_in: 'ادخل', sign_up: 'سجّل', logout: 'خروج',
    email: 'إيميلك', password: 'كلمة السر', phone: 'رقم موبايلك',
    full_name: 'اسمك الكامل', nationality: 'جنسيتك',
    age: 'سنك', experience: 'سنوات الخبرة', salary: 'الراتب اللي بتتوقعيه (دولار/شهر)',
    bio: 'عرّفي بنفسك', skills: 'مهاراتك', photos: 'صورك',
    passport_number: 'رقم الجواز', passport_photo: 'صورة الجواز',
    no_account: 'مالكش حساب؟', have_account: 'عندك حساب؟',
    sign_in_link: 'ادخل', sign_up_link: 'سجّل دلوقتي',
    create_profile: 'انشئي ملفك', step1: 'الخطوة 1 من 2 — بياناتك الشخصية',
    fill_required: 'كمّل الحقول المطلوبة من فضلك',
    min_photos: 'ارفعي 3 صور على الأقل',
    max_photos: 'أقصى 5 صور',
    photos_later: 'الصور هتتضاف بعدين',
    photos_continue: 'كملي إنشاء ملفك',
    registration_failed: 'التسجيل مش تمام — جرب تاني',
    age_range: 'السن لازم يكون بين 20 و45 سنة',
    select_nationality: 'اختاري جنسيتك',
    search_country: 'دوّر على دولة…',

    // Browse
    good_morning: 'أهلاً بيك',
    welcome: 'يا أهلاً',
    search_placeholder: 'دوّر بالاسم أو الجنسية أو المهارة…',
    browse_maids: 'استعرض المساعدات',
    no_maids: 'مفيش نتايج — جرب تصفية تانية',
    no_maids_sub: 'بنكبر كل يوم — عاملتك المثالية هتكون متاحة قريباً',
    load_failed: 'في مشكلة في التحميل — جرب تاني',
    save_failed: 'الحفظ مش تمام',

    // Saved
    saved_maids: 'اللي عجبوني',
    no_saved: 'لسه ما حفظتش حد!',

    // Subscription
    subscription_title: 'اشتراك العاملة',
    subscription_sub: 'ابقي ظاهرة لمئات الأسر في القاهرة',
    monthly_plan: 'الباقة الشهرية', annual_plan: 'الباقة السنوية',
    most_popular: '⭐ الأكثر طلباً', proceed_payment: 'يلا نكمل الدفع →',
    skip_dev: 'تخطي (للمطورين)',

    // Pending
    under_review: 'بياناتك تحت المراجعة',
    review_sub: 'فريق Servix بيراجع جوازك وصورتك دلوقتي — هتبقي جاهزة قريباً!',
    check_status: 'اتحققي من حالتك',
    verified_title: 'مبروك! تم التحقق منك ✅',
    verified_sub: 'مستنداتك اتقبلت! اتفضلي اختاري خطة الاشتراك.',
    rejected_title: 'في مشكلة في المستندات',
    rejected_sub: 'المستندات مش واضحة كفاية — بعتي صور أوضح من فضلك.',
    resubmit: 'ارفعي المستندات تاني',
    choose_subscription: 'اختاري الاشتراك →',
    auto_check: 'بنفحص تلقائياً كل 30 ثانية — مش محتاجة تفضلي على الشاشة.',

    // Login
    login_maid: 'دخول العاملات',
    login_hw: 'دخول العملاء',
    sign_in_maid: 'ادخلي كعاملة',
    sign_in_hw: 'دخول كعميل',

    // Settings / Language
    language: 'اللغة', change_language: 'غيّر اللغة',
    lang_en: 'الإنجليزية', lang_ar: 'العربية', lang_fr: 'الفرنسية', lang_ha: 'الهوسا',

    // MaidDetail
    open_chat: 'رسالة', opening: 'بنفتح…',
    hire_this_maid: 'أنا مهتمة', already_hired: 'عاملتك ✅',
    hire_success: 'مبروك! التوظيف تم بنجاح 🎉', hire_failed: 'التوظيف مش تمام — جربي تاني',
    about: 'عنها', details: 'تفاصيل أكتر', languages_spoken: 'اللغات اللي بتتكلمها',
    reviews_section: 'التقييمات', no_reviews_yet: 'مفيش تقييمات لسه — كوني الأولى!',
    write_review: '✍️ قيّم تجربتك', submit_review: 'ابعت التقييم',
    profile_title: 'الملف الشخصي',

    // HW Profile menu
    menu_saved: 'اللي أعجبوني', menu_messages: 'رسايلي',
    menu_payments: 'مدفوعاتي', menu_notifications: 'إشعاراتي',
    menu_support: 'محتاجة مساعدة؟', menu_sign_out: 'خروج',
    menu_activity: 'نشاطي', menu_settings: 'الإعدادات', menu_account: 'حسابي',
    edit_btn: '✏️ تعديل', edit_profile: 'عدّل ملفك',

    // Notifications
    notifications_title: 'إشعاراتك', mark_all_read: 'علّم الكل كمقروء',

    // Chats
    chats_title: 'رسايلي', no_chats: 'لسه مفيش محادثات',
    subscribe_chat_title: 'اشترك عشان تتكلم مع المساعدات',
    subscribe_chat_body: 'بالاشتراك الشهري تقدر تتكلم مع أي مساعدة وتوظفها بسهولة.',
    subscribe_btn: 'اشترك — 1,000 جنيه/شهر',

    // Saved
    saved_title: 'مختاراتي', no_saved_maids: 'لسه ما حفظتش حد — تصفح واختار!',

    // Maid dash
    views: 'مشاهدات', likes: 'حبين', chats_stat: 'محادثات',

    // Tab labels
    tab_browse: 'تصفح', tab_saved: 'مختاراتي', tab_chats: 'رسايلي', tab_alerts: 'إشعارات', tab_me: 'أنا', tab_home: 'الرئيسية',

    // Filters
    filter_all: 'الكل', filter_available: 'متاحة دلوقتي', filter_top_rated: 'الأعلى تقييماً',
    filter_african: 'أفريقية', filter_asian: 'آسيوية', filter_cooking: 'طبخ',
    filter_childcare: 'رعاية أطفال', filter_eldercare: 'رعاية مسنين',
    filter_cleaning: 'تنظيف', filter_laundry: 'غسيل', filter_ironing: 'مكوة',
    filter_driving: 'قيادة', filter_petcare: 'رعاية حيوانات',
    filter_title: 'فلتري النتايج', filter_salary: 'نطاق الراتب (جنيه)',
    filter_min: 'أقل', filter_max: 'أكتر', filter_age: 'نطاق السن',
    filter_exp: 'أقل خبرة', filter_sort: 'رتبي حسب',
    filter_newest: 'الأحدث', filter_top_rated_sort: 'الأعلى تقييماً', filter_highest_salary: 'أعلى راتب',
    filter_reset: 'مسح الكل', filter_apply: 'طبقي الفلتر', filter_any: 'الكل',

    // Login
    welcome_back: 'يا أهلاً بيك!', role_customer: '🏠 عميل/عميلة', role_maid: '👩 مساعدة',

    // Register
    select_nationality_err: 'اختاري جنسيتك', bio_required: 'التعريف بنفسك مطلوب',
    phone_required: 'رقم الموبايل مطلوب',
    phone_invalid_eg: 'رقم الموبايل المصري لازم يبدأ بـ 01 (مثال: 01012345678)',
    upload_passport_photo_err: 'ارفعي صورة الجواز من فضلك',
    national_id_label: 'رقم الهوية الوطنية', national_id_ph: '14 رقم',
    valid_format: '✓ الصيغة صح', must_be_20_45: 'لازم تكوني بين 20 و45 سنة',
    tap_upload_passport: 'انقري عشان ترفعي صورة الجواز',
    clear_photo_of_page: 'صورة واضحة لصفحة البيانات بس',
    expected_salary_egp: 'الراتب اللي بتتوقعيه (جنيه/شهر)',
    languages_spoken_label: 'اللغات اللي بتتكلميها',
    tap_upload_photos: 'انقري عشان ترفعي صورك',
    professional_photos_note: 'صور واضحة تبيني بأحسن صورة',

    // RegisterHousewife
    customer_subtitle: 'عميل — لاقي مساعدتك الموثوقة بسهولة',
    select_area_err: 'اختار منطقتك في القاهرة',
    phone_invalid_hw: 'رقم الموبايل المصري لازم يبدأ بـ 01 (مثال: 01012345678)',
    your_area_cairo: 'منطقتك في القاهرة', area_soon_badge: 'قريباً',

    // Chat
    chat_online: '● أونلاين', voice_note: '🎙 رسالة صوتية',
    type_message: 'اكتب رسالتك…',
    failed_load_msgs: 'الرسائل مش اتحملت — جربي تاني', failed_send_msg: 'مش اتبعتت — جربي تاني',

    // MaidCard
    available_badge: 'متاحة دلوقتي', unavailable_badge: 'مش متاحة',
    exp_stat: 'خبرة', salary_stat: 'الراتب', reviews_short: 'تقييم',

    // MaidDetail
    terms_title: 'الشروط والأحكام',
    terms_body_short: 'Servix منصة وسيطة بس — بنربطك بالمساعدات ومش مسؤولين عن أي تصرفات من أي طرف.',
    terms_read_full: '📄 اقري الشروط كاملة (PDF)',
    terms_agree_label: 'قرأت الشروط والأحكام وموافق عليها',
    confirm_hire_btn: 'يلا نوظفها!',
    details_experience: 'سنوات الخبرة', details_salary: 'الراتب المتوقع',
    details_age: 'السن', details_origin: 'الجنسية',
    no_bio: 'مفيش تعريف لسه.',
    no_reviews_label: 'مفيش تقييمات لسه',
    no_reviews_sub: 'وظفي المساعدة وقيّمي تجربتك — رأيك مهم للأسر التانية!',
    saved_label: 'عجبتني', save_label: 'احفظها', yrs: 'سنة',
    notif_new_hire_title: 'طلب توظيف جديد! 🔔',
    notif_support_reply_title: '💬 رد فريق الدعم',
    notif_hire_declined_title: 'الطلب اترفض',
    notif_approved_title: 'البروفايل اتوافق عليه ✅',
    notif_rejected_title: 'البروفايل اترفض ❌',
    notif_sub_title: 'الاشتراك اتفعّل! 💵',
    notif_released_hw_title: 'تم إنهاء خدمة العاملة ↩',
    notif_released_maid_title: 'اتحررتي — متاحة تاني 🆓',
    request_sent_awaiting: '⏳ الطلب اتبعت — في انتظار الرد',
    review_after_hire_note: 'متاح بس بعد التوظيف',
    share_exp_optional: 'شاركينا تجربتك (اختياري)…',
    no_comment_left: 'مفيش تعليق',
    please_agree_terms: 'وافق على الشروط الأول',
    view_profile: 'شوف البروفايل',
    old_helpers: 'شغالاتي من قبل', no_history_yet: 'مفيش تاريخ لحد اللحظة',
    released_here_sub: 'اللي بتبعدهم هيبانوا هنا.',
    released_on: 'بداية الإجازة', past_placements: 'توظيفات سابقة',
    release_to_chat_title: 'تتكلمي مع صاحبة الشغل السابقة؟',
    release_to_chat_body: 'اتنهيت الخدمة. عايزة تبعتي رسالة لصاحبة الشغل؟',

    // HiredMaids
    hired_maid_title: 'مساعدتي', hired_maid_sub: 'كل تفاصيل مساعدتك في مكان واحد',
    no_hired_maid: 'لسه معندكش مساعدة',
    no_hired_sub: 'تصفح المساعدات المتاحة وابعت طلب توظيف — الأمر سهل!',
    browse_maids_btn: '🔍 تصفح المساعدات',
    hired_on: 'تاريخ التوظيف', skills_label_info: 'مهاراتها', release_vacancy: '↩ تغيير العامله',
    rate_required_release: 'قيّمي تجربتك قبل الإنهاء — رأيك بيساعد الأسر التانية.',
    share_exp_release: 'شاركينا تجربتك (اختياري بس بنقدّر رأيك جداً)…',
    submit_review_release: 'ابعت التقييم وأنهي العقد',
    please_rate_before_release: 'اختار تقييم بالنجوم الأول',

    // HireRequest
    incoming_label: 'واردة', hire_requests_title: 'طلبات التوظيف',
    review_before_deciding: 'اتعرفي على العميل قبل ما تردي',
    no_pending_requests: 'مفيش طلبات دلوقتي',
    no_pending_sub: 'لما حد يعجبها ملفك ويطلب توظيفك، هيبان هنا!',
    monthly_limit_reached: 'وصلتي لأقصى توظيف شهري',
    monthly_limit_desc: 'عندك توظيفين الشهر ده — جددي الاشتراك لقبول أكتر.',
    request_declined: 'الطلب اترفض', failed_to_respond: 'في مشكلة في الرد',
    view_customer_profile: '👁 اتعرفي على العميل',
    verified_subscriber: '✓ مشتركة موثقة',
    sub_status_unknown: 'حالة الاشتراك مش واضحة',
    area_info: 'المنطقة', phone_info: 'الموبايل', country_info: 'البلد',
    request_date_info: 'تاريخ الطلب',
    btn_decline: '✗ رفض', btn_accept_hire: '✓ قبول التوظيف',

    // HiredCelebration
    congratulations: 'مبروك! 🎉', youre_hired: 'اتقبلتي! 🎉',
    hired_body: 'رسمياً قبلتي طلب التوظيف — بنبعت إشعار للعميل دلوقتي!',
    hired_profile_unavail: 'ملفك اتعلّم كـ "مش متاحة" دلوقتي',
    hired_email_sent: 'العميل بعتناله رسالة تأكيد',
    hired_chat_employer: 'تكلمي مع صاحبة الشغل على الرسائل',
    go_to_dashboard: 'روحي للوحة التحكم →',

    // MaidDash
    active_subscription: 'اشتراكك شغال', sub_ends: 'ينتهي',
    areas_you_serve: 'مناطقك في القاهرة',
    areas_serve_sub: 'اختاري كل المناطق اللي تقدري تشتغلي فيها',
    service_areas_updated: 'المناطق اتحدثت! 🎉', save_areas_fail: 'الحفظ مش تمام',
    hire_req_waiting: 'في طلب توظيف ينتظر ردك!', hire_reqs_waiting: 'في طلبات توظيف بتنتظر ردك!',
    tap_review_decide: 'انقري عشان تشوفي وتردي',
    set_service_areas: 'حدّدي مناطقك', tap_to_update: 'انقري للتحديث',
    area_find_notice: 'العملاء هيلاقوكي بس لو حددتي منطقتك',
    currently_hired_badge: '✓ شغالة دلوقتي',
    currently_hired_desc: 'أنتي في ارتباط شغل حالي — لما تنهي العقد هترجعي للمتاحات.',
    open_support: 'تكلمي مع فريق الدعم', contact_admin_note: 'الفريق موجود لأي مشكلة',
    deactivates_profile: 'هيوقف ملفك الشخصي',
    my_reviews: '⭐ تقييماتي', no_reviews_maid: 'مفيش تقييمات لسه',
    no_reviews_maid_sub: 'اشتغلي بجد وقدمي أحسن خدمة — التقييمات الحلوة هتيجي! ⭐',
    no_comment_short: 'مفيش تعليق',
    menu_hire_requests: 'طلبات التوظيف', menu_messages2: 'رسايلي',
    menu_payments2: 'مدفوعاتي', menu_referrals: 'الإحالات',
    menu_analytics: 'إحصائياتي', menu_notifications2: 'إشعاراتي',
    menu_support2: 'محتاجة مساعدة؟', menu_delete_account: 'حذف حسابي',
    menu_sign_out: 'خروج', share_code_earn: 'شاركي كودك واكسبي مكافآت',

    // HWProfile
    my_hired_maid: 'مساعدتي', delete_account: 'حذف حسابي',
    delete_confirm_title: 'هتحذف حسابك؟',
    delete_confirm_body: 'حسابك هيتعطل وبس الإدارة تقدر ترجعهولك. متأكد؟',
    confirm_deletion: 'أكّد الحذف',
    confirm_deletion_body: 'مش هتقدر ترجعه لوحدك — هتكمل؟',
    yes_delete: 'أيوه، احذف', failed_delete: 'الحذف مش تمام',

    // Support
    support_title: 'تكلم معنا', support_sub: 'بنرد في أقل من 24 ساعة',
    new_ticket: 'مشكلة جديدة', my_tickets: 'مشاكلي',
    priority_label: 'الأولوية', priority_low: 'منخفضة', priority_medium: 'متوسطة', priority_high: 'عالية',
    subject_label: 'موضوع المشكلة', message_label2: 'رسالتك',
    subject_ph: 'وصف مختصر لمشكلتك',
    message_ph: 'اشرحي مشكلتك بالتفصيل وهنساعدك…',
    submitting: 'بنبعت…', submit_ticket: 'ابعت مشكلتك', no_tickets: 'مفيش مشاكل مبعوتة لسه',
    subject_msg_required: 'الموضوع والرسالة مطلوبين',
    ticket_submitted: 'المشكلة اتبعتت!', ticket_submitted_sub: 'هنتواصل معاك قريباً',

    // PaymentResult
    sub_activated: 'الاشتراك شغال دلوقتي! 🎉', receipt_submitted_title: 'الإيصال اتبعت',
    offline_confirmed_body: 'الإدارة أكدت دفعتك — اشتراكك شغال تماماً دلوقتي.',
    offline_pending_body: 'الإيصال بتاعك وصلنا وبنراجعه دلوقتي.\nهنفعّل اشتراكك في أقل من 24 ساعة.',
    amount_confirmed_label: 'المبلغ المؤكد', amount_submitted_label: 'المبلغ المبعوت',
    confirmed_badge: '✓ مؤكد', pending_admin_badge: '⏳ في انتظار التأكيد',
    go_to_app: 'يلا نكمل →', check_status_btn2: '🔄 تحققي من الحالة',
    payment_confirmed_online: 'الدفع اتأكد! 🎉', amount_paid_label: 'المبلغ اللي اتدفع',
    verifying_payment: 'بنتحقق من الدفع…', go_home: 'روحي الرئيسية →',
    still_pending: 'لسه بيتراجع', could_not_check: 'مش قدرنا نتحقق دلوقتي',
    payment_of_egp: 'دفعتك بمبلغ ',
    payment_was_successful: ' اتعملت بنجاح!\nاشتراكك شغال دلوقتي.',
    offline_notification_note: 'هتاخدي إشعار لما الإدارة تأكد — ممكن تقفلي الشاشة وترجعي بعدين.',

    // Chats list
    no_msgs_yet: 'مفيش رسايل لسه',

    // Analytics
    analytics_title: 'إحصائياتك', analytics_sub: 'شوفي أداء ملفك الشخصي',
    stat_views: 'مشاهدات الملف', stat_likes: 'اللي حبوكي',
    stat_chats2: 'طلبات المحادثة', stat_hired: 'مرات التوظيف', summary_label: 'الملخص',

    // PaymentHistory
    payments_title: 'مدفوعاتي', payments_sub: 'الاشتراكات والعمولات',
    no_payments: 'مفيش مدفوعات لسه', transactions_here: 'معاملاتك هتظهر هنا',

    // EditHWProfile
    edit_profile_title2: 'عدّل ملفك', field_full_name: 'اسمك الكامل',
    field_city: 'المدينة', field_country: 'البلد',
    name_ph: 'اسمك', city_ph: 'مثال: القاهرة', country_ph: 'مثال: مصر',
    name_required_err: 'الاسم مطلوب', profile_updated: 'الملف اتحدث! 🎉',
    update_failed: 'التحديث مش تمام', saving: 'بنحفظ…', save_changes: 'احفظ التغييرات',

    // Subscription extra
    monthly_plan_name: 'الباقة الشهرية', pricing_for: 'تسعير خاص لـ',
    standard_pricing: 'التسعير العادي',
    plan_active_listing: 'ملفك هيبان للأسر اللي بتدور على مساعدة',
    plan_photos: 'ارفعي لحد 5 صور تبيني بأحسن صورة',
    plan_chat: 'تكلمي مع الأسر المهتمة في أي وقت',
    plan_analytics: 'شوفي كام أسرة اطلعت على ملفك',
    plan_support: 'اقبلي لحد طلبَي توظيف كل شهر',
    have_coupon: 'عندك كود خصم أو إحالة؟ (اختياري)',
    coupon_applied_pct: 'الكود اتطبق —', you_save: 'وفرتي',
    remove_coupon: 'شيلي الكود', pay_cash: 'ادفعي بالتحويل النقدي',
    arrange_offline: 'رتبي الدفع مع الإدارة', per_month: '/شهر',
    receipt_under_review: '⏳ الإيصال بيتراجع',
    receipt_review_body: 'الإيصال وصلنا وبنراجعه — هتاخدي إشعار فور التأكيد.',
    check_confirmation_status: '🔄 تحققي من حالة التأكيد',
    submit_new_receipt: 'ابعتي إيصال جديد',
    cash_transfer_title: '💵 الدفع بالتحويل النقدي',
    cash_transfer_sub: 'حوّلي رسوم الاشتراك لأحد الحسابات دي، وبعدين ارفعي الإيصال.',
    amount_due: 'المبلغ المطلوب', transfer_to: 'حوّلي على', account_name: 'اسم الحساب',
    upload_receipt: 'ارفعي الإيصال', tap_upload_receipt: 'انقري عشان ترفعي الإيصال',
    receipt_screenshot_note: 'صورة أو سكرين شوت من تأكيد التحويل',
    try_again_btn: 'جربي تاني', submit_receipt_btn: 'ابعتي الإيصال للتأكيد',
    already_paid_check: 'دفعتي بالفعل؟ انقري تتحققي إذا الإدارة فعّلت اشتراكك',

    // Subscription extra 2
    receipt_rejected: 'الإيصال اترفض', receipt_rejected_sub: 'ارفعي إيصال أوضح من فضلك.',
    admin_not_confirmed_yet: 'الإدارة لسه مأكدتش.',
    checking_label: 'بنتحقق…', coupon_invalid: 'الكود ده مش شغال',
    discount_applied_suffix: '% خصم اتطبق!', apply_label: 'طبقي',

    // MaidDetail extra
    review_submitted: 'تقييمك اتبعت! شكراً 🌟', review_submit_failed: 'التقييم مش اتبعت — جربي تاني',
    hire_req_sent: '✅ الطلب اتبعت!', hire_req_sent_sub: 'بنستنى رد المساعدة.',
    chat_open_failed: 'المحادثة مش اتفتحت', please_rate_star: 'اختاري تقييم بالنجوم',
    rate_label: 'تقييمك', login_success_toast: 'أهلاً بيك! 👋',

    // HiredMaids extra
    next_hire_free:     '✓ التوظيف الجاي مجاني (فترة السماح)',
    next_hire_fee_500:  '⚠ رسوم التوظيف الجاي: 500 جنيه',
    next_hire_fee_700:  '⚠ رسوم التوظيف الجاي: 700 جنيه',
    next_hire_fee_1000: '⚠ رسوم التوظيف الجاي: 1,000 جنيه',
    vacancy_released: 'العقد اتنهى',
    release_failed: 'الإنهاء مش تمام',
    release_btn: 'إنهاء العقد',
    release_dialog_title: '↩ إنهاء عقد المساعدة',
    release_confirm_grace_body_1: 'أنتي في فترة السماح (3 أيام) — الإنهاء مجاني خالص.',
    release_confirm_grace_body_2: 'التوظيف الجاي مجاني برضو — عندك 3 أيام تختاري بديلة.',
    release_confirm_fee_body_1: '⚠ لازم تدفعي رسوم الاستبدال قبل ما تتكلمي أو توظفي مساعدة جديدة.',
    release_confirm_fee_body_2_prefix: 'قيمة الرسوم:',
    release_confirm_fee_body_2_suffix: 'الرسوم دي لازم تتدفع قبل أي محادثة أو طلب توظيف جديد.',
    release_toast_free: 'نافذة الاستبدال المجاني لمدة 3 أيام شغالة دلوقتي! 🎉',
    release_toast_fee_prefix: 'ادفعي',
    release_toast_fee_suffix: 'عشان تقدري تتكلمي مع مساعدتك الجاية.',
    // Replacement policy modal
    rp_title: 'سياسة استبدال العاملة',
    rp_short: 'إذا لم تكن العاملة مناسبة لاحتياجاتك، يمكنك طلب استبدالها.',
    rp_learn_more: 'اعرفي كيف تعمل رسوم الاستبدال',
    rp_period_col: 'مدة العمل',
    rp_fee_col: 'رسوم الاستبدال',
    rp_row0: '0–3 أيام',     rp_row0_fee: '✅ مجانًا (فترة تجربة)',
    rp_row1: '4–7 أيام',     rp_row1_fee: '500 جنيه مصري',
    rp_row2: '8–30 يومًا',   rp_row2_fee: '700 جنيه مصري',
    rp_row3: 'بعد 30 يومًا', rp_row3_fee: '1000 جنيه مصري',
    rp_good_to_know: 'معلومات مهمة',
    rp_note1: 'يتم تحصيل رسوم الاستبدال عند التعاقد مع العاملة الجديدة فقط، وليس عند إنهاء العاملة الحالية.',
    rp_note2: 'بعد إنهاء خدمة العاملة الحالية، لديك 30 يومًا لاختيار عاملة بديلة ضمن هذه السياسة.',
    rp_note3: 'تهدف هذه السياسة إلى توفير مرونة أكبر مع الحفاظ على جودة الخدمة.',
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
    no_maids_sub: "Nous grandissons chaque jour — une aide ménagère parfaite sera bientôt disponible.",
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
    open_chat: 'Message', opening: 'Ouverture…',
    hire_this_maid: 'Je suis intéressée', already_hired: 'Déjà embauchée ✅',
    hire_success: 'Employée embauchée avec succès!', hire_failed: "Échec de l'embauche",
    about: 'À propos', details: 'Détails', languages_spoken: 'Langues',
    reviews_section: 'Avis', no_reviews_yet: 'Pas encore d\'avis. Soyez le premier!',
    write_review: '✍️ Écrire un avis', submit_review: 'Soumettre l\'avis',
    profile_title: 'Profil',

    // HW Profile menu
    menu_saved: 'Profils sauvegardés', menu_messages: 'Messages',
    menu_payments: 'Paiements', menu_notifications: 'Notifications',
    menu_support: 'Support', menu_sign_out: 'Se déconnecter',
    menu_activity: 'Mon activité', menu_settings: 'Paramètres', menu_account: 'Compte',
    edit_btn: '✏️ Modifier', edit_profile: 'Modifier le profil',

    // Notifications
    notifications_title: 'Notifications', mark_all_read: 'Tout marquer comme lu',

    // Chats
    chats_title: 'Messages', no_chats: 'Aucune conversation',
    subscribe_chat_title: "S'abonner pour accéder aux messages",
    subscribe_chat_body: 'Discutez avec les employées et gérez votre processus d\'embauche.',
    subscribe_btn: "S'abonner — 1 000 EGP/mois",

    // Saved
    saved_title: 'Aides sauvegardées', no_saved_maids: 'Aucune aide sauvegardée',

    // Maid dash
    views: 'Vues', likes: 'J\'aime', chats_stat: 'Chats',

    // Tab labels
    tab_browse: 'Parcourir', tab_saved: 'Sauvegardés', tab_chats: 'Messages', tab_alerts: 'Alertes', tab_me: 'Moi', tab_home: 'Accueil',

    // Filters
    filter_all: 'Tous', filter_available: 'Disponible', filter_top_rated: 'Mieux notés',
    filter_african: 'Africaine', filter_asian: 'Asiatique', filter_cooking: 'Cuisine',
    filter_childcare: 'Garde enfants', filter_eldercare: 'Soins seniors',
    filter_cleaning: 'Ménage', filter_laundry: 'Lessive', filter_ironing: 'Repassage',
    filter_driving: 'Conduite', filter_petcare: 'Animaux',
    filter_title: 'Filtres', filter_salary: 'Salaire (EGP)',
    filter_min: 'Min', filter_max: 'Max', filter_age: "Tranche d'âge",
    filter_exp: 'Expérience min', filter_sort: 'Trier par',
    filter_newest: 'Plus récent', filter_top_rated_sort: 'Mieux notés', filter_highest_salary: 'Salaire élevé',
    filter_reset: 'Réinitialiser', filter_apply: 'Appliquer', filter_any: 'Tout',

    // Login
    welcome_back: 'Bon retour', role_customer: '🏠 Cliente', role_maid: '👩 Auxiliaire',

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
    available_badge: 'Disponible', unavailable_badge: 'Indisponible',
    exp_stat: 'Exp', salary_stat: 'Salaire', reviews_short: 'avis',

    // MaidDetail
    terms_title: 'Conditions générales',
    terms_body_short: "Servix est une plateforme de communication uniquement. Nous connectons les clientes avec des prestataires de services et ne sommes pas responsables de leur conduite.",
    terms_read_full: '📄 Lire les CGU complètes (PDF)',
    terms_agree_label: "J'ai lu et j'accepte les conditions générales",
    confirm_hire_btn: "Confirmer la demande d'embauche",
    details_experience: 'Expérience', details_salary: 'Salaire attendu',
    details_age: 'Âge', details_origin: 'Origine',
    no_bio: 'Aucune biographie fournie.',
    no_reviews_label: "Pas encore d'avis",
    no_reviews_sub: "Engagez cet(te) auxiliaire et soyez le premier à partager votre expérience",
    saved_label: 'Sauvegardé', save_label: 'Sauvegarder', yrs: 'ans',
    notif_new_hire_title: '🔔 Nouvelle demande !',
    notif_support_reply_title: '💬 Réponse du support',
    notif_hire_declined_title: 'Demande refusée',
    notif_approved_title: '✅ Profil approuvé !',
    notif_rejected_title: '❌ Profil rejeté',
    notif_sub_title: '💵 Abonnement activé !',
    notif_released_hw_title: '↩ Aide libérée',
    notif_released_maid_title: '🆓 À nouveau disponible',
    request_sent_awaiting: '⏳ Demande envoyée — En attente',
    review_after_hire_note: "Disponible seulement après l'embauche",
    share_exp_optional: 'Partagez votre expérience (optionnel)…',
    no_comment_left: 'Aucun commentaire',
    please_agree_terms: 'Veuillez accepter les CGU',

    // HiredMaids
    hired_maid_title: 'Mon employée', hired_maid_sub: 'Gérez votre aide ménagère actuelle',
    no_hired_maid: 'Pas encore de employée',
    no_hired_sub: 'Parcourez les employées disponibles et envoyez une demande.',
    browse_maids_btn: '🔍 Parcourir les employées',
    hired_on: 'Embauchée le', skills_label_info: 'Compétences', release_vacancy: 'Je veux une autre employée',
    rate_required_release: 'Un avis est requis avant de libérer le poste.',
    share_exp_release: 'Partagez votre expérience (optionnel)…',
    submit_review_release: "Soumettre l'avis et libérer",
    please_rate_before_release: 'Sélectionnez une note en étoiles',

    // HireRequest
    incoming_label: 'Entrant', hire_requests_title: "Demandes d'embauche",
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
    congratulations: 'Félicitations !', youre_hired: 'Vous êtes embauchée ! 🎉',
    hired_body: "Vous avez officiellement accepté la demande. La cliente a été notifiée.",
    hired_profile_unavail: 'Votre profil est désormais indisponible',
    hired_email_sent: "La cliente a reçu un email de confirmation",
    hired_chat_employer: 'Discutez avec votre employeur via Messages',
    go_to_dashboard: 'Aller au tableau de bord →',

    // MaidDash
    active_subscription: 'Abonnement actif', sub_ends: 'Expire le',
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
    plan_active_listing: 'Votre profil visible aux familles qui cherchent activement',
    plan_photos: "Ajoutez jusqu'à 5 photos pour vous démarquer",
    plan_chat: 'Chattez directement avec les familles intéressées',
    plan_analytics: 'Voyez combien de familles ont consulté votre profil',
    plan_support: "Acceptez jusqu'à 2 demandes d'embauche par mois",
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
    hire_req_sent: '✅ Demande envoyée !', hire_req_sent_sub: "En attente de l'approbation.",
    chat_open_failed: 'Impossible d\'ouvrir le chat', please_rate_star: 'Sélectionnez une note en étoiles',
    rate_label: 'Évaluer', login_success_toast: 'Bon retour ! 👋',

    // HiredMaids extra
    next_hire_free:     '✓ Prochaine embauche gratuite (grâce)',
    next_hire_fee_500:  '⚠ Frais prochaine embauche : EGP 500',
    next_hire_fee_700:  '⚠ Frais prochaine embauche : EGP 700',
    next_hire_fee_1000: '⚠ Frais prochaine embauche : EGP 1 000',
    vacancy_released: 'Employée libérée',
    release_failed: 'Échec de la libération',
    release_btn: 'Libérer',
    release_dialog_title: '↩ Libérer l\'employée',
    release_confirm_grace_body_1: 'Vous êtes dans la période de grâce de 3 jours. La libération est totalement gratuite.',
    release_confirm_grace_body_2: 'Votre prochaine embauche sera aussi gratuite. Vous avez 3 jours pour choisir un remplaçant.',
    release_confirm_fee_body_1: '⚠ Des frais de remplacement sont requis avant de pouvoir discuter ou embaucher votre prochaine employée.',
    release_confirm_fee_body_2_prefix: 'Montant des frais :',
    release_confirm_fee_body_2_suffix: 'Ces frais doivent être payés avant de démarrer toute conversation ou demande d\'embauche.',
    release_toast_free: 'Fenêtre de remplacement gratuite de 3 jours active.',
    release_toast_fee_prefix: 'Payez',
    release_toast_fee_suffix: 'pour déverrouiller le chat avec votre prochaine employée.',
    // Replacement policy modal
    rp_title: 'Politique de remplacement',
    rp_short: "Si votre employée ne convient pas, vous pouvez demander un remplacement.",
    rp_learn_more: 'Voir les frais de remplacement',
    rp_period_col: 'Période de travail',
    rp_fee_col: 'Frais de remplacement',
    rp_row0: '0–3 jours',     rp_row0_fee: "✅ Gratuit (période d'essai)",
    rp_row1: '4–7 jours',     rp_row1_fee: 'EGP 500',
    rp_row2: '8–30 jours',    rp_row2_fee: 'EGP 700',
    rp_row3: 'Après 30 jours',rp_row3_fee: 'EGP 1 000',
    rp_good_to_know: 'Bon à savoir',
    rp_note1: 'Les frais de remplacement ne sont facturés que lorsque vous embauchez votre employée de remplacement, pas quand vous libérez la précédente.',
    rp_note2: 'Après la fin de service, vous avez 30 jours pour choisir une remplaçante.',
    rp_note3: 'Cette politique nous aide à maintenir la qualité du service tout en vous offrant de la flexibilité.',
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
    no_maids: "Ba a sami ma'aikata ba",
    no_maids_sub: "Muna girma kowace rana — cikakkiyar ma'aikatarku za ta kasance a nan soon.",
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
    open_chat: 'Sako', opening: 'Ana buɗewa…',
    hire_this_maid: "Ina sha'awar wannan", already_hired: 'An ɗauka ✅',
    hire_success: 'An ɗauki ma\'aikata!', hire_failed: 'Ɗaukar ya kasa',
    about: 'Game da', details: 'Bayani', languages_spoken: 'Harsunan da ake magana',
    reviews_section: 'Bita', no_reviews_yet: 'Babu bita tukuna. Ku zama na farko!',
    write_review: '✍️ Rubuta bita', submit_review: 'Aika bita',
    profile_title: 'Bayanin martaba',

    // HW Profile menu
    menu_saved: "Ma'aikata da aka ajiye", menu_messages: 'Saƙonni',
    menu_payments: 'Biyan kuɗi', menu_notifications: 'Sanarwa',
    menu_support: 'Tallafi', menu_sign_out: 'Fita',
    menu_activity: 'Ayyukana', menu_settings: 'Saitunan', menu_account: 'Asusuna',
    edit_btn: '✏️ Gyara', edit_profile: 'Gyara bayanin martaba',

    // Notifications
    notifications_title: 'Sanarwa', mark_all_read: 'Alama duka an karanta',

    // Chats
    chats_title: 'Saƙonni', no_chats: 'Babu tattaunawa tukuna',
    subscribe_chat_title: 'Yi rajista don samun damar saƙonni',
    subscribe_chat_body: 'Yi hira da ma\'aikata kuma sarrafa tsarin ɗaukar ma\'aikata.',
    subscribe_btn: 'Yi rajista — EGP 1,000/wata',

    // Saved
    saved_title: "Mataimaka da aka adana", no_saved_maids: "Babu mataimaka da aka adana tukuna",

    // Maid dash
    views: 'Kallon', likes: 'Son', chats_stat: 'Tattaunawa',

    // Tab labels
    tab_browse: 'Bincike', tab_saved: 'Ajiye', tab_chats: 'Saƙonni', tab_alerts: 'Sanarwa', tab_me: 'Ni', tab_home: 'Gida',

    // Filters
    filter_all: 'Duka', filter_available: 'Akwai', filter_top_rated: 'Mafi kyau',
    filter_african: 'Afirka', filter_asian: 'Asiya', filter_cooking: 'Girki',
    filter_childcare: 'Kula yara', filter_eldercare: 'Kula tsofaffi',
    filter_cleaning: 'Tsaftace', filter_laundry: 'Wanka kaya', filter_ironing: 'Jefe',
    filter_driving: 'Tuki', filter_petcare: 'Kula dabbobi',
    filter_title: 'Tace', filter_salary: 'Albashi (EGP)',
    filter_min: 'Kadan', filter_max: 'Yawa', filter_age: 'Shekaru',
    filter_exp: 'Gogagge', filter_sort: 'Tsari',
    filter_newest: 'Sabon', filter_top_rated_sort: 'Mafi kyau', filter_highest_salary: 'Babban albashi',
    filter_reset: 'Sifili', filter_apply: 'Amfani', filter_any: 'Kowane',

    // Login
    welcome_back: 'Barka da komawa', role_customer: '🏠 Abokin ciniki', role_maid: "👩 Mai Taimako",

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
    available_badge: 'Akwai', unavailable_badge: 'Ba a nan',
    exp_stat: 'Ƙwarewa', salary_stat: 'Albashi', reviews_short: 'bita',

    // MaidDetail
    terms_title: 'Sharuɗɗa da Yanayi',
    terms_body_short: "Servix dandali ne kawai. Ba mu da alhakin ayyukan kowane ma'aikaci ko abokin ciniki.",
    terms_read_full: '📄 Karanta cikakkun sharuɗɗa (PDF)',
    terms_agree_label: 'Na karanta kuma na yarda da sharuɗɗan',
    confirm_hire_btn: 'Tabbatar da Neman Aiki',
    details_experience: 'Ƙwarewa', details_salary: 'Albashin da ake sa ran',
    details_age: 'Shekaru', details_origin: 'Asali',
    no_bio: 'Babu bayani.',
    no_reviews_label: 'Babu bita tukuna',
    no_reviews_sub: "Ɗauki wannan mai taimako kuma ku zama na farko raba ƙwarewarku",
    saved_label: 'An ajiye', save_label: 'Ajiye', yrs: 'shekara',
    notif_new_hire_title: '🔔 Sabon buƙatar haya!',
    notif_support_reply_title: '💬 Amsar Tallafi',
    notif_hire_declined_title: 'An ƙi buƙatar haya',
    notif_approved_title: '✅ An yarda da bayanin martaba!',
    notif_rejected_title: '❌ An ƙi bayanin martaba',
    notif_sub_title: '💵 Biyan kuɗi ya tabbata!',
    notif_released_hw_title: "↩ Ma'aikaciya ta tafi",
    notif_released_maid_title: '🆓 Akwai ku yanzu',
    request_sent_awaiting: '⏳ An aika buƙata — Ana jira',
    review_after_hire_note: "Yana samuwa kawai bayan ɗauka",
    share_exp_optional: 'Raba ƙwarewarku (zaɓi)…',
    no_comment_left: 'Babu sharhi',
    please_agree_terms: 'Da fatan yarda da sharuɗɗan',

    // HiredMaids
    hired_maid_title: "Ma'aikatar da aka ɗauka", hired_maid_sub: "Gudanar da ma'aikatarku ta yanzu",
    no_hired_maid: "Babu ma'aikatar da aka ɗauka tukuna",
    no_hired_sub: "Duba ma'aikata masu akwai kuma aika buƙatar ɗauka.",
    browse_maids_btn: "🔍 Duba Ma'aikata",
    hired_on: "An ɗauka a", skills_label_info: 'Iyawa', release_vacancy: "Ina son wata ma'aikaciya",
    rate_required_release: 'Ana buƙatar bita kafin sakin wurin aiki.',
    share_exp_release: 'Raba ƙwarewarku (zaɓi amma ana godiya)…',
    submit_review_release: 'Aika Bita kuma Sake Wuri',
    please_rate_before_release: 'Da fatan zaɓi tauraron da',

    // HireRequest
    incoming_label: 'Shigowa', hire_requests_title: "Buƙatun Ɗauka",
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
    congratulations: 'Taya murna!', youre_hired: 'An ɗauke ki! 🎉',
    hired_body: 'An karɓi buƙatar ɗaukarka a hukumance. An sanar da abokin ciniki.',
    hired_profile_unavail: 'An nuna bayananku a matsayin ba a nan',
    hired_email_sent: 'Abokin ciniki ya karɓi imel na tabbatarwa',
    hired_chat_employer: 'Yi hira da mai aikin ku ta Saƙonni',
    go_to_dashboard: 'Tafi ga Allon Sarrafa →',

    // MaidDash
    active_subscription: 'Biyan kuɗi mai aiki', sub_ends: 'Ƙarewa',
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
    plan_active_listing: 'Bayananka yana bayyana ga iyalai masu neman ma\'aikata',
    plan_photos: 'Ƙara hotuna har 5 don fita daga cikin jama\'a',
    plan_chat: 'Tattauna kai tsaye da iyalai masu sha\'awa',
    plan_analytics: 'Ga adadin iyalai da suka kalli bayananka',
    plan_support: 'Karɓi buƙatun hayar har 2 a wata',
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
    hire_req_sent: '✅ An aika buƙata!', hire_req_sent_sub: 'Ana jiran amincewa.',
    chat_open_failed: 'Buɗe tattaunawa ya kasa', please_rate_star: 'Da fatan zaɓi tauraron da',
    rate_label: 'Ƙimar', login_success_toast: 'Barka da komawa! 👋',

    // HiredMaids extra
    next_hire_free:     '✓ Ɗaukar aiki na gaba kyauta (alheri)',
    next_hire_fee_500:  '⚠ Kuɗin ɗaukar aiki na gaba: EGP 500',
    next_hire_fee_700:  '⚠ Kuɗin ɗaukar aiki na gaba: EGP 700',
    next_hire_fee_1000: '⚠ Kuɗin ɗaukar aiki na gaba: EGP 1,000',
    vacancy_released: 'An sake ma\'aikaciya',
    release_failed: 'Sakin ya kasa',
    release_btn: 'Sake',
    release_dialog_title: '↩ Sake Ma\'aikaciya',
    release_confirm_grace_body_1: 'Kuna cikin lokacin alheri na kwanaki 3. Sakin kyauta ne gaba ɗaya.',
    release_confirm_grace_body_2: 'Ɗaukar aiki na gaba kyauta ne. Kuna da kwanaki 3 don zaɓar maye gurbi.',
    release_confirm_fee_body_1: '⚠ Dole ne ku biya kuɗin maye gurbi kafin fara tattaunawa ko ɗaukar sabuwar ma\'aikaciya.',
    release_confirm_fee_body_2_prefix: 'Adadin kuɗin:',
    release_confirm_fee_body_2_suffix: 'Dole ne a biya kuɗin nan kafin fara tattaunawa ko ƙaddamar da buƙatar ɗaukar aiki.',
    release_toast_free: 'Tagar maye gurbi kyauta ta kwanaki 3 tana aiki yanzu.',
    release_toast_fee_prefix: 'Biya',
    release_toast_fee_suffix: 'don buɗe tattaunawa da ma\'aikaciyanku ta gaba.',
    // Replacement policy modal
    rp_title: "Manufar Maye Gurbi",
    rp_short: "Idan ma'aikatarku ba ta dace ba, za ku iya neman maye gurbi.",
    rp_learn_more: 'Koyi game da kuɗaɗen maye gurbi',
    rp_period_col: 'Tsawon Aiki',
    rp_fee_col: 'Kuɗin Maye Gurbi',
    rp_row0: 'Kwana 0–3',     rp_row0_fee: '✅ Kyauta (lokacin gwaji)',
    rp_row1: 'Kwana 4–7',     rp_row1_fee: 'EGP 500',
    rp_row2: 'Kwana 8–30',    rp_row2_fee: 'EGP 700',
    rp_row3: 'Bayan kwana 30',rp_row3_fee: 'EGP 1,000',
    rp_good_to_know: 'Yana da kyau a sani',
    rp_note1: "Ana biyan kuɗin maye gurbi ne kawai lokacin da kuka ɗauki ma'aikatarku ta maye, ba lokacin da kuka sake ta ba.",
    rp_note2: "Bayan kammala ayyukan ma'aikatarku ta yanzu, kuna da kwana 30 don zaɓar maye gurbi.",
    rp_note3: 'Wannan manufa tana taimaka wajen kiyaye ingancin sabis tare da ba ku sassauci.',
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

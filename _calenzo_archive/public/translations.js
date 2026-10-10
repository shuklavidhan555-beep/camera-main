// Translations for English and Hindi
const I18N = {
  en: {
    brandTagline: "Clinic Appointment & Queue Management System",
    brandSubtitle: "Handling your conversion, convenience, and patients.",
    liveStatus: "Live Online 24/7",
    navPatient: "Patient Portal",
    navReceptionist: "Front Desk (Receptionist)",
    navDoctor: "Doctor Room",
    navAdmin: "Admin & Analytics",
    navTv: "TV Display",
    navMessages: "WhatsApp Log",
    
    // Patient Portal
    bookTitle: "Book Clinic Appointment",
    bookSubtitle: "Skip the waiting room. Book online and track your live queue position from home.",
    stepPatientType: "1. Consultation Type",
    stepSelectSlot: "2. Date & Time Slot",
    stepPatientDetails: "3. Patient Information",
    stepConfirm: "4. Confirmation",
    
    typeNew: "First-Time Patient (New)",
    typeNewDesc: "Comprehensive 20-min consultation & medical history intake",
    typeFollowUp: "Returning Patient (Follow-up)",
    typeFollowUpDesc: "Routine 10-min review, prescription renewal or lab check",
    typeProcedure: "Procedure / Screening",
    typeProcedureDesc: "ECG, cardiac screening, preventive checkups (30 mins)",

    dateLabel: "Select Date",
    slotLabel: "Available Unbooked Slots",
    noDoubleBooking: "Guaranteed: Only open slots shown. No double bookings.",
    fullName: "Full Name",
    phoneLabel: "WhatsApp / Mobile Number",
    ageLabel: "Age",
    genderLabel: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    symptomsLabel: "Brief Symptoms / Reason for Visit",
    bookButton: "Confirm Booking & Get Token",
    
    // Live Tracker
    trackTitle: "Live Queue Tracker",
    trackSubtitle: "Check your live position before leaving home to arrive at the perfect time.",
    enterTokenPlaceholder: "Enter Token (e.g. A-04) or Phone...",
    trackBtn: "Track",
    nowServing: "Now In Consultation",
    yourToken: "Your Token",
    peopleAhead: "Patients Ahead of You",
    estimatedWait: "Estimated Wait Time",
    suggestedArrival: "Suggested Arrival Window",
    arrivalNotice: "Please arrive within this window to avoid waiting outside.",
    statusWaiting: "Waiting at Home / En Route",
    statusArrived: "Checked-in at Waiting Room",
    statusConsulting: "Inside Consultation Room",
    statusCompleted: "Consultation Completed",
    emergencyCancelBtn: "Emergency? Cancel Appointment",
    
    // Walk-in
    walkInTitle: "Rapid Walk-in Intake",
    walkInSubtitle: "Add walk-in patients to live queue in under 30 seconds with automatic token assignment.",
    quickAddBtn: "Add to Live Queue",
    
    // Queue Controls
    markArrived: "Mark Arrived",
    startConsult: "Start Consult",
    completeConsult: "Complete & Next",
    skipToken: "Skip",
    recallToken: "Recall",
    cancelBooking: "Cancel",
    addDelayBtn: "Add Delay (+15m)",
    
    // Doctor Room
    docRoomTitle: "Doctor Consultation Room",
    docSubtitle: "Live queue monitor, patient records, and consultation flow.",
    patientInRoom: "Patient in Room",
    elapsedTime: "Elapsed Time",
    medicalHistory: "Past Medical History",
    allergies: "Known Allergies",
    doctorNotesPlaceholder: "Clinical assessment, symptoms examined, vital signs...",
    diagnosisPlaceholder: "Diagnosis / Medical condition...",
    prescriptionPlaceholder: "Prescription (Medications, dosage, duration, instructions)...",
    followUpInLabel: "Recommended Follow-up In:",
    
    // TV Display
    tvNowServing: "NOW SERVING",
    tvRoom: "CONSULTATION ROOM 1",
    tvDoctor: "Dr. Arvind Sharma",
    tvNextUp: "NEXT IN LINE",
    tvEstimatedWait: "Approx. Wait",
    tvSoundNotice: "Click anywhere on screen to enable audio chime announcements",
    
    // Analytics
    analyticsTitle: "Clinic Performance & Analytics",
    monthlyAppointments: "Total Appointments",
    noShowRate: "No-Show Rate",
    sourceBreakdown: "Online vs Walk-in",
    avgWaitTime: "Avg Wait Time",
    avgConsultTime: "Avg Consultation Time",
    newVsReturning: "New vs Returning",
    busiestHours: "Peak Hours & Busiest Slots",
    
    // Follow-ups
    followUpTitle: "Follow-Up CRM & Patient Retention",
    followUpSubtitle: "Ensure 100% post-visit retention. Automatic tasks generated after each visit.",
    priorityHot: "Hot (Urgent)",
    priorityWarm: "Warm (Routine)",
    priorityCold: "Cold (Low)",
    contactViaWa: "Contact on WhatsApp"
  },

  hi: {
    brandTagline: "क्लिनिक अपॉइंटमेंट एवं कतार प्रबंधन प्रणाली",
    brandSubtitle: "आपकी सुविधा, रूपांतरण और मरीजों की संपूर्ण देखभाल।",
    liveStatus: "24/7 ऑनलाइन उपलब्ध",
    navPatient: "मरीज़ पोर्टल",
    navReceptionist: "फ्रंट डेस्क (रिसेप्शन)",
    navDoctor: "डॉक्टर कक्ष",
    navAdmin: "प्रबंधन व आँकड़े",
    navTv: "प्रतीक्षा टीवी डिस्प्ले",
    navMessages: "व्हाट्सएप संदेश",
    
    // Patient Portal
    bookTitle: "क्लिनिक अपॉइंटमेंट बुक करें",
    bookSubtitle: "क्लिनिक में घंटों इंतज़ार से बचें। घर बैठे ऑनलाइन स्लॉट बुक करें और लाइव टोकन ट्रैक करें।",
    stepPatientType: "1. परामर्श का प्रकार",
    stepSelectSlot: "2. तारीख एवं समय स्लॉट",
    stepPatientDetails: "3. मरीज़ का विवरण",
    stepConfirm: "4. पुष्टि",
    
    typeNew: "नया मरीज़ (पहली बार)",
    typeNewDesc: "विस्तृत 20 मिनट परामर्श व मेडिकल इतिहास जांच",
    typeFollowUp: "पुराना मरीज़ (फॉलो-अप)",
    typeFollowUpDesc: "10 मिनट नियमित फॉलो-अप, दवा नवीनीकरण या रिपोर्ट जांच",
    typeProcedure: "विशेष प्रक्रिया / स्क्रीनिंग",
    typeProcedureDesc: "ईसीजी, हृदय परीक्षण, नियमित जांच (30 मिनट)",

    dateLabel: "तारीख चुनें",
    slotLabel: "उपलब्ध खुले स्लॉट",
    noDoubleBooking: "गारंटी: कोई दोहरा बुकिंग नहीं होगी। केवल उपलब्ध स्लॉट।",
    fullName: "मरीज़ का पूरा नाम",
    phoneLabel: "व्हाट्सएप / मोबाइल नंबर",
    ageLabel: "उम्र",
    genderLabel: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    symptomsLabel: "तकलीफ / आने का मुख्य कारण",
    bookButton: "अपॉइंटमेंट बुक करें और टोकन प्राप्त करें",
    
    // Live Tracker
    trackTitle: "लाइव कतार ट्रैकर (Live Queue)",
    trackSubtitle: "घर से निकलने से पहले अपनी कतार स्थिति देखें ताकि क्लिनिक में इंतज़ार न करना पड़े।",
    enterTokenPlaceholder: "टोकन नंबर दर्ज करें (उदा. A-04) या फ़ोन नंबर...",
    trackBtn: "देखें",
    nowServing: "वर्तमान में डॉक्टर के साथ",
    yourToken: "आपका टोकन",
    peopleAhead: "आपसे आगे कुल मरीज़",
    estimatedWait: "अनुमानित प्रतीक्षा समय",
    suggestedArrival: "सुझाया गया पहुंचने का समय",
    arrivalNotice: "कृपया इस समय सीमा में पहुंचे ताकि बाहर इंतज़ार न करना पड़े।",
    statusWaiting: "घर पर / रास्ते में",
    statusArrived: "क्लिनिक पहुंच चुके हैं",
    statusConsulting: "परामर्श कक्ष में हैं",
    statusCompleted: "परामर्श संपन्न हुआ",
    emergencyCancelBtn: "आपातकालीन स्थिति? रद्द / बदलें",
    
    // Walk-in
    walkInTitle: "त्वरित वॉक-इन पंजीकरण",
    walkInSubtitle: "रिसेप्शन से 30 सेकंड में वॉक-इन मरीज़ को कतार में जोड़ें और स्वचालित टोकन दें।",
    quickAddBtn: "लाइव कतार में जोड़ें",
    
    // Queue Controls
    markArrived: "उपस्थित दर्ज करें",
    startConsult: "परामर्श शुरू करें",
    completeConsult: "संपन्न व अगला टोकन",
    skipToken: "छोड़ें (Skip)",
    recallToken: "पुनः बुलाएं",
    cancelBooking: "रद्द करें",
    addDelayBtn: "विलंब जोड़ें (+15 मिनट)",
    
    // Doctor Room
    docRoomTitle: "डॉक्टर परामर्श कक्ष",
    docSubtitle: "लाइव कतार, मरीज़ का पिछला रिकॉर्ड और क्लिनिकल विवरण।",
    patientInRoom: "कक्ष में उपस्थित मरीज़",
    elapsedTime: "परामर्श का समय",
    medicalHistory: "पिछला मेडिकल इतिहास",
    allergies: "एलर्जी विवरण",
    doctorNotesPlaceholder: "डॉक्टर का मूल्यांकन, लक्षण, जांच निष्कर्ष...",
    diagnosisPlaceholder: "रोग का निदान (Diagnosis)...",
    prescriptionPlaceholder: "दवाएं, खुराक और निर्देश (Prescription)...",
    followUpInLabel: "अगला फॉलो-अप कब:",
    
    // TV Display
    tvNowServing: "वर्तमान टोकन",
    tvRoom: "परामर्श कक्ष 1",
    tvDoctor: "डॉ. अरविंद शर्मा",
    tvNextUp: "अगला मरीज़",
    tvEstimatedWait: "अनुमानित प्रतीक्षा",
    tvSoundNotice: "ध्वनि घोषणा सक्रिय करने के लिए स्क्रीन पर कहीं भी क्लिक करें",
    
    // Analytics
    analyticsTitle: "क्लिनिक प्रदर्शन व आंकड़े",
    monthlyAppointments: "कुल अपॉइंटमेंट",
    noShowRate: "अनुपस्थिति दर (No-Show)",
    sourceBreakdown: "ऑनलाइन बनाम वॉक-इन",
    avgWaitTime: "औसत प्रतीक्षा समय",
    avgConsultTime: "औसत परामर्श समय",
    newVsReturning: "नए बनाम पुराने मरीज़",
    busiestHours: "व्यस्ततम समय एवं स्लॉट",
    
    // Follow-ups
    followUpTitle: "फॉलो-अप प्रबंधन व मरीज़ जुड़ाव",
    followUpSubtitle: "प्रत्येक मरीज़ के लिए समय पर फॉलो-अप सुनिश्चित करें।",
    priorityHot: "अति आवश्यक (Hot)",
    priorityWarm: "सामान्य (Warm)",
    priorityCold: "न्यूनतम (Cold)",
    contactViaWa: "व्हाट्सएप पर संपर्क करें"
  }
};

// CALENZO - Clinic Appointment & Queue Management System
// Client-side Application Controller & Reactive Engine

let currentLang = 'en';
let activeRole = 'patient';
let clinicData = null;
let liveQueueData = null;
let allAppointments = [];
let allPatients = [];
let allFollowups = [];
let allNotifications = [];
let consultTimerInterval = null;
let consultElapsedSeconds = 0;
let userAudioAllowed = false;

// Audio Chime using Web Audio API
function playHospitalChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // First tone (C5 - 523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.8);

    // Second tone (E5 - 659.25 Hz) after 250ms
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain2.gain.setValueAtTime(0.2, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 1.2);
    }, 250);
  } catch (e) {
    console.log("Audio chime error:", e);
  }
}

// Text-to-speech announcement
function speakAnnouncement(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.log("TTS error:", e);
  }
}

// API Fetcher with Fallback
async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(endpoint, options);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}, using localStorage fallback`, err);
    return getLocalFallback(endpoint, method, body);
  }
}

// LocalStorage Fallback if backend server is offline or opened via file://
function getLocalFallback(endpoint, method, body) {
  // Simple in-memory / local storage handler
  if (endpoint.includes('/api/clinic')) {
    let c = localStorage.getItem('calenzo_clinic');
    if (!c) {
      c = JSON.stringify({
        clinicName: "Calenzo Care Clinic & Specialty Center",
        doctorName: "Dr. Arvind Sharma",
        currentDelayMinutes: 0
      });
      localStorage.setItem('calenzo_clinic', c);
    }
    return JSON.parse(c);
  }
  return {};
}

// Language Switcher
function setLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  
  // Update static text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (I18N[lang] && I18N[lang][key]) {
      el.textContent = I18N[lang][key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (I18N[lang] && I18N[lang][key]) {
      el.placeholder = I18N[lang][key];
    }
  });
}

// Role Navigation
function switchRole(role) {
  activeRole = role;
  document.querySelectorAll('.role-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.role === role);
  });
  document.querySelectorAll('.view-section').forEach(s => {
    s.classList.toggle('active', s.id === `view-${role}`);
  });

  if (role === 'doctor') {
    startConsultTimer();
  }
  refreshAllData();
}

// Refresh all views
async function refreshAllData() {
  await Promise.all([
    loadClinicData(),
    loadLiveQueue(),
    loadAppointments(),
    loadPatients(),
    loadFollowups(),
    loadNotifications(),
    loadAnalytics()
  ]);
}

// Load Clinic
async function loadClinicData() {
  clinicData = await apiCall('/api/clinic');
  if (!clinicData) return;

  document.querySelectorAll('.clinic-name-text').forEach(el => el.textContent = clinicData.clinicName);
  document.querySelectorAll('.doctor-name-text').forEach(el => el.textContent = clinicData.doctorName);
  
  const delayAlert = document.getElementById('clinic-delay-banner');
  if (delayAlert) {
    if (clinicData.currentDelayMinutes > 0) {
      delayAlert.style.display = 'flex';
      document.getElementById('delay-mins-text').textContent = clinicData.currentDelayMinutes;
    } else {
      delayAlert.style.display = 'none';
    }
  }

  // Populate settings form
  const setClinicName = document.getElementById('setting-clinic-name');
  if (setClinicName) {
    setClinicName.value = clinicData.clinicName || '';
    document.getElementById('setting-doctor-name').value = clinicData.doctorName || '';
    document.getElementById('setting-specialization').value = clinicData.specialization || '';
    document.getElementById('setting-phone').value = clinicData.phone || '';
    document.getElementById('setting-whatsapp').value = clinicData.whatsappNumber || '';
    document.getElementById('setting-address').value = clinicData.address || '';
    document.getElementById('setting-open-time').value = clinicData.openingHours?.start || '09:00';
    document.getElementById('setting-close-time').value = clinicData.openingHours?.end || '18:00';
    document.getElementById('setting-duration-new').value = clinicData.durations?.new || 20;
    document.getElementById('setting-duration-followup').value = clinicData.durations?.follow_up || 10;
  }
}

// Load Live Queue
async function loadLiveQueue() {
  liveQueueData = await apiCall('/api/queue/live');
  if (!liveQueueData) return;

  // Update Badges
  const waitingBadge = document.getElementById('badge-waiting-count');
  if (waitingBadge) waitingBadge.textContent = (liveQueueData.arrivedCount + liveQueueData.waitingCount);

  // Render TV View
  renderTvDisplay();

  // Render Doctor Panel
  renderDoctorPanel();

  // Render Receptionist Queue
  renderReceptionistQueue();

  // Render Patient Tracker (if token is selected)
  renderPatientTracker();
}

// Render TV Display
function renderTvDisplay() {
  const current = liveQueueData.currentInConsultation;
  const bigTokenEl = document.getElementById('tv-serving-token');
  const patientNameEl = document.getElementById('tv-serving-patient');

  if (current) {
    bigTokenEl.textContent = current.tokenNumber;
    patientNameEl.textContent = current.patientName;
  } else {
    bigTokenEl.textContent = "--";
    patientNameEl.textContent = "Waiting for Next Patient";
  }

  const upcomingListEl = document.getElementById('tv-upcoming-list');
  if (!upcomingListEl) return;
  upcomingListEl.innerHTML = '';

  const queue = liveQueueData.activeQueue || [];
  if (queue.length === 0) {
    upcomingListEl.innerHTML = `<div style="padding: 20px; color: #9CA3AF; text-align: center;">Queue is currently empty</div>`;
    return;
  }

  queue.slice(0, 4).forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'tv-upcoming-item';
    div.innerHTML = `
      <div>
        <span class="tv-upcoming-token">${item.tokenNumber}</span>
        <div class="tv-upcoming-name">${item.patientName} (${item.type === 'new' ? 'New' : 'Follow-up'})</div>
      </div>
      <div style="text-align: right;">
        <span class="badge ${item.status === 'arrived' ? 'badge-arrived' : 'badge-waiting'}">${item.status}</span>
        <div class="tv-upcoming-wait">~${item.dynamicWaitMinutes}m wait</div>
      </div>
    `;
    upcomingListEl.appendChild(div);
  });
}

// Render Doctor Consultation Panel
function renderDoctorPanel() {
  const current = liveQueueData.currentInConsultation;
  const docCurrentCard = document.getElementById('doc-current-patient-card');
  const docEmptyNotice = document.getElementById('doc-no-patient-notice');
  const nextInLineStrip = document.getElementById('doc-next-queue-strip');

  if (current) {
    if (docCurrentCard) docCurrentCard.style.display = 'block';
    if (docEmptyNotice) docEmptyNotice.style.display = 'none';

    document.getElementById('doc-patient-token').textContent = current.tokenNumber;
    document.getElementById('doc-patient-name').textContent = current.patientName;
    document.getElementById('doc-patient-meta').textContent = `${current.patientAge || 30} yrs, ${current.patientGender || 'Male'} • ${current.patientPhone}`;
    document.getElementById('doc-patient-type').textContent = current.type === 'new' ? 'First-Time Consultation' : 'Routine Follow-up';
    document.getElementById('doc-patient-service').textContent = current.serviceName || 'General Consultation';
    
    // Look up medical history from patients list
    const patientObj = allPatients.find(p => p.id === current.patientId || p.phone === current.patientPhone);
    const histEl = document.getElementById('doc-patient-history');
    if (histEl) {
      histEl.textContent = (patientObj && patientObj.medicalHistory) ? patientObj.medicalHistory : "No previous chronic conditions recorded.";
    }
    const allergyEl = document.getElementById('doc-patient-allergies');
    if (allergyEl) {
      allergyEl.textContent = (patientObj && patientObj.allergies) ? patientObj.allergies : "None known";
    }
    const notesEl = document.getElementById('doc-patient-prev-notes');
    if (notesEl) {
      notesEl.textContent = (patientObj && patientObj.internalNotes) ? patientObj.internalNotes : "No internal notes.";
    }
  } else {
    if (docCurrentCard) docCurrentCard.style.display = 'none';
    if (docEmptyNotice) docEmptyNotice.style.display = 'block';
  }

  // Next in line queue strip
  if (nextInLineStrip) {
    nextInLineStrip.innerHTML = '';
    const upcoming = liveQueueData.activeQueue || [];
    if (upcoming.length === 0) {
      nextInLineStrip.innerHTML = `<div style="color: var(--text-muted); font-size: 13px;">No patients waiting in queue.</div>`;
    } else {
      upcoming.forEach(item => {
        const chip = document.createElement('div');
        chip.style.cssText = "display: flex; align-items: center; gap: 8px; background: #F1F5F9; padding: 6px 12px; border-radius: 8px; font-size: 13px;";
        chip.innerHTML = `
          <strong>${item.tokenNumber}</strong>
          <span>${item.patientName}</span>
          <span class="badge ${item.status === 'arrived' ? 'badge-arrived' : 'badge-waiting'}">${item.status}</span>
          <button class="btn btn-primary btn-sm" onclick="triggerQueueAction('start', '${item.id}')">Call In</button>
        `;
        nextInLineStrip.appendChild(chip);
      });
    }
  }
}

// Render Receptionist Front Desk Queue Table
function renderReceptionistQueue() {
  const tbody = document.getElementById('reception-queue-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const active = liveQueueData.activeQueue || [];
  const current = liveQueueData.currentInConsultation;

  const allDisplay = [];
  if (current) allDisplay.push(current);
  allDisplay.push(...active);

  if (allDisplay.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No patients in today's active queue. Add a walk-in patient above or book online.</td></tr>`;
    return;
  }

  allDisplay.forEach((item, index) => {
    const isConsulting = item.status === 'in_consultation';
    const tr = document.createElement('tr');
    tr.style.backgroundColor = isConsulting ? '#FAF5FF' : 'transparent';
    
    // Status Badge
    let badgeClass = 'badge-waiting';
    if (item.status === 'arrived') badgeClass = 'badge-arrived';
    if (item.status === 'in_consultation') badgeClass = 'badge-consulting';
    if (item.status === 'skipped') badgeClass = 'badge-skipped';

    // Action buttons based on status
    let actionButtons = '';
    if (item.status === 'waiting') {
      actionButtons = `
        <button class="btn btn-success btn-sm" onclick="triggerQueueAction('arrived', '${item.id}')" title="Mark patient as reached clinic">Arrived</button>
        <button class="btn btn-primary btn-sm" onclick="triggerQueueAction('start', '${item.id}')" title="Send into Doctor's Room">Start</button>
        <button class="btn btn-secondary btn-sm" onclick="triggerQueueAction('skip', '${item.id}')">Skip</button>
        <button class="btn btn-danger btn-sm" onclick="promptCancelAppointment('${item.id}', '${item.tokenNumber}')">Cancel</button>
      `;
    } else if (item.status === 'arrived') {
      actionButtons = `
        <button class="btn btn-primary btn-sm" onclick="triggerQueueAction('start', '${item.id}')">Start Consult</button>
        <button class="btn btn-secondary btn-sm" onclick="triggerQueueAction('skip', '${item.id}')">Skip</button>
        <button class="btn btn-danger btn-sm" onclick="promptCancelAppointment('${item.id}', '${item.tokenNumber}')">Cancel</button>
      `;
    } else if (item.status === 'in_consultation') {
      actionButtons = `
        <button class="btn btn-success btn-sm" onclick="switchRole('doctor')">View in Room</button>
        <button class="btn btn-secondary btn-sm" onclick="triggerQueueAction('complete', '${item.id}')">Complete</button>
      `;
    }

    // Direct WhatsApp action link
    const cleanPhone = (item.patientPhone || '').replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Namaste ${item.patientName} ji. Update regarding your token ${item.tokenNumber} at ${clinicData?.clinicName || 'Calenzo Clinic'}: Your estimated wait time is approx ${item.dynamicWaitMinutes || 10} minutes. Track live queue: http://localhost:5000/?token=${item.tokenNumber}`);
    const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

    tr.innerHTML = `
      <td><span class="token-box">${item.tokenNumber}</span></td>
      <td>
        <strong>${item.patientName}</strong>
        <div style="font-size: 11px; color: var(--text-muted);">${item.patientPhone} • ${item.source === 'walk_in' ? 'Walk-In' : 'Online'}</div>
      </td>
      <td>
        <div>${item.serviceName || 'Consultation'}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${item.type === 'new' ? 'New' : 'Follow-up'} (~${item.estimatedDuration}m)</div>
      </td>
      <td>
        <strong>${item.timeSlot}</strong>
        <div style="font-size: 11px; color: var(--text-muted);">${item.suggestedArrivalWindow || '10m prior'}</div>
      </td>
      <td>
        <span class="badge ${badgeClass}">${item.status.replace('_', ' ')}</span>
        ${item.dynamicWaitMinutes ? `<div style="font-size: 11px; color: var(--accent); margin-top: 2px;">~${item.dynamicWaitMinutes}m wait</div>` : ''}
      </td>
      <td>
        <a href="${waUrl}" target="_blank" class="btn btn-wa btn-sm" title="Send WhatsApp Message">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.129-.536-1.574-.654-2.579-2.261-2.658-2.366-.079-.105-.636-.848-.636-1.616 0-.767.404-1.144.548-1.302.144-.158.317-.198.423-.198.106 0 .211.001.304.006.098.005.23-.037.36.275.144.348.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.186-.173.287l-.26.305c-.087.102-.178.212-.077.385.102.173.454.749.974 1.213.669.596 1.233.78 1.406.867.173.087.274.073.376-.044.101-.116.433-.505.549-.679.116-.173.231-.144.389-.087s1.009.476 1.182.563c.173.087.288.13.332.203.043.072.043.419-.101.824z"/></svg>
          WhatsApp
        </a>
      </td>
      <td>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          ${actionButtons}
        </div>
      </td>
    </tr>
  `;
  tbody.appendChild(tr);
  });
}

// Render Patient Tracker View
let trackedToken = null;
function setTrackedToken(token) {
  trackedToken = token;
  renderPatientTracker();
}

function renderPatientTracker() {
  const tokenQuery = new URLSearchParams(window.location.search).get('token');
  const tokenToUse = trackedToken || tokenQuery || 'A-04';

  const tokenInput = document.getElementById('tracker-search-input');
  if (tokenInput && !tokenInput.value) tokenInput.value = tokenToUse;

  if (!liveQueueData) return;

  const currentServing = liveQueueData.currentInConsultation;
  const currentTokenEl = document.getElementById('tracker-now-serving');
  if (currentTokenEl) {
    currentTokenEl.textContent = currentServing ? currentServing.tokenNumber : "None";
  }

  // Find target appointment
  const queue = liveQueueData.activeQueue || [];
  let found = queue.find(q => q.tokenNumber.toUpperCase() === tokenToUse.toUpperCase());
  
  // If not in active queue, check in allAppointments
  if (!found) {
    found = allAppointments.find(a => a.tokenNumber.toUpperCase() === tokenToUse.toUpperCase());
  }

  const trackerResultCard = document.getElementById('patient-live-card');
  if (!found || !trackerResultCard) return;

  trackerResultCard.style.display = 'block';

  document.getElementById('tracker-your-token').textContent = found.tokenNumber;
  document.getElementById('tracker-patient-name').textContent = found.patientName;
  document.getElementById('tracker-service-name').textContent = found.serviceName || 'General Consultation';
  document.getElementById('tracker-arrival-window').textContent = found.suggestedArrivalWindow || '10 mins prior';

  // Calculate people ahead & estimated wait
  let aheadCount = 0;
  let waitMins = 0;

  if (currentServing && currentServing.tokenNumber === found.tokenNumber) {
    aheadCount = 0;
    waitMins = 0;
    document.getElementById('tracker-status-text').textContent = "You are currently in consultation with Dr. Arvind Sharma.";
  } else if (found.status === 'completed') {
    aheadCount = 0;
    waitMins = 0;
    document.getElementById('tracker-status-text').textContent = "Consultation completed. Thank you for visiting!";
  } else {
    // Find index in activeQueue
    const qIndex = queue.findIndex(q => q.tokenNumber === found.tokenNumber);
    if (qIndex >= 0) {
      aheadCount = qIndex;
      waitMins = queue[qIndex].dynamicWaitMinutes || 15;
    } else {
      aheadCount = 1;
      waitMins = 20;
    }
    document.getElementById('tracker-status-text').textContent = `Your position is #${aheadCount + 1} in queue. Please arrive during your suggested arrival window.`;
  }

  document.getElementById('tracker-ahead-count').textContent = aheadCount;
  document.getElementById('tracker-wait-mins').textContent = `~${waitMins}m`;

  // Update visual timeline
  const stepWaiting = document.getElementById('step-waiting');
  const stepArrived = document.getElementById('step-arrived');
  const stepConsulting = document.getElementById('step-consulting');
  const stepCompleted = document.getElementById('step-completed');

  [stepWaiting, stepArrived, stepConsulting, stepCompleted].forEach(s => {
    if (s) { s.classList.remove('active'); s.classList.remove('completed'); }
  });

  if (found.status === 'waiting') {
    if (stepWaiting) stepWaiting.classList.add('active');
  } else if (found.status === 'arrived') {
    if (stepWaiting) stepWaiting.classList.add('completed');
    if (stepArrived) stepArrived.classList.add('active');
  } else if (found.status === 'in_consultation') {
    if (stepWaiting) stepWaiting.classList.add('completed');
    if (stepArrived) stepArrived.classList.add('completed');
    if (stepConsulting) stepConsulting.classList.add('active');
  } else if (found.status === 'completed') {
    if (stepWaiting) stepWaiting.classList.add('completed');
    if (stepArrived) stepArrived.classList.add('completed');
    if (stepConsulting) stepConsulting.classList.add('completed');
    if (stepCompleted) stepCompleted.classList.add('active');
  }

  // Attach token for emergency cancellation button
  const cancelBtn = document.getElementById('btn-emergency-cancel');
  if (cancelBtn) {
    cancelBtn.onclick = () => promptEmergencyCancellation(found);
  }
}

// Prompt Emergency Cancellation Modal (Page 4 specifications)
function promptEmergencyCancellation(appointment) {
  const modal = document.getElementById('modal-emergency-cancel');
  if (!modal) return;
  modal.classList.add('active');

  document.getElementById('cancel-token-display').textContent = appointment.tokenNumber;
  document.getElementById('cancel-name-display').textContent = appointment.patientName;

  document.getElementById('btn-confirm-emergency-cancel').onclick = async () => {
    const reason = document.getElementById('cancel-reason-select').value;
    const resolution = document.querySelector('input[name="cancel-resolution"]:checked').value;

    const res = await apiCall('/api/appointments/emergency-cancel', 'POST', {
      appointmentId: appointment.id,
      reason,
      resolution
    });

    modal.classList.remove('active');
    alert(`Emergency cancellation processed: ${res.resolution || 'Success'}. Downstream wait times modified!`);
    await refreshAllData();
  };
}

// Queue Actions (Arrived, Start, Complete, Skip, Recall, Cancel, Delay)
async function triggerQueueAction(action, appointmentId, extraPayload = {}) {
  const payload = { action, appointmentId, ...extraPayload };
  const res = await apiCall('/api/queue/action', 'POST', payload);
  if (res.success) {
    if (action === 'start') {
      playHospitalChime();
      const apt = (liveQueueData.activeQueue || []).find(a => a.id === appointmentId);
      if (apt) {
        speakAnnouncement(`Token ${apt.tokenNumber}, please proceed to Consultation Room 1`);
      }
    }
    await refreshAllData();
  }
}

// Prompt Receptionist Cancellation
async function promptCancelAppointment(id, token) {
  if (confirm(`Are you sure you want to cancel Token ${token}? Subsequent queue timings will be recalculated automatically.`)) {
    await triggerQueueAction('cancel', id);
  }
}

// Add Clinic Delay (+15 mins)
async function addClinicDelay(minutes = 15) {
  const res = await apiCall('/api/queue/action', 'POST', {
    action: 'delay',
    delayMinutes: minutes
  });
  if (res.success) {
    alert(`Broadcasted +${minutes} minutes delay notice to all waiting patients via WhatsApp.`);
    await refreshAllData();
  }
}

// Consultation Timer (Doctor Room)
function startConsultTimer() {
  if (consultTimerInterval) clearInterval(consultTimerInterval);
  consultElapsedSeconds = 0;
  const timerEl = document.getElementById('consult-live-timer');
  if (!timerEl) return;

  consultTimerInterval = setInterval(() => {
    consultElapsedSeconds++;
    const mins = Math.floor(consultElapsedSeconds / 60);
    const secs = consultElapsedSeconds % 60;
    timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    // Warning styling if over 20 minutes
    if (mins >= 20) {
      timerEl.className = 'consultation-timer danger';
    } else if (mins >= 15) {
      timerEl.className = 'consultation-timer warning';
    } else {
      timerEl.className = 'consultation-timer';
    }
  }, 1000);
}

// Doctor Completes Consultation & Calls Next
async function doctorCompleteConsultation() {
  const current = liveQueueData?.currentInConsultation;
  if (!current) return;

  const notes = document.getElementById('doc-input-notes')?.value || '';
  const diagnosis = document.getElementById('doc-input-diagnosis')?.value || '';
  const rx = document.getElementById('doc-input-rx')?.value || '';
  const followDays = parseInt(document.getElementById('doc-select-followup')?.value || '7', 10);

  await triggerQueueAction('complete', current.id, {
    doctorNotes: notes,
    diagnosis,
    prescriptionSummary: rx,
    followUpRecommendedDays: followDays,
    actualDuration: Math.max(5, Math.round(consultElapsedSeconds / 60))
  });

  // Clear inputs
  if (document.getElementById('doc-input-notes')) document.getElementById('doc-input-notes').value = '';
  if (document.getElementById('doc-input-diagnosis')) document.getElementById('doc-input-diagnosis').value = '';
  if (document.getElementById('doc-input-rx')) document.getElementById('doc-input-rx').value = '';

  // Auto-call next patient if waiting
  const next = (liveQueueData.activeQueue || [])[0];
  if (next) {
    await triggerQueueAction('start', next.id);
  } else {
    alert("Consultation complete. No more patients waiting in queue.");
  }
}

// Load Appointments
async function loadAppointments() {
  allAppointments = await apiCall('/api/appointments');
}

// Load Patients
async function loadPatients() {
  allPatients = await apiCall('/api/patients');
  renderPatientDatabase(allPatients);
}

// Render Patient Database Table
function renderPatientDatabase(patients) {
  const tbody = document.getElementById('patients-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (patients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No patients found matching search.</td></tr>`;
    return;
  }

  patients.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.id}</strong></td>
      <td>
        <strong>${p.name}</strong>
        <div style="font-size: 11px; color: var(--text-muted);">${p.gender}, ${p.age} yrs</div>
      </td>
      <td>${p.phone}</td>
      <td>
        <span class="badge badge-waiting">${p.totalVisits} visits</span>
        ${p.noShowCount > 0 ? `<span class="badge badge-skipped" style="margin-left: 4px;">${p.noShowCount} No-show</span>` : ''}
      </td>
      <td>
        <div style="font-size: 12px; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${p.medicalHistory || 'None'}
        </div>
      </td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="viewPatientProfile('${p.id}')">View History</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// View Patient Profile Modal
function viewPatientProfile(patientId) {
  const p = allPatients.find(item => item.id === patientId);
  if (!p) return;
  
  const modal = document.getElementById('modal-patient-history');
  if (!modal) return;
  modal.classList.add('active');

  document.getElementById('modal-p-name').textContent = p.name;
  document.getElementById('modal-p-id').textContent = p.id;
  document.getElementById('modal-p-phone').textContent = p.phone;
  document.getElementById('modal-p-age-gender').textContent = `${p.age} yrs, ${p.gender}`;
  document.getElementById('modal-p-emergency').textContent = p.emergencyContact || 'Not specified';
  document.getElementById('modal-p-address').textContent = p.address || 'Local';
  document.getElementById('modal-p-visits').textContent = p.totalVisits || 1;
  document.getElementById('modal-p-noshows').textContent = p.noShowCount || 0;
  document.getElementById('modal-p-history').textContent = p.medicalHistory || 'No previous history';
  document.getElementById('modal-p-allergies').textContent = p.allergies || 'None';
  document.getElementById('modal-p-notes').textContent = p.internalNotes || 'None';

  // Render past appointment records
  const pastList = allAppointments.filter(a => a.patientId === p.id || a.patientPhone === p.phone);
  const apptListEl = document.getElementById('modal-p-past-appts');
  apptListEl.innerHTML = '';
  if (pastList.length === 0) {
    apptListEl.innerHTML = `<div style="color: var(--text-muted); font-size: 12px;">No past appointment records.</div>`;
  } else {
    pastList.forEach(item => {
      const div = document.createElement('div');
      div.style.cssText = "border-bottom: 1px solid #F1F5F9; padding: 8px 0; font-size: 12px;";
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between;">
          <strong>${item.date} • ${item.serviceName}</strong>
          <span class="badge ${item.status === 'completed' ? 'badge-completed' : 'badge-skipped'}">${item.status}</span>
        </div>
        ${item.doctorNotes ? `<div style="color: var(--text-muted); margin-top: 2px;">Notes: ${item.doctorNotes}</div>` : ''}
        ${item.prescriptionSummary ? `<div style="color: var(--accent); margin-top: 2px;">Rx: ${item.prescriptionSummary}</div>` : ''}
      `;
      apptListEl.appendChild(div);
    });
  }
}

// Export Patients Data to CSV (Page 8 FAQ requirement)
function exportPatientsToCSV() {
  if (!allPatients || allPatients.length === 0) {
    alert("No patients to export.");
    return;
  }
  const headers = ["Patient ID", "Name", "Age", "Gender", "Phone", "Email", "Total Visits", "No Show Count", "Medical History", "Allergies", "Notes"];
  const rows = allPatients.map(p => [
    p.id,
    `"${p.name}"`,
    p.age,
    p.gender,
    `"${p.phone}"`,
    `"${p.email || ''}"`,
    p.totalVisits,
    p.noShowCount,
    `"${(p.medicalHistory || '').replace(/"/g, '""')}"`,
    `"${(p.allergies || '').replace(/"/g, '""')}"`,
    `"${(p.internalNotes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `calenzo_patients_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Load Followups CRM (Feature 6)
async function loadFollowups() {
  allFollowups = await apiCall('/api/followups');
  renderFollowupsCRM(allFollowups);
}

function renderFollowupsCRM(followups) {
  const container = document.getElementById('followups-list');
  if (!container) return;
  container.innerHTML = '';

  if (followups.length === 0) {
    container.innerHTML = `<div style="padding: 20px; color: var(--text-muted); text-align: center;">No follow-up tasks currently pending.</div>`;
    return;
  }

  followups.forEach(fu => {
    let priorityBadge = 'badge-cold';
    if (fu.priority === 'Hot') priorityBadge = 'badge-hot';
    if (fu.priority === 'Warm') priorityBadge = 'badge-warm';

    const card = document.createElement('div');
    card.className = 'card';
    card.style.marginBottom = '12px';
    card.style.padding = '16px';

    const cleanPhone = (fu.phone || '').replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Namaste ${fu.patientName} ji. This is a gentle follow-up reminder from Calenzo Care Clinic. Your recommended checkup is due on ${fu.dueDate} (${fu.reason}). You can book your slot directly here: http://localhost:5000/`);
    const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <div>
          <span class="badge ${priorityBadge}">${fu.priority}</span>
          <strong style="margin-left: 8px; font-size: 15px;">${fu.patientName}</strong>
          <span style="font-size: 13px; color: var(--text-muted); margin-left: 6px;">(${fu.phone})</span>
          <div style="font-size: 13px; color: var(--text-main); margin-top: 6px;">${fu.reason}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Due Date: <strong>${fu.dueDate}</strong> • Status: <strong>${fu.status}</strong></div>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <a href="${waUrl}" target="_blank" class="btn btn-wa btn-sm" onclick="markFollowUpAction('${fu.id}', 'contacted')">WhatsApp Reminder</a>
          <button class="btn btn-success btn-sm" onclick="markFollowUpAction('${fu.id}', 'completed')">Completed</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

async function markFollowUpAction(id, action) {
  await apiCall('/api/followups/action', 'POST', { id, action });
  await loadFollowups();
}

// Load Notifications & WhatsApp Logs (Feature 5)
async function loadNotifications() {
  allNotifications = await apiCall('/api/notifications');
  renderNotificationsLog(allNotifications);
}

function renderNotificationsLog(notifications) {
  const container = document.getElementById('notifications-timeline');
  if (!container) return;
  container.innerHTML = '';

  if (notifications.length === 0) {
    container.innerHTML = `<div style="padding: 20px; color: var(--text-muted); text-align: center;">No messages logged yet.</div>`;
    return;
  }

  notifications.slice(0, 15).forEach(n => {
    const timeFormatted = new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.style.cssText = "display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px;";
    
    div.innerHTML = `
      <div style="min-width: 70px; color: var(--text-muted); font-size: 11px;">${timeFormatted}</div>
      <div style="flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>${n.recipientName} (${n.recipientPhone})</strong>
          <span class="badge badge-arrived">${n.status || 'Delivered'}</span>
        </div>
        <div class="wa-message-bubble outbound" style="margin-top: 6px; max-width: 100%;">
          ${n.message.replace(/\*(.*?)\*/g, '<strong>$1</strong>')}
          <div class="wa-timestamp">✓✓ ${timeFormatted}</div>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

// Load Analytics (Feature 8)
async function loadAnalytics() {
  const data = await apiCall('/api/analytics');
  if (!data) return;

  document.getElementById('metric-total-appts').textContent = data.totals.totalAppointments || 0;
  document.getElementById('metric-completed').textContent = data.totals.completed || 0;
  document.getElementById('metric-noshow-rate').textContent = `${data.noShowRate || 0}%`;
  document.getElementById('metric-avg-wait').textContent = `${data.durations.avgWaitMinutes || 14}m`;
  document.getElementById('metric-avg-consult').textContent = `${data.durations.avgConsultMinutes || 18}m`;

  // Source breakdown bar
  const totalSrc = (data.sourceBreakdown.online + data.sourceBreakdown.walkIn) || 1;
  const onlinePct = Math.round((data.sourceBreakdown.online / totalSrc) * 100);
  const walkInPct = 100 - onlinePct;

  const barOnline = document.getElementById('bar-online');
  const barWalkin = document.getElementById('bar-walkin');
  if (barOnline && barWalkin) {
    barOnline.style.width = `${onlinePct}%`;
    barWalkin.style.width = `${walkInPct}%`;
    document.getElementById('pct-online-text').textContent = `Online: ${onlinePct}% (${data.sourceBreakdown.online})`;
    document.getElementById('pct-walkin-text').textContent = `Walk-in: ${walkInPct}% (${data.sourceBreakdown.walkIn})`;
  }
}

// Handle Online Booking Form Submission
async function handleBookingSubmit(event) {
  event.preventDefault();
  const type = document.querySelector('.type-card.selected')?.dataset.type || 'new';
  const date = document.getElementById('booking-date').value;
  const timeSlot = document.querySelector('.slot-btn.selected')?.dataset.slot || '10:00 AM';
  const name = document.getElementById('booking-name').value.trim();
  const phone = document.getElementById('booking-phone').value.trim();
  const age = document.getElementById('booking-age').value.trim();
  const gender = document.getElementById('booking-gender').value;
  const notes = document.getElementById('booking-notes').value.trim();

  if (!name || !phone) {
    alert("Please enter patient name and mobile number.");
    return;
  }

  const payload = {
    type,
    date,
    timeSlot,
    name,
    phone,
    age,
    gender,
    notes,
    source: 'online'
  };

  const res = await apiCall('/api/appointments/book', 'POST', payload);
  if (res.success) {
    // Show confirmation modal
    showBookingConfirmation(res);
    await refreshAllData();
  } else {
    alert("Booking failed. Please try again.");
  }
}

// Handle 30-Second Walk-in Form Submission (Receptionist)
async function handleWalkinSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('walkin-name').value.trim();
  const phone = document.getElementById('walkin-phone').value.trim();
  const age = document.getElementById('walkin-age').value.trim();
  const gender = document.getElementById('walkin-gender').value;
  const type = document.getElementById('walkin-type').value;
  const serviceName = document.getElementById('walkin-service').value;

  if (!name || !phone) {
    alert("Please provide patient name and phone number.");
    return;
  }

  const payload = {
    name,
    phone,
    age,
    gender,
    type,
    serviceName,
    source: 'walk_in',
    date: new Date().toISOString().slice(0, 10)
  };

  const res = await apiCall('/api/appointments/book', 'POST', payload);
  if (res.success) {
    alert(`Token ${res.tokenNumber} issued successfully! Inserted into live queue.`);
    document.getElementById('walkin-name').value = '';
    document.getElementById('walkin-phone').value = '';
    document.getElementById('walkin-age').value = '';
    await refreshAllData();
  }
}

// Show Booking Confirmation Modal
function showBookingConfirmation(result) {
  const modal = document.getElementById('modal-booking-success');
  if (!modal) return;
  modal.classList.add('active');

  const apt = result.appointment;
  document.getElementById('conf-token-number').textContent = apt.tokenNumber;
  document.getElementById('conf-patient-name').textContent = apt.patientName;
  document.getElementById('conf-date-slot').textContent = `${apt.date} at ${apt.timeSlot}`;
  document.getElementById('conf-arrival-window').textContent = apt.suggestedArrivalWindow;
  document.getElementById('conf-wa-message').textContent = result.notification?.message || '';

  // Direct track live button
  document.getElementById('conf-track-btn').onclick = () => {
    modal.classList.remove('active');
    setTrackedToken(apt.tokenNumber);
    document.getElementById('tracker-search-input').value = apt.tokenNumber;
    renderPatientTracker();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };
}

// Initial Setup & DOM Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Set default dates
  const todayStr = new Date().toISOString().slice(0, 10);
  const bookingDateInput = document.getElementById('booking-date');
  if (bookingDateInput) {
    bookingDateInput.value = todayStr;
    bookingDateInput.min = todayStr;
  }

  // Consultation Type card clicks
  document.querySelectorAll('.type-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  // Slot buttons click
  document.querySelectorAll('.slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('booked')) return;
      document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // Role tabs
  document.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', () => switchRole(tab.dataset.role));
  });

  // Forms
  const bookingForm = document.getElementById('patient-booking-form');
  if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);

  const walkinForm = document.getElementById('walkin-quick-form');
  if (walkinForm) walkinForm.addEventListener('submit', handleWalkinSubmit);

  // Search tracker
  const trackerBtn = document.getElementById('tracker-search-btn');
  if (trackerBtn) {
    trackerBtn.addEventListener('click', () => {
      const q = document.getElementById('tracker-search-input').value.trim();
      if (q) setTrackedToken(q);
    });
  }

  // Patient search
  const patientSearchInput = document.getElementById('patient-search-input');
  if (patientSearchInput) {
    patientSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allPatients.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.phone.includes(query) ||
        p.id.toLowerCase().includes(query)
      );
      renderPatientDatabase(filtered);
    });
  }

  // Close modals
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });

  // TV Audio enable click
  const tvView = document.getElementById('view-tv');
  if (tvView) {
    tvView.addEventListener('click', () => {
      userAudioAllowed = true;
      const notice = document.querySelector('.tv-audio-prompt');
      if (notice) notice.style.display = 'none';
    });
  }

  // Live TV clock timer
  setInterval(() => {
    const clockEl = document.getElementById('tv-live-clock');
    if (clockEl) {
      clockEl.textContent = new Date().toLocaleTimeString('en-US', { hour12: true });
    }
  }, 1000);

  // Live Auto Refresh every 6 seconds
  setInterval(() => {
    refreshAllData();
  }, 6000);

  // Initial Load
  refreshAllData();
});

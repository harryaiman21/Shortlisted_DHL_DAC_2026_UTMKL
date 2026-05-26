const { pipeline } = require('@xenova/transformers');

let classifier = null;

async function loadModel() {
  if (!classifier) {
    console.log('Loading AI model...');
    classifier = await pipeline(
      'zero-shot-classification',
      'Xenova/distilbart-mnli-12-3'
    );
    console.log('AI model ready');
  }
  return classifier;
}

// ─────────────────────────────────────────
// DEBUG LOGGER
// Set DEBUG = true to see every calculation
// Set DEBUG = false for clean production logs
// ─────────────────────────────────────────
const DEBUG = true;

function debug(label, data) {
  if (!DEBUG) return;
  console.log('\n' + '─'.repeat(50));
  console.log(`🔍 DEBUG: ${label}`);
  if (typeof data === 'object') {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }
}

function debugStep(step, message) {
  if (!DEBUG) return;
  console.log(`  [STEP ${step}] ${message}`);
}

function debugWinner(category, reason) {
  if (!DEBUG) return;
  console.log(`\n  ✅ WINNER: ${category}`);
  console.log(`  REASON:  ${reason}`);
}

// ─────────────────────────────────────────
// TRIGGER WORD SCORING PER CATEGORY
// ─────────────────────────────────────────
const CATEGORY_TRIGGERS = {
  'Late Delivery': {
    high: [
      'not delivered', 'not arrived', 'still waiting',
      'stuck at hub', 'pending clearance', 'no movement',
      'shipment delayed', 'late delivery', 'expected date',
      'overdue', 'not received', 'where is my parcel',
      'delivery failed', 'missed delivery', 'delayed shipment',
      'belum sampai', 'lambat hantar', 'no delivery attempt',
      'never came', 'still not here', 'past due date',
      'days late', 'weeks late', 'not shown up',
      'nobody came', 'pickup unsuccessful', 'waited'
    ],
    medium: [
      'late', 'delay', 'slow', 'waiting', 'pending',
      'not here', 'not come', 'not yet', 'lambat',
      'when will', 'estimated', 'expected', 'wait'
    ]
  },

  'Damaged Parcel': {
    high: [
      'crushed', 'broken', 'cracked', 'shattered',
      'water damage', 'water leakage', 'wet parcel',
      'torn packaging', 'dented', 'collapsed box',
      'damaged item', 'damaged parcel', 'damaged goods',
      'item broken', 'product damaged', 'box damaged',
      'packaging damaged', 'contents damaged', 'rosak',
      'pecah', 'kemek', 'inside damaged',
      'not working after delivery', 'water marks',
      'dents on', 'condition of parcel', 'arrived broken',
      'received damaged', 'parcel destroyed', 'torn open',
      'signs of tampering', 'resealed', 'opened parcel'
    ],
    medium: [
      'damage', 'broken', 'smashed', 'bent', 'scratched',
      'open box', 'repackaged', 'taped', 'condition',
      'unacceptable condition', 'not working', 'malfunction',
      'photo of damage', 'images attached', 'picture enclosed'
    ]
  },

  'Address Issue': {
    high: [
      'wrong address', 'incorrect address',
      'address change', 'update address',
      'change address', 'wrong location',
      'delivered to wrong', 'signed by unknown',
      'cannot deliver', 'undeliverable',
      'return to sender', 'address not found',
      'no such address', 'alamat salah',
      'redirect parcel', 'address update',
      'address never updated', 'address not applied',
      'sent to old address', 'delivered to wrong house',
      'wrong recipient', 'please update address',
      'change delivery location', 'new address',
      'old address', 'different address',
      'residential address', 'office address',
      'delivery address', 'shipping address',
      'address was not changed', 'address still wrong',
      'address not updated in system',
      'wrong unit', 'wrong floor', 'wrong building',
      'wrong postcode', 'wrong state',
      'alamat tidak dikemaskini', 'hantar ke alamat lama'
    ],
    medium: [
      'location', 'redirect', 'reroute',
      'wrong place', 'moved', 'relocated',
      'destination', 'delivery point', 'drop off'
    ]
  },

  'System Error': {
    high: [
      'system down', 'portal error', 'cannot login',
      'login failed', 'error 500', 'error 404',
      'tracking not updating', 'tracking not working',
      'website down', 'app crash', 'session timeout',
      'mybill error', 'cannot access portal',
      'system issue', 'technical error', 'bug',
      'glitch', 'server error', 'corrupted account',
      'maintenance issue', 'IT escalation',
      'portal not loading', 'page not found',
      'internal server error', 'gateway timeout',
      'database error', 'sync error', 'api error',
      'system failure', 'outage'
    ],
    medium: [
      'portal', 'website', 'app', 'error',
      'online', 'platform', 'software', 'IT', 'technical',
      'access issue', 'login issue', 'password reset',
      'network', 'connection issue', 'not loading'
    ]
  },

  'Customer Complaint': {
    high: [
      'rude staff', 'rude courier', 'unprofessional driver',
      'terrible service', 'unacceptable service',
      'social media', 'twitter', 'facebook post', 'instagram',
      'google review', 'public complaint', 'going viral',
      'consumer tribunal', 'mcmc', 'kpdnhep',
      'cheated', 'fraud', 'scam', 'misleading',
      'nobody called back', 'no one helped',
      'passed around', 'ignored', 'no accountability',
      'incompetent', 'useless service',
      'demanded refund', 'very frustrated',
      'extremely unhappy', 'threatening to report'
    ],
    medium: [
      'complaint', 'upset', 'frustrated', 'angry',
      'unhappy', 'disappointed', 'dissatisfied',
      'poor service', 'bad experience', 'unacceptable',
      'no response', 'no reply', 'ignored',
      'not helpful', 'attitude', 'behaviour'
    ]
  }
};

// ─────────────────────────────────────────
// PRIORITY TRIGGER WORDS
// ─────────────────────────────────────────
const PRIORITY_TRIGGERS = {
  High: [
    'urgent', 'urgently', 'sue', 'lawyer', 'legal action',
    'tribunal', 'mcmc', 'kpdnhep', 'police report',
    'media', 'social media', 'viral', 'news',
    'compensation', 'refund immediately',
    'lost parcel', 'missing parcel', 'parcel missing',
    'damaged beyond repair', 'escalate', 'escalation',
    'missing', 'deadline', 'very frustrated',
    'extremely unhappy', 'no response for days',
    'immediate action', 'critical', 'emergency',
    'fraud', 'scam', 'cheated', 'stolen'
  ],
  Medium: [
    'late', 'waiting', 'pending', 'no response',
    'delayed', 'not received', 'not delivered',
    'refund', 'disappointed', 'unhappy',
    'follow up', 'callback', 'update needed'
  ],
  Low: [
    'inquiry', 'question', 'check', 'status',
    'information', 'feedback', 'can I', 'how to',
    'general', 'advice'
  ]
};

// ─────────────────────────────────────────
// SCORE TRIGGERS AGAINST TEXT
// ─────────────────────────────────────────
function scoreTriggers(rawText, triggerMap) {
  const textLower = rawText.toLowerCase()
  const scores = {}

  Object.entries(triggerMap).forEach(([label, config]) => {
    let score = 0
    const matchedHigh = []
    const matchedMedium = []

    if (config.high) {
      config.high.forEach(phrase => {
        if (textLower.includes(phrase.toLowerCase())) {
          score += 3
          matchedHigh.push(phrase)
        }
      })
    }

    if (config.medium) {
      config.medium.forEach(phrase => {
        if (textLower.includes(phrase.toLowerCase())) {
          score += 1
          matchedMedium.push(phrase)
        }
      })
    }

    // For flat-list triggers (priority)
    if (!config.high && !config.medium) {
      ;(config || []).forEach(phrase => {
        if (textLower.includes(phrase.toLowerCase())) {
          score += 2
          matchedHigh.push(phrase)
        }
      })
    }

    scores[label] = score

    if (DEBUG && score > 0) {
      if (!scores._debug) scores._debug = {}
      scores._debug[label] = { matchedHigh, matchedMedium }
    }
  })

  if (DEBUG) {
    const debugInfo = scores._debug || {}
    console.log('\n  📊 Trigger word hits:')
    Object.entries(scores).forEach(([label, score]) => {
      if (label === '_debug') return
      if (score === 0) return
      const info = debugInfo[label] || {}
      console.log(`     ${label} (score: ${score})`)
      if (info.matchedHigh?.length)   console.log(`       HIGH   (+3 each): ${info.matchedHigh.join(', ')}`)
      if (info.matchedMedium?.length) console.log(`       MEDIUM (+1 each): ${info.matchedMedium.join(', ')}`)
    })
  }

  delete scores._debug
  return scores
}

// ─────────────────────────────────────────
// GET BEST LABEL FROM SCORES
// ─────────────────────────────────────────
function getBestLabel(scores) {
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Customer Complaint'
}

// ─────────────────────────────────────────
// SPECIFICITY BONUS (prevents false positives)
// ─────────────────────────────────────────
const SPECIFICITY_BOOST_RULES = {
  'Late Delivery':      ['still waiting', 'never came', 'no delivery attempt', 'nobody came'],
  'Damaged Parcel':     ['received damaged', 'arrived broken', 'inside damaged', 'signs of tampering'],
  'Address Issue':      ['wrong address', 'delivered to wrong', 'address not found', 'alamat salah'],
  'System Error':       ['system failure', 'system down', 'session timeout', 'server error'],
  'Customer Complaint': ['consumer tribunal', 'social media', 'going viral', 'fraud']
}

function applySpecificityBonus(rawText, scores) {
  debug('SPECIFICITY BONUS CHECK', '')
  const textLower = rawText.toLowerCase()
  const boosted = { ...scores }

  Object.entries(SPECIFICITY_BOOST_RULES).forEach(([label, phrases]) => {
    const matches = phrases.filter(p => textLower.includes(p.toLowerCase()))
    if (matches.length >= 1) {
      boosted[label] = (boosted[label] || 0) + 5
      debugStep('BONUS', `+5 to "${label}" — matched: [${matches.join(', ')}]`)
    }
  })

  return boosted
}

// ─────────────────────────────────────────
// OVERLAP RESOLVER
// ─────────────────────────────────────────
function resolveOverlap(rawText, scores) {
  const sorted = Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)

  const textLower = rawText.toLowerCase()

  debug('OVERLAP RESOLUTION', {
    ranking: sorted.map(([l, s]) => `${l}: ${s.toFixed(4)}`),
    top:    sorted[0]?.[0],
    second: sorted[1]?.[0],
    scoreDiff: sorted.length >= 2
      ? (sorted[0][1] - sorted[1][1]).toFixed(4)
      : 'N/A'
  })

  if (sorted.length === 0) {
    debugWinner('Customer Complaint', 'No triggers matched — default fallback')
    return 'Customer Complaint'
  }

  const [topLabel, topScore] = sorted[0]
  const [secondLabel, secondScore] = sorted[1] || ['', 0]
  const diff = topScore - secondScore

  // Clear winner
  if (diff >= 3) {
    debugWinner(topLabel, `Clear winner by score diff ${diff.toFixed(4)}`)
    return topLabel
  }

  // Tie-break: address vs late delivery
  if (
    topLabel === 'Address Issue' && secondLabel === 'Late Delivery' ||
    topLabel === 'Late Delivery' && secondLabel === 'Address Issue'
  ) {
    if (textLower.includes('wrong address') || textLower.includes('address not found') ||
        textLower.includes('delivered to wrong') || textLower.includes('address change')) {
      debugWinner('Address Issue', 'Tie-break: specific address phrases found')
      return 'Address Issue'
    }
    debugWinner('Late Delivery', 'Tie-break: defaulted to Late Delivery')
    return 'Late Delivery'
  }

  // Tie-break: system error vs customer complaint
  if (
    topLabel === 'System Error' && secondLabel === 'Customer Complaint' ||
    topLabel === 'Customer Complaint' && secondLabel === 'System Error'
  ) {
    if (textLower.includes('system') || textLower.includes('portal') ||
        textLower.includes('login') || textLower.includes('error')) {
      debugWinner('System Error', 'Tie-break: system/portal/login terms found')
      return 'System Error'
    }
    debugWinner('Customer Complaint', 'Tie-break: no system terms, defaulted to complaint')
    return 'Customer Complaint'
  }

  // Default: top scorer
  debugWinner(topLabel, `Closest match with score ${topScore}`)
  return topLabel
}

// ─────────────────────────────────────────
// PRIORITY CLASSIFICATION
// ─────────────────────────────────────────
function classifyPriority(rawText) {
  debug('PRIORITY CLASSIFICATION', '')
  const scores = scoreTriggers(rawText, PRIORITY_TRIGGERS)
  const priority = getBestLabel(scores)
  debug('PRIORITY SCORES', scores)
  debug('FINAL PRIORITY', `✅ ${priority}`)
  return priority
}

// ─────────────────────────────────────────
// FALLBACK — no model, pure trigger words
// ─────────────────────────────────────────
function fallbackClassification(rawText) {
  debug('FALLBACK MODE', 'Model failed, using trigger words only')
  const catScores = scoreTriggers(rawText, CATEGORY_TRIGGERS)
  const boostedScores = applySpecificityBonus(rawText, catScores)
  const category = resolveOverlap(rawText, boostedScores)
  const priority = classifyPriority(rawText)
  return { category, priority }
}

// ─────────────────────────────────────────
// TITLE GENERATION
// ─────────────────────────────────────────
function generateTitle(rawText, category) {
  const trackingMatch = rawText.match(
    /\b(MY\d{6,12}|DHL-\d{4,10}|#\d{4,10})\b/i
  )
  const tracking = trackingMatch ? ` ${trackingMatch[0]}` : ''

  const titles = {
    'Late Delivery':      `Late Delivery${tracking} Customer Report`,
    'Damaged Parcel':     `Damaged Parcel${tracking} Reported`,
    'Address Issue':      `Address Issue${tracking} Reported`,
    'System Error':       'System Error Reported By Customer',
    'Customer Complaint': 'Customer Complaint Requires Attention'
  }

  return titles[category] || 'Incident Report Submitted'
}

// ─────────────────────────────────────────
// HTML ESCAPE — prevents XSS from user content
// ─────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─────────────────────────────────────────
// SUMMARY GENERATION — Structured Admin Briefing
// ─────────────────────────────────────────
function generateSummary(rawText) {
  // ── 1. EXTRACT EMAIL METADATA ──────────────────────────────────
  // Cap each field at 200 chars so a missing newline never swallows the whole text
  const subjectMatch = rawText.match(/Subject:\s*([^\n]{1,200})/i);
  const subject = subjectMatch ? escapeHtml(subjectMatch[1].trim()) : '';

  const fromMatch = rawText.match(/From:\s*([^\n]{1,200})/i);
  const sender = fromMatch ? escapeHtml(fromMatch[1].trim()) : '';

  const dateMatch = rawText.match(/Date:\s*([^\n]{1,100})/i);
  const emailDate = dateMatch ? escapeHtml(dateMatch[1].trim()) : '';

  // ── 2. CLEAN THE BODY ─────────────────────────────────────────
  const cleanBody = rawText
    .replace(/(From|To|Date|Subject):.*/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  // ── 3. EXTRACT KEY FACTS ───────────────────────────────────────

  // (a) Tracking / Waybill / Case Reference numbers
  const trackingNumbers = [];
  const trackingRegex = /\b(MY[\w-]{5,15}|DHL-\d{4,12}|CAS-[\w-]+|#\d{4,12})\b/gi;
  let m;
  while ((m = trackingRegex.exec(rawText)) !== null) {
    const val = m[0].toUpperCase();
    if (!trackingNumbers.includes(val)) trackingNumbers.push(val);
  }

  // (b) Financial amounts (RM)
  const amounts = [];
  const amountRegex = /RM\s?[\d,]+(?:\.\d{1,2})?/gi;
  let am;
  while ((am = amountRegex.exec(rawText)) !== null) {
    if (!amounts.includes(am[0])) amounts.push(escapeHtml(am[0]));
  }
  const totalLostMatch = rawText.match(/(?:total|lost|out)\s+(?:i\s+)?(?:lost\s+)?(RM\s?[\d,]+(?:\.\d{1,2})?)/i);
  const totalLost = totalLostMatch ? escapeHtml(totalLostMatch[1]) : null;

  // (c) Prior contact attempts
  const contactAttempts = [];
  const callMatch = rawText.match(/called?\s+(?:your\s+)?(?:hotline|dhl)?\s*(\d+)\s*times?/i);
  if (callMatch) contactAttempts.push(`Called hotline ${callMatch[1]}&times;`);
  const chatMatch = rawText.match(/live\s+chat\s+(\d+)\s*times?/i);
  if (chatMatch) contactAttempts.push(`Live chat ${chatMatch[1]}&times;`);
  const visitMatch = rawText.match(/(?:went|visited|visit)\s+(?:to\s+)?(?:your\s+)?(?:service\s+point|branch|office|counter)/i);
  if (visitMatch) contactAttempts.push('In-person visit');

  // (d) Customer demands (numbered list items or key phrases)
  const demands = [];
  // Skip attachment/photo/screenshot items; match action-oriented requests
  const ATTACHMENT_SKIP = /^(photo|screenshot|image|receipt|statement|document|copy|attachment|scan)/i;
  const DEMAND_KEYWORDS = /(?:supervisor|refund|arrange|immediate|courier|update|response|written|compensation|claim|locate|investigate|resolve|escalat)/i;

  // First: try to find a "REQUESTING / WANT" section and pull items from it
  const requestingSection = rawText.match(/(?:WHAT I (?:AM )?REQUESTING|I WANT|MY REQUESTS?)[:\s-]*([\s\S]{0,800}?)(?:\n---|\n\n[A-Z]{4,}|$)/i);
  if (requestingSection) {
    const sectionText = requestingSection[1];
    const sectionItems = sectionText.match(/\d\.\s+[^\n]{15,150}/g) || [];
    sectionItems.slice(0, 3).forEach(item => {
      demands.push(escapeHtml(item.replace(/^\d\.\s+/, '').trim()));
    });
  }

  // Second: if no section found, scan all numbered list items and filter for demand keywords
  if (demands.length === 0) {
    const numberedList = cleanBody.match(/\d\.\s+[A-Z][^.!\n]{15,150}/g) || [];
    numberedList.forEach(item => {
      const text = item.replace(/^\d\.\s+/, '').trim();
      if (!ATTACHMENT_SKIP.test(text) && DEMAND_KEYWORDS.test(text) && demands.length < 3) {
        demands.push(escapeHtml(text));
      }
    });
  }

  // Fallback: sentence-level demand patterns
  if (demands.length === 0) {
    const demandPatterns = [
      /(?:i\s+demand|i\s+want|i\s+need|requesting|request\b)[^.!?\n]{10,120}/gi,
      /(?:refund|compensation|replacement|callback|escalat|supervisor)[^.!?\n]{5,100}/gi
    ];
    for (const dp of demandPatterns) {
      let d;
      while ((d = dp.exec(cleanBody)) !== null && demands.length < 3) {
        const clean = d[0].replace(/\s+/g, ' ').trim();
        if (clean.length > 15 && !demands.some(x => x.includes(clean.substring(0, 20)))) {
          demands.push(escapeHtml(clean.charAt(0).toUpperCase() + clean.slice(1)));
        }
      }
      if (demands.length >= 3) break;
    }
  }

  // (e) Escalation flags
  const hasSocialMediaThreat = /(?:google\s*review|twitter|shopee\s*review|lazada|facebook|instagram|x\s*\(twitter\)|social\s*media|viral|tribunal)/i.test(rawText);
  const hasSupervisorRequest = /(?:supervisor|senior\s+case|manager|escalat|head of)/i.test(rawText);
  const hasDeadline = /(?:by end of|latest by|respond by|response by|deadline\b)/i.test(rawText);
  const hasPoliceOrLegal = /(?:lawyer|legal action|police report|tribunal|mcmc)/i.test(rawText);

  // ── 4. BUILD STRUCTURED HTML SUMMARY ──────────────────────────
  const HL = (text) =>
    `<span style="color:#E74C3C;font-weight:700;background-color:#FEF2F2;padding:1px 5px;border-radius:3px;">${text}</span>`;

  const LABEL = (icon, label) =>
    `<span style="font-size:11px;font-weight:700;color:#6B7280;letter-spacing:0.05em;text-transform:uppercase;">${icon} ${label}</span>`;

  let parts = [];

  // Subject line as bold header
  if (subject) {
    parts.push(
      `<div style="font-weight:700;font-size:14px;color:#111827;margin-bottom:5px;line-height:1.4;">${subject}</div>`
    );
  }

  // Sender + Date meta row
  const metaParts = [];
  if (sender) metaParts.push(`<strong>From:</strong> <em>${sender}</em>`);
  if (emailDate) metaParts.push(`<strong>Date:</strong> ${emailDate}`);
  if (metaParts.length) {
    parts.push(`<div style="font-size:12px;color:#6B7280;margin-bottom:8px;">${metaParts.join('&emsp;&bull;&emsp;')}</div>`);
  }

  // Brief "What Happened" narrative — first 2 meaningful sentences from the body
  const bodySentences = cleanBody
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && !/^(from|to|date|subject|dear|hi |hello|regards|sincerely|thank)/i.test(s))
  if (bodySentences.length > 0) {
    const excerpt = escapeHtml(bodySentences.slice(0, 2).join(' '))
    parts.push(
      `<div style="margin-bottom:8px;font-size:13px;color:#374151;line-height:1.6;padding:8px 10px;background:#F9FAFB;border-left:3px solid #D1D5DB;border-radius:0 6px 6px 0;">${excerpt}</div>`
    )
  }

  // Tracking / Reference numbers
  if (trackingNumbers.length > 0) {
    parts.push(
      `<div style="margin-bottom:4px;">${LABEL('📦', 'Reference(s):')} ${trackingNumbers.map(t => HL(t)).join(', ')}</div>`
    );
  }

  // Financial impact
  if (totalLost) {
    parts.push(
      `<div style="margin-bottom:4px;">${LABEL('💸', 'Total Claimed Loss:')} ${HL(totalLost)}</div>`
    );
  } else if (amounts.length > 0) {
    parts.push(
      `<div style="margin-bottom:4px;">${LABEL('💸', 'Amounts Mentioned:')} ${amounts.slice(0, 5).join(', ')}</div>`
    );
  }

  // Prior contacts
  if (contactAttempts.length > 0) {
    parts.push(
      `<div style="margin-bottom:4px;">${LABEL('📞', 'Prior Contacts:')} ${contactAttempts.join(' &bull; ')}</div>`
    );
  }

  // Escalation flags row
  const flags = [];
  if (hasSupervisorRequest) flags.push(HL('⚠️ Supervisor Requested'));
  if (hasSocialMediaThreat) flags.push(HL('🔴 Social Media / Review Threat'));
  if (hasDeadline)           flags.push(HL('⏰ Response Deadline Stated'));
  if (hasPoliceOrLegal)      flags.push(HL('⚖️ Legal / Police Threat'));
  if (flags.length) {
    parts.push(`<div style="margin:6px 0;">${flags.join('&emsp;')}</div>`);
  }

  // Customer demands
  if (demands.length > 0) {
    const demandItems = demands.slice(0, 3).map(d => `<li style="margin:3px 0;">${d}</li>`).join('');
    parts.push(
      `<div style="margin-top:6px;">`+
      `${LABEL('📋', 'Customer Demands:')}`+
      `<ul style="margin:4px 0 0 18px;padding:0;font-size:13px;">${demandItems}</ul>`+
      `</div>`
    );
  }

  return `<div style="line-height:1.7;font-size:13px;">${parts.join('')}</div>`;
}

// ─────────────────────────────────────────
// DUPLICATE DETECTION
// ─────────────────────────────────────────
function detectDuplicate(rawText, existingIncidents) {
  const trackingMatch = rawText.match(
    /\b(MY\d{6,12}|DHL-\d{4,10}|#\d{4,10})\b/i
  )
  const tracking = trackingMatch ? trackingMatch[0] : null

  debug('DUPLICATE CHECK', `Tracking number found: ${tracking || 'none'}`)

  if (tracking) {
    const duplicate = existingIncidents.find(inc =>
      inc.raw_content &&
      inc.raw_content.toLowerCase()
        .includes(tracking.toLowerCase()) &&
      inc.status !== 'Resolved'
    )
    if (duplicate) {
      debug('DUPLICATE FOUND', `Matches incident ID: ${duplicate.id}`)
      return {
        is_duplicate: true,
        duplicate_reason: `Tracking number ${tracking} already exists in incident #${duplicate.id}`
      }
    }
  }

  return { is_duplicate: false, duplicate_reason: '' }
}

// ─────────────────────────────────────────
// MAIN ANALYSIS FUNCTION
// ─────────────────────────────────────────
async function analyzeIncident(rawText, existingIncidents = []) {
  console.log('\n' + '═'.repeat(50))
  console.log('🚀 ANALYZING INCIDENT')
  console.log('═'.repeat(50))

  let category, priority

  try {
    const clf = await loadModel()
    const labels = Object.keys(CATEGORY_TRIGGERS)
    const result = await clf(rawText, labels)

    debug('MODEL RAW OUTPUT', result)

    const topScore = result.scores[0]
    if (topScore < 0.35) {
      debug('MODEL CONFIDENCE LOW', `Score ${topScore} < 0.35 threshold — using fallback`)
      ;({ category, priority } = fallbackClassification(rawText))
    } else {
      category = result.labels[0]
      priority = classifyPriority(rawText)
      debug('MODEL USED', `${category} (confidence: ${topScore.toFixed(3)})`)
    }
  } catch (err) {
    console.log(`❌ AI model failed, using fallback: ${err.message}`)
    ;({ category, priority } = fallbackClassification(rawText))
  }

  const title   = generateTitle(rawText, category)
  const summary = generateSummary(rawText)
  const dupCheck = detectDuplicate(rawText, existingIncidents)

  const result = {
    title,
    summary,
    category,
    priority,
    is_duplicate: dupCheck.is_duplicate,
    duplicate_reason: dupCheck.duplicate_reason
  }

  console.log('\n' + '═'.repeat(50))
  console.log('📦 FINAL RESULT')
  console.log('═'.repeat(50))
  console.log(JSON.stringify(result, null, 2))
  console.log('═'.repeat(50) + '\n')

  return result
}

function isDHLRelated(rawText) {
  const lowerText = rawText.toLowerCase()

  // 1. HARD BLOCK list for known noise sources
  // 1. HARD BLOCK list for known noise sources (Domains and Names)
  const hardBlockDomains = [
    'quora.com', 'adobe.com', 'shopee.com', 'lazada', 'marketing',
    'newsletter', 'digest', 'promotions', 'noreply', 'no-reply',
    'support@discord', 'mail@mail.adobe', 'newsletters', 'promo'
  ]
  if (hardBlockDomains.some(domain => lowerText.includes(domain))) {
    return false
  }

  // 2. Check for marketing / newsletter footprints
  const marketingKeywords = [
    'unsubscribe', 'view online', 'click here', 'shop laptops',
    'shop desktops', 'price match guarantee', 'interest-free',
    'all rights reserved', 'terms and conditions', 'read more', 
    'top stories', 'suggested for you', 'safe senders list',
    'view web version', 'manage preferences', 'privacy policy'
  ]
  
  let marketingCount = 0
  for (const keyword of marketingKeywords) {
    if (lowerText.includes(keyword)) marketingCount++
  }
  
  // If it has ANY marketing footprints, we are much stricter
  if (marketingCount >= 1) {
     // If it looks like a newsletter, it must have a VERY strong DHL context
     const hasStrongDHLContext = lowerText.includes('tracking number') || 
                                 lowerText.includes('awb #') || 
                                 lowerText.includes('shipment id');
     if (!hasStrongDHLContext) return false;
  }

  // 3. CORE DHL REQUIREMENT: 
  // A real incident MUST mention at least one of these core logistics terms
  const coreLogisticsTerms = ['dhl', 'parcel', 'shipment', 'tracking', 'awb', 'consignment', 'delivery', 'courier', 'package']
  if (!coreLogisticsTerms.some(term => lowerText.includes(term))) {
    return false
  }

  // 4. Check for actual incident triggers (fallback or AI scores)
  const scores = scoreTriggers(rawText, CATEGORY_TRIGGERS)
  const total = Object.values(scores).reduce((sum, v) => sum + v, 0)
  return total > 0
}

function extractCustomerName(rawText) {
  // Try "From: Name <email>" pattern
  const fromMatch = rawText.match(/From:\s*([^<\n]+?)(?:\s*<[^>]+>)?\s*\n/i)
  if (fromMatch) {
    const name = fromMatch[1].trim().replace(/['"]/g, '')
    if (name && name.length > 1 && !name.includes('@')) return name
  }

  // Try "Name: John Smith" pattern
  const nameMatch = rawText.match(/(?:Customer\s*Name|Name|Nama|Contact)\s*:\s*([A-Za-z][^\n,]{2,40})/i)
  if (nameMatch) return nameMatch[1].trim()

  // Try "Regards, Name" or "From, Name" at end of email
  const regardsMatch = rawText.match(/(?:Regards|Sincerely|Thanks|Thank you|From)\s*[,.]?\s*\n\s*([A-Z][a-zA-Z\s]{2,30})\s*\n/i)
  if (regardsMatch) return regardsMatch[1].trim()

  // Try email address and use local part as name
  const emailMatch = rawText.match(/From:\s*([a-zA-Z0-9._%+-]+)@/i)
  if (emailMatch) {
    return emailMatch[1].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  return 'Unknown'
}

function extractTags(rawText, category) {
  const text = rawText.toLowerCase()
  const tags = []

  const categoryTagMap = {
    'Late Delivery':      'late-delivery',
    'Damaged Parcel':     'damaged-parcel',
    'Address Issue':      'address-issue',
    'System Error':       'system-error',
    'Customer Complaint': 'customer-complaint',
  }
  if (category && categoryTagMap[category]) tags.push(categoryTagMap[category])

  if (/tracking|waybill|parcel number|shipment/.test(text)) tags.push('tracking')
  if (/refund|compensation|claim/.test(text)) tags.push('refund')
  if (/urgent|asap|immediately|critical/.test(text)) tags.push('urgent')
  if (/warehouse|hub|depot/.test(text)) tags.push('warehouse')
  if (/customer|complaint|dissatisfied/.test(text)) tags.push('customer-service')
  if (/wrong address|wrong house|misdelivered/.test(text)) tags.push('misdelivery')
  if (/crushed|broken|damaged|wet/.test(text)) tags.push('damage')
  if (/portal|system|error|500|down/.test(text)) tags.push('it-system')
  if (/malaysia|my[0-9]/.test(text)) tags.push('malaysia')

  return [...new Set(tags)].slice(0, 5).join(',')
}

module.exports = { analyzeIncident, isDHLRelated, extractCustomerName, extractTags }
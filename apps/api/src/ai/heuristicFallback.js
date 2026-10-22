// Deterministic Heuristic Fallback for BookLeaf AI Service
// Activates when Gemini API key is missing, network is offline, or rate limit is reached.

export function classifyTicketHeuristic({ subject = '', description = '', bookContext = null }) {
  const text = `${subject} ${description}`.toLowerCase();

  let category = 'General Inquiry';
  let category_reason = 'Routine author general inquiry assessed via rule heuristics.';

  // 1. ISBN & Metadata
  if (
    text.includes('isbn') ||
    text.includes('barcode') ||
    text.includes('asin') ||
    text.includes('metadata') ||
    text.includes('wrong book') ||
    text.includes('duplicate')
  ) {
    category = 'ISBN & Metadata Issues';
    category_reason = 'Heuristic matched keywords relating to ISBN registration, duplicate linkage, or catalog metadata.';
  }
  // 2. Royalty & Payments
  else if (
    text.includes('royalty') ||
    text.includes('royalties') ||
    text.includes('payment') ||
    text.includes('payout') ||
    text.includes('earning') ||
    text.includes('money') ||
    text.includes('bank transfer') ||
    text.includes('balance') ||
    text.includes('₹') ||
    text.includes('rupees')
  ) {
    category = 'Royalty & Payments';
    category_reason = 'Heuristic identified terms pertaining to royalty calculation, quarterly disbursement, or sales payouts.';
  }
  // 3. Printing & Quality
  else if (
    text.includes('print') ||
    text.includes('quality') ||
    text.includes('blurry') ||
    text.includes('misprint') ||
    text.includes('binding') ||
    text.includes('pages missing') ||
    text.includes('defective') ||
    text.includes('copies') ||
    text.includes('paper')
  ) {
    category = 'Printing & Quality';
    category_reason = 'Heuristic detected physical book manufacturing, printing defect, or copy fulfillment inquiry.';
  }
  // 4. Distribution & Availability
  else if (
    text.includes('amazon') ||
    text.includes('flipkart') ||
    text.includes('unavailable') ||
    text.includes('out of stock') ||
    text.includes('listing') ||
    text.includes('store') ||
    text.includes('not showing') ||
    text.includes('distribution')
  ) {
    category = 'Distribution & Availability';
    category_reason = 'Heuristic identified retail channel availability, listing propagation, or stock sync issue.';
  }
  // 5. Book Status & Production Updates
  else if (
    text.includes('typesetting') ||
    text.includes('cover design') ||
    text.includes('proofreading') ||
    text.includes('manuscript') ||
    text.includes('production') ||
    text.includes('progress') ||
    text.includes('when will it be published') ||
    text.includes('stage')
  ) {
    category = 'Book Status & Production Updates';
    category_reason = 'Heuristic matched publishing production lifecycle milestones.';
  }

  // Determine Priority
  let priority = 'Medium';
  let priority_reason = 'Assessed as standard priority requiring normal operational review.';

  // Critical conditions
  if (
    (category === 'ISBN & Metadata Issues' && (text.includes('different') || text.includes('wrong') || text.includes('duplicate'))) ||
    text.includes('urgent') ||
    text.includes('legal') ||
    text.includes('emergency') ||
    text.includes('fraud')
  ) {
    priority = 'Critical';
    priority_reason = 'High-risk metadata collision or critical operational anomaly affecting book distribution.';
  }
  // High conditions
  else if (
    (category === 'Royalty & Payments' && (text.includes('months') || text.includes('never') || text.includes('not received') || text.includes('overdue'))) ||
    (category === 'Printing & Quality' && (text.includes('terrible') || text.includes('blurry') || text.includes('damaged') || text.includes('defective'))) ||
    category === 'ISBN & Metadata Issues'
  ) {
    priority = 'High';
    priority_reason = 'Significant author concern involving financial delay, physical product defect, or ISBN accuracy.';
  }
  // Low conditions
  else if (
    category === 'General Inquiry' ||
    text.includes('can i update') ||
    text.includes('how to') ||
    text.includes('question about') ||
    text.includes('bio')
  ) {
    priority = 'Low';
    priority_reason = 'Informational inquiry or routine metadata request with non-critical operational impact.';
  }

  return {
    category,
    priority,
    category_reason,
    priority_reason,
    confidence: 0.85,
    is_fallback: true
  };
}

export function generateDraftHeuristic({
  subject,
  description,
  category,
  authorName = 'Author',
  bookContext = null
}) {
  const bookTitle = bookContext ? `"${bookContext.title}"` : 'your book';

  if (category === 'Royalty & Payments') {
    const pendingAmount = bookContext && bookContext.royalty_pending ? `₹${Number(bookContext.royalty_pending).toLocaleString('en-IN')}` : 'your accrued amount';
    return `Dear ${authorName},

Thank you for reaching out regarding your royalties for ${bookTitle}. I understand how critical payment transparency is to you, and I am glad to clarify our payout process.

At BookLeaf Publishing, royalties follow an 80/20 net profit split (80% to you, 20% to BookLeaf). Net profit is calculated as the MRP minus printing costs, channel platform fees, and shipping charges.

Royalties are accounted on a quarterly basis and disbursed within 45 days of each quarter ending, provided accumulated earnings meet our minimum payout threshold of ₹1,000. According to our records, your pending royalty balance is ${pendingAmount}.

I have flagged this with our finance team to verify your linked bank account and confirm the immediate disbursement status. We will provide an update within 48 hours.

Warm regards,
BookLeaf Author Support Team`;
  }

  if (category === 'ISBN & Metadata Issues') {
    const isbn = bookContext ? bookContext.isbn : 'registered ISBN';
    return `Dear ${authorName},

Thank you for bringing this ISBN discrepancy to our attention regarding ${bookTitle}. We treat any barcode or catalog mismatch as a high-priority operational matter.

Every title published through BookLeaf is assigned an exclusive ISBN under our official publisher imprint (recorded as ${isbn}). When a discrepancy appears on Amazon or retail platforms, it usually indicates a third-party catalog indexing error.

I have escalated this ticket directly to our production catalog team to review the metadata feed with Amazon India and trigger a corrected catalog sync. We will follow up with you within 48 hours with verification of the updated listing.

Warm regards,
BookLeaf Author Support Team`;
  }

  if (category === 'Printing & Quality') {
    return `Dear ${authorName},

I am genuinely sorry to hear that the print quality of your author copies of ${bookTitle} did not meet our quality standards. We hold our printing hub to the highest expectations, and I apologize for the frustration this has caused.

Under BookLeaf's quality guarantee policy, we provide a 100% free reprint for verified defects such as misaligned trims, blurred graphics, or binding issues.

Please reply to this message with a few clear photographs showcasing the defective pages or covers. Once received, our Delhi printing facility will verify the defect and dispatch your replacement copies within 5–7 business days.

Warm regards,
BookLeaf Author Support Team`;
  }

  if (category === 'Distribution & Availability') {
    return `Dear ${authorName},

Thank you for contacting us regarding the retail availability of ${bookTitle}.

When a published title appears as "Currently Unavailable" on Amazon or Flipkart, it typically reflects an automated inventory sync latency between warehouse fulfillment systems rather than an out-of-print status.

Our distribution team has triggered an immediate catalog re-sync for your book across our retail channels. This re-sync usually resolves and restores live purchase buttons within 24–48 hours. I will monitor this ticket and follow up once the listing shows in stock.

Warm regards,
BookLeaf Author Support Team`;
  }

  if (category === 'Book Status & Production Updates') {
    const status = bookContext ? bookContext.status : 'In Production';
    return `Dear ${authorName},

Thank you for checking in on the production progress of ${bookTitle}.

Our system currently records your manuscript at the "${status}" stage. As a standard milestone, each book passes through Manuscript Review, Editing, Cover Design, Typesetting, Proofreading, ISBN Assignment, and Final Printing.

I have requested a production expediting check with our layout team to ensure your interior proof moves forward without unnecessary delay. We will email you with an updated preview timeline within 48 hours.

Warm regards,
BookLeaf Author Support Team`;
  }

  return `Dear ${authorName},

Thank you for reaching out to BookLeaf Author Support regarding ${bookTitle}.

We have received your query regarding "${subject}". Our team is reviewing the details provided and will investigate this promptly according to our publishing guidelines.

If you have any further context or documentation to add in the meantime, please reply directly to this message. An operations specialist will follow up with a concrete next step within 24–48 hours.

Warm regards,
BookLeaf Author Support Team`;
}

// BookLeaf Publishing Centralized Knowledge Base & Business Policy

export const BOOKLEAF_KB = {
  company: {
    name: 'BookLeaf Publishing',
    presence: 'India and the United States',
    catalog: '22,000+ titles published, 1,200+ monthly processed titles',
    facilities: 'In-house printing facility & warehouse located in Delhi. Trusted print partners: Repro India and Epitome Books.',
    packages: [
      'Standard Free: Zero upfront publishing cost',
      'Bestseller Breakthrough: Premium paid package including marketing, expanded distribution, and priority production'
    ],
    services: 'Cover design, typesetting, ISBN registration & assignment, printing, multi-channel distribution, royalty accounting & disbursement.'
  },
  royaltyPolicy: {
    split: '80/20 profit split (80% net profit to Author, 20% to BookLeaf Publishing)',
    netProfitFormula: 'Net profit = MRP - (Printing Cost + Platform Commission [Amazon/Flipkart] + Shipping Charges)',
    payoutCycle: 'Calculated quarterly and disbursed within 45 days of quarter ending.',
    minimumThreshold: '₹1,000 minimum balance for disbursement. Balances below ₹1,000 automatically roll over to the subsequent quarter.',
    disbursementMethod: 'Direct bank transfer (NEFT/IMPS) to author bank account linked in the Author Dashboard.',
    transparency: 'Full line-by-line breakdown available in the Author Dashboard including channel-level sales per platform (Amazon India, Flipkart, BookLeaf Store, Amazon US/UK).'
  },
  isbnPolicy: {
    ownership: 'Unique ISBN assigned by BookLeaf registered under BookLeaf Publishing publisher imprint.',
    authorImprint: 'Authors desiring an ISBN under their own personal imprint must acquire it independently and furnish details during onboarding.',
    isbnIssues: 'Duplicate ISBNs, barcode misprints, or wrong book/ISBN linkages are treated as HIGH/CRITICAL priority and escalated directly to the production engineering team with a 48-hour resolution target.'
  },
  printingQuality: {
    printFacilities: 'In-house Delhi printing hub manages core paperback runs; large batch orders or specific formats route to Repro India or Epitome Books.',
    turnaround: 'Standard print fulfillment turnaround: 5–7 business days from order confirmation.',
    defectPolicy: 'For verified printing defects (severe misalignment, blurred text/imagery, binding failures, color inaccuracy), BookLeaf issues a free reprint after author submits photographic verification.',
    authorCopies: 'Authors can order author copies at subsidized author printing cost directly from their dashboard.'
  },
  distribution: {
    platforms: ['Amazon India', 'Flipkart', 'Amazon US', 'Amazon UK', 'BookLeaf Store'],
    listingTurnaround: 'Newly published titles go live on online sales channels within 7–10 business days following publication approval.',
    stockSync: 'If a published book shows "Currently Unavailable" or out-of-stock on Amazon or Flipkart, it usually reflects a stock inventory sync latency. The distribution operations team triggers an automated inventory re-sync within 24–48 hours.'
  },
  productionStages: [
    'Manuscript Received',
    'Editing (if opted in package)',
    'Cover Design (proof sent to author for formal sign-off)',
    'Typesetting & Interior Layout',
    'Proofreading & Revision rounds',
    'ISBN Assignment & Barcode Generation',
    'Printing of proof copy',
    'Distribution Setup across retail channels',
    'Published & Live'
  ],
  communicationTone: {
    style: 'Empathetic, transparent, highly professional, collaborative partner-first approach.',
    rules: [
      'Authors are creative partners, not support tickets.',
      'Acknowledge author concerns and frustrations upfront before offering remedies.',
      'Cite verifiable figures, dates, and active database status; never fabricate imaginary dates or bank confirmation numbers.',
      'Directly acknowledge BookLeaf responsibility when an internal error (e.g., misprint or delayed payout) has occurred—no defensive excuses.',
      'Specify clear next actions and tangible escalation timelines (e.g., 24–48 hours) rather than indefinite promises.',
      'Conclude with an unambiguous next step for either the author or BookLeaf operations team.'
    ]
  }
};

/**
 * Returns targeted knowledge base context for a specific category to optimize token cost.
 */
export function getRelevantKnowledge(category) {
  const baseIntro = `Company: BookLeaf Publishing (India & US). Operations: In-house printing in Delhi + Repro India / Epitome Books.\nTone: Empathetic, professional, partner-first. Provide clear next steps and concrete timelines (24-48h escalation). Own mistakes directly without corporate deflection.\n`;

  switch (category) {
    case 'Royalty & Payments':
      return `${baseIntro}
ROYALTY POLICY:
- 80/20 royalty split (80% net profit to Author, 20% to BookLeaf).
- Net Profit = MRP - (Printing cost + Platform commission [Amazon/Flipkart] + Shipping charges).
- Payout cycle: Quarterly, disbursed within 45 days of quarter end.
- Minimum payout threshold: ₹1,000. Under-threshold balances roll over to next quarter.
- Payment method: Direct bank transfer to account linked in author dashboard.
- If royalty is overdue and threshold is met, escalate to finance team with 48-hour resolution window.`;

    case 'ISBN & Metadata Issues':
      return `${baseIntro}
ISBN & METADATA POLICY:
- Every BookLeaf book receives a unique ISBN registered under BookLeaf's publisher imprint.
- If Amazon/Flipkart displays wrong ISBN, duplicate ISBN, or wrong book title linked, this is a CRITICAL/HIGH priority issue.
- Escalate immediately to the production catalog team for urgent re-indexing (48-hour resolution timeline).
- Metadata updates (description/blurb changes) take 3–5 business days to reflect on channels.`;

    case 'Printing & Quality':
      return `${baseIntro}
PRINTING & QUALITY POLICY:
- Standard printing turnaround is 5–7 business days from order confirmation.
- Printing done in Delhi in-house facility or partners (Repro India, Epitome Books).
- Free Reprint Policy: If there are verified misprints, binding defects, or color discrepancies, BookLeaf provides a 100% free reprint.
- Request author to provide photos showing the defect. Reprint delivery takes 5–7 business days once verified.`;

    case 'Distribution & Availability':
      return `${baseIntro}
DISTRIBUTION POLICY:
- Available channels: Amazon India, Flipkart, BookLeaf Store, Amazon US, Amazon UK.
- New book listings take 7–10 business days after publication to propagate to live retail pages.
- If listing shows "Currently Unavailable", it is typically an automated stock inventory sync issue.
- Distribution team triggers an immediate catalog re-sync within 24–48 hours.`;

    case 'Book Status & Production Updates':
      return `${baseIntro}
PRODUCTION STAGES:
Manuscript Received → Editing → Cover Design → Typesetting → Proofreading → ISBN Assignment → Printing → Distribution Setup → Published & Live.
- Authors receive status updates via dashboard and email at each milestone.
- Common hold-ups occur during Cover Design (waiting for author feedback) and Proofreading (author revision cycles).
- Check actual status in system. Be honest about delays and collaborate with author without shifting blame.`;

    case 'General Inquiry':
    default:
      return `${baseIntro}
GENERAL GUIDELINES:
- Publishing packages: Standard Free (no cost) & Bestseller Breakthrough (premium marketing/distribution).
- Metadata changes: Authors can request book description/bio updates; takes 3–5 business days to reflect across retail channels.
- Authors can manage their books and track performance in the Author Dashboard.`;
  }
}

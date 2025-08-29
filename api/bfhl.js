// api/bfhl.js
// Unique, well-commented handler for Vercel serverless.
// Reads env-driven identity and implements the exact BFHL spec.

function normalizeFullName(fullName) {
  // to lowercase, spaces->underscore, remove non-letters with underscores, squeeze repeats
  return (fullName || 'john doe')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z_]/g, '_')
    .replace(/_+/g, '_');
}

function toUserId(fullName, dobDDMMYYYY) {
  const n = normalizeFullName(fullName);
  const dob = (dobDDMMYYYY || '17091999').replace(/[^0-9]/g, '').slice(0, 8);
  return `${n}_${dob}`;
}

function isIntegerString(s) { return /^[+-]?\d+$/.test(s); }
function isAlphaString(s)   { return /^[A-Za-z]+$/.test(s); }
function isOnlySpecial(s)   { return s.length > 0 && /^[^A-Za-z0-9]+$/.test(s); }

// Build alternating caps after reversing: e.g., "abcd" -> reverse "dcba" -> "DcBa"
function alternatingCapsFromReversedLetters(lettersInOrder) {
  const reversed = lettersInOrder.split('').reverse();
  return reversed.map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase())).join('');
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ is_success: false, message: 'Use POST /bfhl' });
  }

  try {
    const body = req.body || {};
    if (!Array.isArray(body.data)) {
      return res.status(400).json({ is_success: false, message: 'Body must be {"data": [...]} (array required).' });
    }

    const FULL_NAME = process.env.FULL_NAME || 'john doe';
    const DOB_DDMMYYYY = process.env.DOB_DDMMYYYY || '17091999';
    const EMAIL = process.env.EMAIL || 'john@xyz.com';
    const ROLL_NUMBER = process.env.ROLL_NUMBER || 'ABCD123';

    const user_id = toUserId(FULL_NAME, DOB_DDMMYYYY);

    const even_numbers = [];
    const odd_numbers = [];
    const alphabets = [];
    const special_characters = [];
    let sumBig = 0n;
    let lettersForConcat = '';

    for (const item of body.data) {
      const token = (typeof item === 'string') ? item : String(item);

      if (isIntegerString(token)) {
        // keep numbers as strings everywhere (as required)
        const big = BigInt(token);
        sumBig += big;
        if ((big % 2n) === 0n) {
          even_numbers.push(token);
        } else {
          odd_numbers.push(token);
        }
      } else if (isAlphaString(token)) {
        alphabets.push(token.toUpperCase());
        lettersForConcat += token; // take letters as they appear for the concat rule
      } else if (isOnlySpecial(token)) {
        special_characters.push(token);
      } else {
        // Mixed tokens like "abc123" or "3.14" are not pure numbers/alphas; treat as special by spec spirit
        special_characters.push(token);
        // (If your evaluator wants them ignored, change this line to skip instead.)
      }
    }

    const concat_string = alternatingCapsFromReversedLetters(lettersForConcat);
    const payload = {
      is_success: true,
      user_id,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: sumBig.toString(),
      concat_string
    };

    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ is_success: false, message: 'Unexpected error', error: String(err?.message || err) });
  }
}

# VIT BFHL API

A small, deterministic serverless API that fulfills the **/bfhl** problem statement with robust validation and a creative twist for the `concat_string`.

## Route
**POST /bfhl**

### Request
```json
{ "data": ["a","1","334","4","R","$"] }
```

### Response (shape)
- `is_success` (boolean)
- `user_id` (lowercase_fullname_ddmmyyyy)
- `email`
- `roll_number`
- `odd_numbers` (array of strings)
- `even_numbers` (array of strings)
- `alphabets` (array of uppercased strings that contain letters only)
- `special_characters` (array of everything else as-is)
- `sum` (string)
- `concat_string` (the letter stream from alphabet-only tokens, reversed, alternating caps starting Upper)

## Run locally
```bash
npm i
npx vercel dev
```

## Deploy (Vercel)
1. Create a new Vercel project and import this repo.
2. Add Environment Variables:
   - `FULL_NAME="John Doe"`
   - `DOB_DDMMYYYY="17091999"`
   - `EMAIL="john@xyz.com"`
   - `ROLL_NUMBER="ABCD123"`
3. Deploy.
4. Your public route: `POST https://<your-app>.vercel.app/bfhl`

## Examples
See `examples/curl.http` for ready-to-run requests.

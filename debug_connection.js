
const url = 'https://cloth-backend-872257327390.europe-west1.run.app/api/users/register';

const randomStr = Math.random().toString(36).substring(7);
const email = `test_${randomStr}@example.com`;
const phone = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10 digit

console.log(`Registering user: ${email}, ${phone}`);

async function check() {
  try {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password: 'password123',
            name: `Test User ${randomStr}`,
            phone
        })
    });
    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`Body length: ${text.length}`);
    console.log(`Body: ${text}`);
    
    try {
        const json = JSON.parse(text);
        console.log('Keys in JSON:', Object.keys(json));
        if (json.data) console.log('Keys in json.data:', Object.keys(json.data));
    } catch (e) {
        console.log('Not valid JSON');
    }

  } catch (err) {
    console.error(err);
  }
}

check();

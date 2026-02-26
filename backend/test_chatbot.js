
const fetch = require('node-fetch'); // or native if version > 18
async function test() {
    try {
        const res = await fetch('http://127.0.0.1:5000/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'hello' })
        });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Body:', text);
    } catch(e) {
        console.error('Error:', e);
    }
}
test();

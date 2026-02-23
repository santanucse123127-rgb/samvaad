/**
 * Simple mock function for sending SMS
 * In production, replace with Twilio, AWS SNS, or other provider
 */
export const sendSMS = async (phone, message) => {
    console.log(`\n--- SMS SENT TO: ${phone} ---`);
    console.log(`MESSAGE: ${message}`);
    console.log(`---------------------------------\n`);

    // Simulate network delay
    return new Promise((resolve) => setTimeout(resolve, 500));
};

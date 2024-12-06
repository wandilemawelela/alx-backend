import kue from 'kue';

// Blacklisted phone numbers
const blacklistedNumbers = ['4153518780', '4153518781'];

// Create a Kue queue
const queue = kue.createQueue();

// Function to send notifications
function sendNotification(phoneNumber, message, job, done) {
  job.progress(0, 100);  // Track the progress of the job

  // Check if the phone number is blacklisted
  if (blacklistedNumbers.includes(phoneNumber)) {
    return done(new Error(`Phone number ${phoneNumber} is blacklisted`));
  }

  job.progress(50, 100);  // Track the progress to 50%
  console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);
  done();  // Complete the job
}

// Process jobs in the 'push_notification_code_2' queue with concurrency of 2
queue.process('push_notification_code_2', 2, (job, done) => {
  const { phoneNumber, message } = job.data;
  sendNotification(phoneNumber, message, job, done);
});

queue.on('error', (err) => {
  console.error(`Queue error: ${err.message}`);
});

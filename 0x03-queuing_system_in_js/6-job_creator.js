import kue from 'kue';

// Create a Kue queue
const queue = kue.createQueue();

// Define the job data
const jobData = {
  phoneNumber: '1234567890',
  message: 'This is a notification message'
};

// Create a job in the 'push_notification_code' queue
const job = queue.create('push_notification_code', jobData)
  .save((err) => {
    if (err) {
      console.error('Error creating job:', err);
      return;
    }
    console.log(`Notification job created: ${job.id}`);
  });

// Handle job events
job.on('complete', () => {
  console.log('Notification job completed');
}).on('failed', () => {
  console.log('Notification job failed');
});

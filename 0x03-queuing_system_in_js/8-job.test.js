import { expect } from 'chai';
import kue from 'kue';
import createPushNotificationsJobs from '8-job.js';

const queue = kue.createQueue();

describe('createPushNotificationsJobs', () => {
  before(() => {
    queue.testMode.enter();
  });

  afterEach(() => {
    queue.testMode.clear();
  });

  after(() => {
    queue.testMode.exit();
  });

  it('should throw an error if jobs is not an array', () => {
    expect(() => createPushNotificationsJobs('not an array', queue)).to.throw('Jobs is not an array');
  });

  it('should create jobs in the queue', () => {
    const jobs = [
      { phoneNumber: '4153518780', message: 'This is the code 1234 to verify your account' },
      { phoneNumber: '4153518781', message: 'This is the code 4562 to verify your account' },
    ];

    createPushNotificationsJobs(jobs, queue);

    expect(queue.testMode.jobs.length).to.equal(2);
    expect(queue.testMode.jobs[0].type).to.equal('push_notification_code_3');
    expect(queue.testMode.jobs[0].data).to.deep.equal(jobs[0]);
    expect(queue.testMode.jobs[1].type).to.equal('push_notification_code_3');
    expect(queue.testMode.jobs[1].data).to.deep.equal(jobs[1]);
  });

  it('should log job creation', (done) => {
    const jobs = [
      { phoneNumber: '4153518780', message: 'This is the code 1234 to verify your account' },
    ];

    console.log = (msg) => {
      expect(msg).to.equal(`Notification job created: ${queue.testMode.jobs[0].id}`);
      done();
    };

    createPushNotificationsJobs(jobs, queue);
  });

  it('should log job completion', (done) => {
    const jobs = [
      { phoneNumber: '4153518780', message: 'This is the code 1234 to verify your account' },
    ];

    const job = queue.create('push_notification_code_3', jobs[0])
      .on('complete', () => {
        console.log = (msg) => {
          expect(msg).to.equal(`Notification job ${job.id} completed`);
          done();
        };
      })
      .save((err) => {
        if (err) done(err);
        job.complete();
      });
  });

  it('should log job failure', (done) => {
    const jobs = [
      { phoneNumber: '4153518780', message: 'This is the code 1234 to verify your account' },
    ];

    const job = queue.create('push_notification_code_3', jobs[0])
      .on('failed', (err) => {
        console.log = (msg) => {
          expect(msg).to.equal(`Notification job ${job.id} failed: ${err}`);
          done();
        };
      })
      .save((err) => {
        if (err) done(err);
        job.failed(new Error('Test error'));
      });
  });

  it('should log job progress', (done) => {
    const jobs = [
      { phoneNumber: '4153518780', message: 'This is the code 1234 to verify your account' },
    ];

    const job = queue.create('push_notification_code_3', jobs[0])
      .on('progress', (progress) => {
        console.log = (msg) => {
          expect(msg).to.equal(`Notification job ${job.id} ${progress}% complete`);
          done();
        };
      })
      .save((err) => {
        if (err) done(err);
        job.progress(50);
      });
  });
});

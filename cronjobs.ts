import cron from 'node-cron';

cron.schedule('* * * * *', async () => {
  console.log('Running a task every minute');
  await fetch('http://localhost:3000/api/tasks/checkAndPostTweets', { method: 'POST' });
});
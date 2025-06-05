import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'reseed demo data',
  { hours: 24 * 14 }, // Run every 14 days
  internal.resetAndSeed.resetAndSeed,
);

export default crons;

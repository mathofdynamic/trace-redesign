import type { TraceUser } from '@trace/auth';
import type { MockTeamMember } from './types';

export const MOCK_PRIMARY_USER: TraceUser = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Mohammad Mohammadi',
  email: 'mohammad@northstar.engineering',
  githubLogin: 'mohammadm',
  image: null,
};

export const MOCK_TEAM_MEMBERS: MockTeamMember[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Mohammad Mohammadi',
    role: 'Engineering Lead',
    email: 'mohammad@northstar.engineering',
    githubLogin: 'mohammadm',
    avatarUrl: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Sarah Chen',
    role: 'Staff Systems Engineer',
    email: 'sarah.chen@northstar.engineering',
    githubLogin: 'sarahc',
    avatarUrl: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Elena Rostova',
    role: 'Security Engineer',
    email: 'elena.rostova@northstar.engineering',
    githubLogin: 'erostova',
    avatarUrl: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'David Park',
    role: 'Senior Backend Engineer',
    email: 'david.park@northstar.engineering',
    githubLogin: 'dpark',
    avatarUrl: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Marcus Vance',
    role: 'Platform Engineer',
    email: 'marcus.vance@northstar.engineering',
    githubLogin: 'mvance',
    avatarUrl: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Aisha Patel',
    role: 'Frontend Engineer',
    email: 'aisha.patel@northstar.engineering',
    githubLogin: 'apatel',
    avatarUrl: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    name: 'Lucas Meyer',
    role: 'Product Engineer',
    email: 'lucas.meyer@northstar.engineering',
    githubLogin: 'lmeyer',
    avatarUrl: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    name: 'Maya Lin',
    role: 'Distributed Systems Engineer',
    email: 'maya.lin@northstar.engineering',
    githubLogin: 'mlin',
    avatarUrl: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    name: 'Julian Torres',
    role: 'Site Reliability Engineer',
    email: 'julian.torres@northstar.engineering',
    githubLogin: 'jtorres',
    avatarUrl: null,
  },
];

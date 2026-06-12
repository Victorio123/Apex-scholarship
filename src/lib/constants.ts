/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const APPROVED_UNIVERSITIES = [
  'University of Exeter (UK)',
  'York St John University (UK)',
  'University of Hull (UK)',
  'University of Salford (UK)',
  'teeside university',
  'Uni of Manitoba',
  'Uni of Saskatchewan',
  'Uni of Alberta',
  'Charles Darwin University',
  'University of Southern Queensland (UniSQ)',
  'University of the Sunshine Coast'
];

export const ELIGIBLE_COURSES = [
  'Engineering',
  'Business Administration',
  'Law',
  'Computer Science',
  'Medicine',
  'Nursing'
];

export const ELIGIBLE_NATIONALITIES = [
  { code: 'Nigeria', name: 'Nigeria 🇳🇬' },
  { code: 'Ghana', name: 'Ghana 🇬🇭' },
  { code: 'Tunisia', name: 'Tunisia 🇹🇳' },
  { code: 'Kenya', name: 'Kenya 🇰🇪' },
  { code: 'Gambia', name: 'Gambia 🇬🇲' }
];

export const SCHOLARSHIP_CRITERIA = {
  full: {
    title: 'Full Scholarship (Elite Tier)',
    funding: 'Covers up to 100% tuition',
    stipend: 'USD $300 monthly stipend',
    requirements: 'Exceptional results (First Class, Distinction), strong statement, top admission, ≥ 85 scoring threshold.'
  },
  partial: {
    title: 'Partial Scholarship (Standard Tier)',
    funding: 'Covers up to 50% tuition',
    stipend: 'No stipend',
    requirements: 'Strong academic performance, conditional or unconditional admission, 70 - 84 scoring threshold.'
  }
};

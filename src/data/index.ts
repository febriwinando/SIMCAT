import { cpnsSkdPackage } from './cpns-skd';
import { pppkPackage } from './pppk';
import { polriPackage } from './polri';
import { tniPackage } from './tni';
import type { ExamPackage } from './types';

export * from './types';

export const allPackages: ExamPackage[] = [
  cpnsSkdPackage,
  pppkPackage,
  polriPackage,
  tniPackage
];

export function getExamPackageBySlug(slug: string): ExamPackage | undefined {
  return allPackages.find((pkg) => pkg.slug === slug);
}

export function getAllExamPackages(): ExamPackage[] {
  return allPackages;
}

export class AliasData {
  name = '';
  nickName = '';
  payerId = '';
  cloudId = '';
}

export class SavingPlansData {
  hourlyCommitmentToPurchase = '';
  accountId = '';
  estimatedHourlySavingsAmount = '';
  estimatedSavingsPercentage = '';
  instanceFamily = '';
  paymentOption = '';
  region = '';
  termInYears = '';
}

export class SavingPlanExcel {
  accountId = ''
  currentAverageHourlyOnDemandSpend = '';
  currentMaximumHourlyOnDemandSpend = '';
  currentMinimumHourlyOnDemandSpend = '';
  estimatedAverageUtilization = '';
  estimatedHourlySavingsAmount ='';
  estimatedMonthlySavingsAmount = '';
  estimatedOnDemandCost = '';
  estimatedROI = '';
  estimatedSPCost = '';
  estimatedSavingsPercentage = '';
  hourlyCommitmentToPurchase = '';
  instanceFamily = '';
  offeringId = '';
  paymentOption = '';
  region ='';
  termInYears = '';
}

export class RightsizingData {
  accountId = '';
  CPU = '';
  estimatedSavings = '';
  finding = '';
  findingReason: string[] = [];
  instanceType = '';
  platformDifferent = '';
  recommendationInstance: string[] = [];
  resourceId = '';
}

export class RightsizingExcel {
  accountId = '';
  resourceId = '';
  findingReasonCodes = '';
  instanceName = '';
  instanceType = '';
  platform = '';
  region = '';
  'aws:createdBy': string[] = [];
  'user:Name': string[] = [];
  totalRunningHours = '';
  reservationCoveredHours = '';
  onDemandHours = '';
  savingsPlansCoveredHours = '';
  maxCpuUtilizationPercentage = '';
  maxMemoryUtilizationPercentage = '';
  maxStorageUtilizationPercentage = '';
  ebsReadOpsPerSecond = '';
  ebsWriteOpsPerSecond = '';
  ebsReadBytesPerSecond = '';
}

export class RiFormData {
  accountIds: string[] = [];
  type = 'RI';
  service = service[0].value;
  termInYear = termInYear[0].value;
  paymentOption = paymentOption[0].value;
  lookBackPeriodInDays = lookBackPeriodInDays[0].value;
  offeringClass ?= offeringClass[0].value;
}

export class RiResponse {
  summary: RiResSummary = new RiResSummary;
  detail: { [key: string]: any }[] = [];
  export: { [key: string]: any }[] = [];
}

export class RiResSummary {
  estimatedAnnualSavings = 0;
  savingsVSOnDemand = 0;
  purchaseRecommendation = 0;
}

export class RiDetail {
  accountId = '';
  expectedRIUtilization = '';
  upfrontCost: string | number = '';
  recurringMonthlyCost = '';
  estimatedMonthlySavingsAmount: string | number = '';
  recommendedNormalizedUnitsToPurchase = '';
  recommendedNumberOfInstancesToPurchase: string | number = '';
  instanceDetail: { [key: string]: any } = {};
  instanceType ?= '';
}

export enum ServiceType {
  EC2 = 'Amazon Elastic Compute Cloud - Compute',
  RDS = 'Amazon Relational Database Service',
  Redshift = 'Amazon Redshift',
  ElastiCache = 'Amazon ElastiCache',
  OS = 'Amazon OpenSearch Service',
}

export const service = [
  {
    value: ServiceType.EC2,
    name: 'Elastic Compute Cloud (EC2)',
    shortName: 'EC2'
  },
  {
    value: ServiceType.RDS,
    name: 'Relational Database Service (RDS)',
    shortName: 'RDS'
  },
  {
    value: ServiceType.Redshift,
    name: 'Redshift',
    shortName: 'Redshift'
  },
  {
    value: ServiceType.ElastiCache,
    name: 'ElastiCache',
    shortName: 'ElastiCache'
  },
  {
    value: ServiceType.OS,
    name: 'OpenSearch Service (OS)',
    shortName: 'OS'
  },
];

export const termInYear = [
  { value: 'ONE_YEAR', name: 'one year' },
  { value: 'THREE_YEARS', name: 'three years' },
];

export const paymentOption = [
  { value: 'ALL_UPFRONT', name: 'all upfront' },
  { value: 'PARTIAL_UPFRONT', name: 'partial upfront' },
  { value: 'NO_UPFRONT', name: 'no upfront' },
];

export const lookBackPeriodInDays = [
  { value: 'SEVEN_DAYS', name: 'seven days' },
  { value: 'THIRTY_DAYS', name: 'thirty days' },
  { value: 'SIXTY_DAYS', name: 'sixty days' },
];

export const offeringClass = [
  { value: 'STANDARD', name: 'standard' },
  { value: 'CONVERTIBLE', name: 'convertible' },
];

/** 排序下拉選單選項 */
export const sortOptions = [
  'estimatedMonthlySavingsAmount',          // 預估每月可省下的費用
  'upfrontCost',                            // 預付 RI 成本
  'recommendedNumberOfInstancesToPurchase', // 購買建議
  'instanceType',                           // 執行個體類型
  'accountId'                               // Linked Account
];

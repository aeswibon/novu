import { StepTypeEnum } from '@novu/shared';

export const AUTOCOMPLETE_PASSWORD_MANAGERS_OFF = {
  autoComplete: 'off',
  'data-1p-ignore': true,
  'data-form-type': 'other',
};

export const INLINE_CONFIGURABLE_STEP_TYPES: readonly StepTypeEnum[] = [StepTypeEnum.DELAY, StepTypeEnum.DIGEST];

export const TEMPLATE_CONFIGURABLE_STEP_TYPES: readonly StepTypeEnum[] = [
  StepTypeEnum.IN_APP,
  StepTypeEnum.EMAIL,
  StepTypeEnum.SMS,
  StepTypeEnum.CHAT,
  StepTypeEnum.PUSH,
];

export const STEP_TYPE_LABELS: Record<StepTypeEnum, string> = {
  [StepTypeEnum.EMAIL]: 'Email',
  [StepTypeEnum.SMS]: 'SMS',
  [StepTypeEnum.IN_APP]: 'In-App',
  [StepTypeEnum.CHAT]: 'Chat',
  [StepTypeEnum.PUSH]: 'Push',
  [StepTypeEnum.DIGEST]: 'Digest',
  [StepTypeEnum.DELAY]: 'Delay',
  [StepTypeEnum.TRIGGER]: 'Trigger',
  [StepTypeEnum.CUSTOM]: 'Custom',
};

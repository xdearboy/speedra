export interface SpinnerConfig {
  type: string;
}

export interface ProgressBarConfig {
  width: number;

  complete: string;

  incomplete: string;
}

export interface TransitionConfig {
  duration: number;

  easing: string;
}

export interface AnimationsConfig {
  spinner: SpinnerConfig;
  progressBar: ProgressBarConfig;
  transition: TransitionConfig;
}

export const ANIMATIONS = {
  spinner: {
    type: 'dots',
  },

  progressBar: {
    width: 40,
    complete: '█',
    incomplete: '░',
  },

  transition: {
    duration: 300,
    easing: 'ease-in-out',
  },
} as const satisfies AnimationsConfig;

export type Animations = typeof ANIMATIONS;

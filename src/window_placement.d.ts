export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DisplayLike {
  id?: number | string;
  label?: string;
  bounds: WindowBounds;
}

export interface WindowPlacement {
  version: number;
  displayId?: number | string;
  displayLabel: string;
  displayBounds: WindowBounds;
  bounds: WindowBounds;
  edges: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  anchor: {
    horizontal: 'start' | 'end';
    vertical: 'start' | 'end';
  };
}

export function createWindowPlacement(bounds: WindowBounds, display: DisplayLike): WindowPlacement | undefined;

export function findDisplayForBounds(bounds: WindowBounds, displays: DisplayLike[]): DisplayLike | undefined;

export function resolveWindowBounds(args: {
  savedBounds?: Partial<WindowBounds>;
  savedPlacement?: WindowPlacement;
  displays?: DisplayLike[];
  defaultWidth: number;
  calculateHeight: (width: number) => number;
}): Partial<WindowBounds> & Pick<WindowBounds, 'width' | 'height'>;

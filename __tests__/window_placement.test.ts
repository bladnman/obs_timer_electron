import {
  createWindowPlacement,
  resolveWindowBounds,
} from '../src/window_placement';

const calculateHeight = (width: number) => Math.round(width * 0.3);

function makeDisplay(id: number, bounds: { x: number; y: number; width: number; height: number }) {
  return {
    id,
    label: `Display ${id}`,
    bounds,
  };
}

describe('window placement', () => {
  test('restores bottom-left placement relative to the same display', () => {
    const originalDisplay = makeDisplay(9, { x: 500, y: -1600, width: 2560, height: 1440 });
    const savedBounds = { x: 500, y: -250, width: 300, height: 90 };
    const placement = createWindowPlacement(savedBounds, originalDisplay);

    const movedDisplay = makeDisplay(9, { x: 700, y: -1600, width: 2560, height: 1440 });
    const resolved = resolveWindowBounds({
      savedBounds,
      savedPlacement: placement,
      displays: [movedDisplay],
      defaultWidth: 422,
      calculateHeight,
    });

    expect(resolved).toEqual({
      x: 700,
      y: -250,
      width: 300,
      height: 90,
    });
  });

  test('keeps the bottom edge anchored when restored height changes', () => {
    const display = makeDisplay(3, { x: 0, y: 0, width: 1920, height: 1080 });
    const savedBounds = { x: 0, y: 990, width: 300, height: 90 };
    const placement = createWindowPlacement(savedBounds, display);

    const resolved = resolveWindowBounds({
      savedBounds: { ...savedBounds, width: 400 },
      savedPlacement: placement,
      displays: [display],
      defaultWidth: 422,
      calculateHeight,
    });

    expect(resolved).toEqual({
      x: 0,
      y: 960,
      width: 400,
      height: 120,
    });
  });

  test('derives display-relative placement for legacy saved bounds', () => {
    const display = makeDisplay(4, { x: -1200, y: 0, width: 1200, height: 900 });
    const savedBounds = { x: -1200, y: 810, width: 300, height: 90 };

    const resolved = resolveWindowBounds({
      savedBounds,
      displays: [display],
      defaultWidth: 422,
      calculateHeight,
    });

    expect(resolved).toEqual(savedBounds);
  });

  test('preserves right-edge placement when the window was nearer the right edge', () => {
    const originalDisplay = makeDisplay(5, { x: 0, y: 0, width: 1920, height: 1080 });
    const savedBounds = { x: 1620, y: 990, width: 300, height: 90 };
    const placement = createWindowPlacement(savedBounds, originalDisplay);

    const widerDisplay = makeDisplay(5, { x: 0, y: 0, width: 2560, height: 1440 });
    const resolved = resolveWindowBounds({
      savedBounds,
      savedPlacement: placement,
      displays: [widerDisplay],
      defaultWidth: 422,
      calculateHeight,
    });

    expect(resolved.x).toBe(2260);
    expect(resolved.y).toBe(1350);
  });
});

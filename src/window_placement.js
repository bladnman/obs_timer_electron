function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizePositiveInteger(value, fallback) {
  if (!isFiniteNumber(value) || value <= 0) {
    return fallback;
  }

  return Math.round(value);
}

function normalizeCoordinate(value) {
  if (!isFiniteNumber(value)) {
    return undefined;
  }

  return Math.round(value);
}

function getRectCenter(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

function getIntersectionArea(a, b) {
  const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return xOverlap * yOverlap;
}

function containsPoint(rect, point) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function distanceSquaredToRect(rect, point) {
  const clampedX = Math.max(rect.x, Math.min(point.x, rect.x + rect.width));
  const clampedY = Math.max(rect.y, Math.min(point.y, rect.y + rect.height));
  return (point.x - clampedX) ** 2 + (point.y - clampedY) ** 2;
}

function sameDisplayBounds(a, b) {
  return (
    a &&
    b &&
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height
  );
}

function findDisplayForBounds(bounds, displays) {
  if (!bounds || !Array.isArray(displays) || displays.length === 0) {
    return undefined;
  }

  const bestByIntersection = displays
    .map((display) => ({
      display,
      area: getIntersectionArea(bounds, display.bounds),
    }))
    .sort((a, b) => b.area - a.area)[0];

  if (bestByIntersection && bestByIntersection.area > 0) {
    return bestByIntersection.display;
  }

  const center = getRectCenter(bounds);
  const containingDisplay = displays.find((display) => containsPoint(display.bounds, center));
  if (containingDisplay) {
    return containingDisplay;
  }

  return displays
    .map((display) => ({
      display,
      distance: distanceSquaredToRect(display.bounds, center),
    }))
    .sort((a, b) => a.distance - b.distance)[0]?.display;
}

function findDisplayForPlacement(placement, fallbackBounds, displays) {
  if (!Array.isArray(displays) || displays.length === 0) {
    return undefined;
  }

  if (placement?.displayId !== undefined && placement?.displayId !== null) {
    const matchingId = displays.find((display) => String(display.id) === String(placement.displayId));
    if (matchingId) {
      return matchingId;
    }
  }

  if (placement?.displayBounds) {
    const matchingBounds = displays.find((display) => sameDisplayBounds(display.bounds, placement.displayBounds));
    if (matchingBounds) {
      return matchingBounds;
    }
  }

  return findDisplayForBounds(fallbackBounds, displays) || displays[0];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function clampBoundsToDisplay(bounds, displayBounds) {
  const maxX = displayBounds.x + Math.max(0, displayBounds.width - bounds.width);
  const maxY = displayBounds.y + Math.max(0, displayBounds.height - bounds.height);

  return {
    ...bounds,
    x: clamp(bounds.x, displayBounds.x, maxX),
    y: clamp(bounds.y, displayBounds.y, maxY),
  };
}

function getAnchor(horizontalStart, horizontalEnd) {
  return horizontalStart <= horizontalEnd ? 'start' : 'end';
}

function createWindowPlacement(bounds, display) {
  if (!bounds || !display?.bounds) {
    return undefined;
  }

  const displayBounds = display.bounds;
  const edges = {
    left: bounds.x - displayBounds.x,
    right: displayBounds.x + displayBounds.width - (bounds.x + bounds.width),
    top: bounds.y - displayBounds.y,
    bottom: displayBounds.y + displayBounds.height - (bounds.y + bounds.height),
  };

  return {
    version: 1,
    displayId: display.id,
    displayLabel: display.label || '',
    displayBounds: { ...displayBounds },
    bounds: { ...bounds },
    edges,
    anchor: {
      horizontal: getAnchor(edges.left, edges.right),
      vertical: getAnchor(edges.top, edges.bottom),
    },
  };
}

function normalizeSavedBounds(savedBounds, defaultWidth, calculateHeight) {
  const width = normalizePositiveInteger(savedBounds?.width, defaultWidth);
  const height = calculateHeight(width);
  const x = normalizeCoordinate(savedBounds?.x);
  const y = normalizeCoordinate(savedBounds?.y);

  return {
    width,
    height,
    ...(x !== undefined ? { x } : {}),
    ...(y !== undefined ? { y } : {}),
  };
}

function resolveWindowBounds({ savedBounds, savedPlacement, displays, defaultWidth, calculateHeight }) {
  const normalizedBounds = normalizeSavedBounds(savedBounds, defaultWidth, calculateHeight);
  const hasSavedPosition = normalizedBounds.x !== undefined && normalizedBounds.y !== undefined;

  if (!hasSavedPosition && !savedPlacement) {
    return normalizedBounds;
  }

  const fallbackBounds = hasSavedPosition ? normalizedBounds : savedPlacement?.bounds;
  const display = findDisplayForPlacement(savedPlacement, fallbackBounds, displays);
  if (!display?.bounds) {
    return normalizedBounds;
  }

  const placement = savedPlacement || createWindowPlacement(fallbackBounds, display);
  const displayBounds = display.bounds;
  let x = hasSavedPosition ? normalizedBounds.x : displayBounds.x;
  let y = hasSavedPosition ? normalizedBounds.y : displayBounds.y;

  if (placement?.edges && placement?.anchor) {
    if (placement.anchor.horizontal === 'end') {
      x = displayBounds.x + displayBounds.width - normalizedBounds.width - placement.edges.right;
    } else {
      x = displayBounds.x + placement.edges.left;
    }

    if (placement.anchor.vertical === 'end') {
      y = displayBounds.y + displayBounds.height - normalizedBounds.height - placement.edges.bottom;
    } else {
      y = displayBounds.y + placement.edges.top;
    }
  }

  return clampBoundsToDisplay(
    {
      width: normalizedBounds.width,
      height: normalizedBounds.height,
      x: Math.round(x),
      y: Math.round(y),
    },
    displayBounds
  );
}

module.exports = {
  createWindowPlacement,
  findDisplayForBounds,
  resolveWindowBounds,
};

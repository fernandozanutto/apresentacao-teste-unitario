export function dispatchEvent(node: Node | Window, event: Event): Event {
  node.dispatchEvent(event);
  return event;
}

export function dispatchKeyboardEvent(node: Node, type: string, keyCode: number, target?: Element):
    KeyboardEvent {
  return dispatchEvent(node, createKeyboardEvent(type, keyCode, target)) as KeyboardEvent;
}

export function createKeyboardEvent(type: string, keyCode: number, target?: Element, key?: string) {
  let event = document.createEvent('KeyboardEvent') as any;
  let initEventFn = (event.initKeyEvent || event.initKeyboardEvent).bind(event);
  let originalPreventDefault = event.preventDefault;

  initEventFn(type, true, true, window, 0, 0, 0, 0, 0, keyCode);

  Object.defineProperties(event, {
    keyCode: { get: () => keyCode },
    key: { get: () => key },
    target: { get: () => target }
  });

  event.preventDefault = function() {
    Object.defineProperty(event, 'defaultPrevented', { get: () => true });
    return originalPreventDefault.apply(this, arguments);
  };

  return event;
}

/** Shorthand to dispatch a fake event on a specified node. */
export function dispatchFakeEvent(node: Node | Window, type: string, canBubble?: boolean): Event {
  return dispatchEvent(node, createFakeEvent(type, canBubble));
}

/** Creates a fake event object with any desired event type. */
export function createFakeEvent(type: string, canBubble = false, cancelable = true) {
  const event = document.createEvent('Event');
  event.initEvent(type, canBubble, cancelable);
  return event;
}

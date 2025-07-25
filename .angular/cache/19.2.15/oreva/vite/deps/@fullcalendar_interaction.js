import {
  BASE_OPTION_DEFAULTS,
  ElementDragging,
  ElementScrollController,
  Emitter,
  EventImpl,
  Interaction,
  ScrollController,
  WindowScrollController,
  allowContextMenu,
  allowSelection,
  applyMutationToEventStore,
  applyStyle,
  buildEventApis,
  compareNumbers,
  computeInnerRect,
  computeRect,
  config,
  constrainPoint,
  createDuration,
  createEmptyEventStore,
  createEventInstance,
  createPlugin,
  diffDates,
  diffPoints,
  disableCursor,
  elementClosest,
  elementMatches,
  enableCursor,
  eventTupleToStore,
  getClippingParents,
  getDefaultEventEnd,
  getElSeg,
  getEventTargetViaRoot,
  getRectCenter,
  getRelevantEvents,
  identity,
  interactionSettingsStore,
  interactionSettingsToStore,
  intersectRects,
  isDateSelectionValid,
  isDateSpansEqual,
  isInteractionValid,
  mapHash,
  parseDragMeta,
  parseEventDef,
  pointInsideRect,
  preventContextMenu,
  preventSelection,
  rangeContainsRange,
  refineEventDef,
  removeElement,
  startOfDay,
  triggerDateSelect,
  whenTransitionDone
} from "./chunk-XYHSFZAA.js";
import "./chunk-KBUIKKCC.js";

// node_modules/@fullcalendar/interaction/index.js
config.touchMouseIgnoreWait = 500;
var ignoreMouseDepth = 0;
var listenerCnt = 0;
var isWindowTouchMoveCancelled = false;
var PointerDragging = class {
  constructor(containerEl) {
    this.subjectEl = null;
    this.selector = "";
    this.handleSelector = "";
    this.shouldIgnoreMove = false;
    this.shouldWatchScroll = true;
    this.isDragging = false;
    this.isTouchDragging = false;
    this.wasTouchScroll = false;
    this.handleMouseDown = (ev) => {
      if (!this.shouldIgnoreMouse() && isPrimaryMouseButton(ev) && this.tryStart(ev)) {
        let pev = this.createEventFromMouse(ev, true);
        this.emitter.trigger("pointerdown", pev);
        this.initScrollWatch(pev);
        if (!this.shouldIgnoreMove) {
          document.addEventListener("mousemove", this.handleMouseMove);
        }
        document.addEventListener("mouseup", this.handleMouseUp);
      }
    };
    this.handleMouseMove = (ev) => {
      let pev = this.createEventFromMouse(ev);
      this.recordCoords(pev);
      this.emitter.trigger("pointermove", pev);
    };
    this.handleMouseUp = (ev) => {
      document.removeEventListener("mousemove", this.handleMouseMove);
      document.removeEventListener("mouseup", this.handleMouseUp);
      this.emitter.trigger("pointerup", this.createEventFromMouse(ev));
      this.cleanup();
    };
    this.handleTouchStart = (ev) => {
      if (this.tryStart(ev)) {
        this.isTouchDragging = true;
        let pev = this.createEventFromTouch(ev, true);
        this.emitter.trigger("pointerdown", pev);
        this.initScrollWatch(pev);
        let targetEl = ev.target;
        if (!this.shouldIgnoreMove) {
          targetEl.addEventListener("touchmove", this.handleTouchMove);
        }
        targetEl.addEventListener("touchend", this.handleTouchEnd);
        targetEl.addEventListener("touchcancel", this.handleTouchEnd);
        window.addEventListener("scroll", this.handleTouchScroll, true);
      }
    };
    this.handleTouchMove = (ev) => {
      let pev = this.createEventFromTouch(ev);
      this.recordCoords(pev);
      this.emitter.trigger("pointermove", pev);
    };
    this.handleTouchEnd = (ev) => {
      if (this.isDragging) {
        let targetEl = ev.target;
        targetEl.removeEventListener("touchmove", this.handleTouchMove);
        targetEl.removeEventListener("touchend", this.handleTouchEnd);
        targetEl.removeEventListener("touchcancel", this.handleTouchEnd);
        window.removeEventListener("scroll", this.handleTouchScroll, true);
        this.emitter.trigger("pointerup", this.createEventFromTouch(ev));
        this.cleanup();
        this.isTouchDragging = false;
        startIgnoringMouse();
      }
    };
    this.handleTouchScroll = () => {
      this.wasTouchScroll = true;
    };
    this.handleScroll = (ev) => {
      if (!this.shouldIgnoreMove) {
        let pageX = window.scrollX - this.prevScrollX + this.prevPageX;
        let pageY = window.scrollY - this.prevScrollY + this.prevPageY;
        this.emitter.trigger("pointermove", {
          origEvent: ev,
          isTouch: this.isTouchDragging,
          subjectEl: this.subjectEl,
          pageX,
          pageY,
          deltaX: pageX - this.origPageX,
          deltaY: pageY - this.origPageY
        });
      }
    };
    this.containerEl = containerEl;
    this.emitter = new Emitter();
    containerEl.addEventListener("mousedown", this.handleMouseDown);
    containerEl.addEventListener("touchstart", this.handleTouchStart, {
      passive: true
    });
    listenerCreated();
  }
  destroy() {
    this.containerEl.removeEventListener("mousedown", this.handleMouseDown);
    this.containerEl.removeEventListener("touchstart", this.handleTouchStart, {
      passive: true
    });
    listenerDestroyed();
  }
  tryStart(ev) {
    let subjectEl = this.querySubjectEl(ev);
    let downEl = ev.target;
    if (subjectEl && (!this.handleSelector || elementClosest(downEl, this.handleSelector))) {
      this.subjectEl = subjectEl;
      this.isDragging = true;
      this.wasTouchScroll = false;
      return true;
    }
    return false;
  }
  cleanup() {
    isWindowTouchMoveCancelled = false;
    this.isDragging = false;
    this.subjectEl = null;
    this.destroyScrollWatch();
  }
  querySubjectEl(ev) {
    if (this.selector) {
      return elementClosest(ev.target, this.selector);
    }
    return this.containerEl;
  }
  shouldIgnoreMouse() {
    return ignoreMouseDepth || this.isTouchDragging;
  }
  // can be called by user of this class, to cancel touch-based scrolling for the current drag
  cancelTouchScroll() {
    if (this.isDragging) {
      isWindowTouchMoveCancelled = true;
    }
  }
  // Scrolling that simulates pointermoves
  // ----------------------------------------------------------------------------------------------------
  initScrollWatch(ev) {
    if (this.shouldWatchScroll) {
      this.recordCoords(ev);
      window.addEventListener("scroll", this.handleScroll, true);
    }
  }
  recordCoords(ev) {
    if (this.shouldWatchScroll) {
      this.prevPageX = ev.pageX;
      this.prevPageY = ev.pageY;
      this.prevScrollX = window.scrollX;
      this.prevScrollY = window.scrollY;
    }
  }
  destroyScrollWatch() {
    if (this.shouldWatchScroll) {
      window.removeEventListener("scroll", this.handleScroll, true);
    }
  }
  // Event Normalization
  // ----------------------------------------------------------------------------------------------------
  createEventFromMouse(ev, isFirst) {
    let deltaX = 0;
    let deltaY = 0;
    if (isFirst) {
      this.origPageX = ev.pageX;
      this.origPageY = ev.pageY;
    } else {
      deltaX = ev.pageX - this.origPageX;
      deltaY = ev.pageY - this.origPageY;
    }
    return {
      origEvent: ev,
      isTouch: false,
      subjectEl: this.subjectEl,
      pageX: ev.pageX,
      pageY: ev.pageY,
      deltaX,
      deltaY
    };
  }
  createEventFromTouch(ev, isFirst) {
    let touches = ev.touches;
    let pageX;
    let pageY;
    let deltaX = 0;
    let deltaY = 0;
    if (touches && touches.length) {
      pageX = touches[0].pageX;
      pageY = touches[0].pageY;
    } else {
      pageX = ev.pageX;
      pageY = ev.pageY;
    }
    if (isFirst) {
      this.origPageX = pageX;
      this.origPageY = pageY;
    } else {
      deltaX = pageX - this.origPageX;
      deltaY = pageY - this.origPageY;
    }
    return {
      origEvent: ev,
      isTouch: true,
      subjectEl: this.subjectEl,
      pageX,
      pageY,
      deltaX,
      deltaY
    };
  }
};
function isPrimaryMouseButton(ev) {
  return ev.button === 0 && !ev.ctrlKey;
}
function startIgnoringMouse() {
  ignoreMouseDepth += 1;
  setTimeout(() => {
    ignoreMouseDepth -= 1;
  }, config.touchMouseIgnoreWait);
}
function listenerCreated() {
  listenerCnt += 1;
  if (listenerCnt === 1) {
    window.addEventListener("touchmove", onWindowTouchMove, {
      passive: false
    });
  }
}
function listenerDestroyed() {
  listenerCnt -= 1;
  if (!listenerCnt) {
    window.removeEventListener("touchmove", onWindowTouchMove, {
      passive: false
    });
  }
}
function onWindowTouchMove(ev) {
  if (isWindowTouchMoveCancelled) {
    ev.preventDefault();
  }
}
var ElementMirror = class {
  constructor() {
    this.isVisible = false;
    this.sourceEl = null;
    this.mirrorEl = null;
    this.sourceElRect = null;
    this.parentNode = document.body;
    this.zIndex = 9999;
    this.revertDuration = 0;
  }
  start(sourceEl, pageX, pageY) {
    this.sourceEl = sourceEl;
    this.sourceElRect = this.sourceEl.getBoundingClientRect();
    this.origScreenX = pageX - window.scrollX;
    this.origScreenY = pageY - window.scrollY;
    this.deltaX = 0;
    this.deltaY = 0;
    this.updateElPosition();
  }
  handleMove(pageX, pageY) {
    this.deltaX = pageX - window.scrollX - this.origScreenX;
    this.deltaY = pageY - window.scrollY - this.origScreenY;
    this.updateElPosition();
  }
  // can be called before start
  setIsVisible(bool) {
    if (bool) {
      if (!this.isVisible) {
        if (this.mirrorEl) {
          this.mirrorEl.style.display = "";
        }
        this.isVisible = bool;
        this.updateElPosition();
      }
    } else if (this.isVisible) {
      if (this.mirrorEl) {
        this.mirrorEl.style.display = "none";
      }
      this.isVisible = bool;
    }
  }
  // always async
  stop(needsRevertAnimation, callback) {
    let done = () => {
      this.cleanup();
      callback();
    };
    if (needsRevertAnimation && this.mirrorEl && this.isVisible && this.revertDuration && // if 0, transition won't work
    (this.deltaX || this.deltaY)) {
      this.doRevertAnimation(done, this.revertDuration);
    } else {
      setTimeout(done, 0);
    }
  }
  doRevertAnimation(callback, revertDuration) {
    let mirrorEl = this.mirrorEl;
    let finalSourceElRect = this.sourceEl.getBoundingClientRect();
    mirrorEl.style.transition = "top " + revertDuration + "ms,left " + revertDuration + "ms";
    applyStyle(mirrorEl, {
      left: finalSourceElRect.left,
      top: finalSourceElRect.top
    });
    whenTransitionDone(mirrorEl, () => {
      mirrorEl.style.transition = "";
      callback();
    });
  }
  cleanup() {
    if (this.mirrorEl) {
      removeElement(this.mirrorEl);
      this.mirrorEl = null;
    }
    this.sourceEl = null;
  }
  updateElPosition() {
    if (this.sourceEl && this.isVisible) {
      applyStyle(this.getMirrorEl(), {
        left: this.sourceElRect.left + this.deltaX,
        top: this.sourceElRect.top + this.deltaY
      });
    }
  }
  getMirrorEl() {
    let sourceElRect = this.sourceElRect;
    let mirrorEl = this.mirrorEl;
    if (!mirrorEl) {
      mirrorEl = this.mirrorEl = this.sourceEl.cloneNode(true);
      mirrorEl.style.userSelect = "none";
      mirrorEl.style.webkitUserSelect = "none";
      mirrorEl.style.pointerEvents = "none";
      mirrorEl.classList.add("fc-event-dragging");
      applyStyle(mirrorEl, {
        position: "fixed",
        zIndex: this.zIndex,
        visibility: "",
        boxSizing: "border-box",
        width: sourceElRect.right - sourceElRect.left,
        height: sourceElRect.bottom - sourceElRect.top,
        right: "auto",
        bottom: "auto",
        margin: 0
      });
      this.parentNode.appendChild(mirrorEl);
    }
    return mirrorEl;
  }
};
var ScrollGeomCache = class extends ScrollController {
  constructor(scrollController, doesListening) {
    super();
    this.handleScroll = () => {
      this.scrollTop = this.scrollController.getScrollTop();
      this.scrollLeft = this.scrollController.getScrollLeft();
      this.handleScrollChange();
    };
    this.scrollController = scrollController;
    this.doesListening = doesListening;
    this.scrollTop = this.origScrollTop = scrollController.getScrollTop();
    this.scrollLeft = this.origScrollLeft = scrollController.getScrollLeft();
    this.scrollWidth = scrollController.getScrollWidth();
    this.scrollHeight = scrollController.getScrollHeight();
    this.clientWidth = scrollController.getClientWidth();
    this.clientHeight = scrollController.getClientHeight();
    this.clientRect = this.computeClientRect();
    if (this.doesListening) {
      this.getEventTarget().addEventListener("scroll", this.handleScroll);
    }
  }
  destroy() {
    if (this.doesListening) {
      this.getEventTarget().removeEventListener("scroll", this.handleScroll);
    }
  }
  getScrollTop() {
    return this.scrollTop;
  }
  getScrollLeft() {
    return this.scrollLeft;
  }
  setScrollTop(top) {
    this.scrollController.setScrollTop(top);
    if (!this.doesListening) {
      this.scrollTop = Math.max(Math.min(top, this.getMaxScrollTop()), 0);
      this.handleScrollChange();
    }
  }
  setScrollLeft(top) {
    this.scrollController.setScrollLeft(top);
    if (!this.doesListening) {
      this.scrollLeft = Math.max(Math.min(top, this.getMaxScrollLeft()), 0);
      this.handleScrollChange();
    }
  }
  getClientWidth() {
    return this.clientWidth;
  }
  getClientHeight() {
    return this.clientHeight;
  }
  getScrollWidth() {
    return this.scrollWidth;
  }
  getScrollHeight() {
    return this.scrollHeight;
  }
  handleScrollChange() {
  }
};
var ElementScrollGeomCache = class extends ScrollGeomCache {
  constructor(el, doesListening) {
    super(new ElementScrollController(el), doesListening);
  }
  getEventTarget() {
    return this.scrollController.el;
  }
  computeClientRect() {
    return computeInnerRect(this.scrollController.el);
  }
};
var WindowScrollGeomCache = class extends ScrollGeomCache {
  constructor(doesListening) {
    super(new WindowScrollController(), doesListening);
  }
  getEventTarget() {
    return window;
  }
  computeClientRect() {
    return {
      left: this.scrollLeft,
      right: this.scrollLeft + this.clientWidth,
      top: this.scrollTop,
      bottom: this.scrollTop + this.clientHeight
    };
  }
  // the window is the only scroll object that changes it's rectangle relative
  // to the document's topleft as it scrolls
  handleScrollChange() {
    this.clientRect = this.computeClientRect();
  }
};
var getTime = typeof performance === "function" ? performance.now : Date.now;
var AutoScroller = class {
  constructor() {
    this.isEnabled = true;
    this.scrollQuery = [window, ".fc-scroller"];
    this.edgeThreshold = 50;
    this.maxVelocity = 300;
    this.pointerScreenX = null;
    this.pointerScreenY = null;
    this.isAnimating = false;
    this.scrollCaches = null;
    this.everMovedUp = false;
    this.everMovedDown = false;
    this.everMovedLeft = false;
    this.everMovedRight = false;
    this.animate = () => {
      if (this.isAnimating) {
        let edge = this.computeBestEdge(this.pointerScreenX + window.scrollX, this.pointerScreenY + window.scrollY);
        if (edge) {
          let now = getTime();
          this.handleSide(edge, (now - this.msSinceRequest) / 1e3);
          this.requestAnimation(now);
        } else {
          this.isAnimating = false;
        }
      }
    };
  }
  start(pageX, pageY, scrollStartEl) {
    if (this.isEnabled) {
      this.scrollCaches = this.buildCaches(scrollStartEl);
      this.pointerScreenX = null;
      this.pointerScreenY = null;
      this.everMovedUp = false;
      this.everMovedDown = false;
      this.everMovedLeft = false;
      this.everMovedRight = false;
      this.handleMove(pageX, pageY);
    }
  }
  handleMove(pageX, pageY) {
    if (this.isEnabled) {
      let pointerScreenX = pageX - window.scrollX;
      let pointerScreenY = pageY - window.scrollY;
      let yDelta = this.pointerScreenY === null ? 0 : pointerScreenY - this.pointerScreenY;
      let xDelta = this.pointerScreenX === null ? 0 : pointerScreenX - this.pointerScreenX;
      if (yDelta < 0) {
        this.everMovedUp = true;
      } else if (yDelta > 0) {
        this.everMovedDown = true;
      }
      if (xDelta < 0) {
        this.everMovedLeft = true;
      } else if (xDelta > 0) {
        this.everMovedRight = true;
      }
      this.pointerScreenX = pointerScreenX;
      this.pointerScreenY = pointerScreenY;
      if (!this.isAnimating) {
        this.isAnimating = true;
        this.requestAnimation(getTime());
      }
    }
  }
  stop() {
    if (this.isEnabled) {
      this.isAnimating = false;
      for (let scrollCache of this.scrollCaches) {
        scrollCache.destroy();
      }
      this.scrollCaches = null;
    }
  }
  requestAnimation(now) {
    this.msSinceRequest = now;
    requestAnimationFrame(this.animate);
  }
  handleSide(edge, seconds) {
    let {
      scrollCache
    } = edge;
    let {
      edgeThreshold
    } = this;
    let invDistance = edgeThreshold - edge.distance;
    let velocity = (
      // the closer to the edge, the faster we scroll
      invDistance * invDistance / (edgeThreshold * edgeThreshold) * // quadratic
      this.maxVelocity * seconds
    );
    let sign = 1;
    switch (edge.name) {
      case "left":
        sign = -1;
      // falls through
      case "right":
        scrollCache.setScrollLeft(scrollCache.getScrollLeft() + velocity * sign);
        break;
      case "top":
        sign = -1;
      // falls through
      case "bottom":
        scrollCache.setScrollTop(scrollCache.getScrollTop() + velocity * sign);
        break;
    }
  }
  // left/top are relative to document topleft
  computeBestEdge(left, top) {
    let {
      edgeThreshold
    } = this;
    let bestSide = null;
    let scrollCaches = this.scrollCaches || [];
    for (let scrollCache of scrollCaches) {
      let rect = scrollCache.clientRect;
      let leftDist = left - rect.left;
      let rightDist = rect.right - left;
      let topDist = top - rect.top;
      let bottomDist = rect.bottom - top;
      if (leftDist >= 0 && rightDist >= 0 && topDist >= 0 && bottomDist >= 0) {
        if (topDist <= edgeThreshold && this.everMovedUp && scrollCache.canScrollUp() && (!bestSide || bestSide.distance > topDist)) {
          bestSide = {
            scrollCache,
            name: "top",
            distance: topDist
          };
        }
        if (bottomDist <= edgeThreshold && this.everMovedDown && scrollCache.canScrollDown() && (!bestSide || bestSide.distance > bottomDist)) {
          bestSide = {
            scrollCache,
            name: "bottom",
            distance: bottomDist
          };
        }
        if (leftDist <= edgeThreshold && this.everMovedLeft && scrollCache.canScrollLeft() && (!bestSide || bestSide.distance > leftDist)) {
          bestSide = {
            scrollCache,
            name: "left",
            distance: leftDist
          };
        }
        if (rightDist <= edgeThreshold && this.everMovedRight && scrollCache.canScrollRight() && (!bestSide || bestSide.distance > rightDist)) {
          bestSide = {
            scrollCache,
            name: "right",
            distance: rightDist
          };
        }
      }
    }
    return bestSide;
  }
  buildCaches(scrollStartEl) {
    return this.queryScrollEls(scrollStartEl).map((el) => {
      if (el === window) {
        return new WindowScrollGeomCache(false);
      }
      return new ElementScrollGeomCache(el, false);
    });
  }
  queryScrollEls(scrollStartEl) {
    let els = [];
    for (let query of this.scrollQuery) {
      if (typeof query === "object") {
        els.push(query);
      } else {
        els.push(...Array.prototype.slice.call(scrollStartEl.getRootNode().querySelectorAll(query)));
      }
    }
    return els;
  }
};
var FeaturefulElementDragging = class extends ElementDragging {
  constructor(containerEl, selector) {
    super(containerEl);
    this.containerEl = containerEl;
    this.delay = null;
    this.minDistance = 0;
    this.touchScrollAllowed = true;
    this.mirrorNeedsRevert = false;
    this.isInteracting = false;
    this.isDragging = false;
    this.isDelayEnded = false;
    this.isDistanceSurpassed = false;
    this.delayTimeoutId = null;
    this.onPointerDown = (ev) => {
      if (!this.isDragging) {
        this.isInteracting = true;
        this.isDelayEnded = false;
        this.isDistanceSurpassed = false;
        preventSelection(document.body);
        preventContextMenu(document.body);
        if (!ev.isTouch) {
          ev.origEvent.preventDefault();
        }
        this.emitter.trigger("pointerdown", ev);
        if (this.isInteracting && // not destroyed via pointerdown handler
        !this.pointer.shouldIgnoreMove) {
          this.mirror.setIsVisible(false);
          this.mirror.start(ev.subjectEl, ev.pageX, ev.pageY);
          this.startDelay(ev);
          if (!this.minDistance) {
            this.handleDistanceSurpassed(ev);
          }
        }
      }
    };
    this.onPointerMove = (ev) => {
      if (this.isInteracting) {
        this.emitter.trigger("pointermove", ev);
        if (!this.isDistanceSurpassed) {
          let minDistance = this.minDistance;
          let distanceSq;
          let {
            deltaX,
            deltaY
          } = ev;
          distanceSq = deltaX * deltaX + deltaY * deltaY;
          if (distanceSq >= minDistance * minDistance) {
            this.handleDistanceSurpassed(ev);
          }
        }
        if (this.isDragging) {
          if (ev.origEvent.type !== "scroll") {
            this.mirror.handleMove(ev.pageX, ev.pageY);
            this.autoScroller.handleMove(ev.pageX, ev.pageY);
          }
          this.emitter.trigger("dragmove", ev);
        }
      }
    };
    this.onPointerUp = (ev) => {
      if (this.isInteracting) {
        this.isInteracting = false;
        allowSelection(document.body);
        allowContextMenu(document.body);
        this.emitter.trigger("pointerup", ev);
        if (this.isDragging) {
          this.autoScroller.stop();
          this.tryStopDrag(ev);
        }
        if (this.delayTimeoutId) {
          clearTimeout(this.delayTimeoutId);
          this.delayTimeoutId = null;
        }
      }
    };
    let pointer = this.pointer = new PointerDragging(containerEl);
    pointer.emitter.on("pointerdown", this.onPointerDown);
    pointer.emitter.on("pointermove", this.onPointerMove);
    pointer.emitter.on("pointerup", this.onPointerUp);
    if (selector) {
      pointer.selector = selector;
    }
    this.mirror = new ElementMirror();
    this.autoScroller = new AutoScroller();
  }
  destroy() {
    this.pointer.destroy();
    this.onPointerUp({});
  }
  startDelay(ev) {
    if (typeof this.delay === "number") {
      this.delayTimeoutId = setTimeout(() => {
        this.delayTimeoutId = null;
        this.handleDelayEnd(ev);
      }, this.delay);
    } else {
      this.handleDelayEnd(ev);
    }
  }
  handleDelayEnd(ev) {
    this.isDelayEnded = true;
    this.tryStartDrag(ev);
  }
  handleDistanceSurpassed(ev) {
    this.isDistanceSurpassed = true;
    this.tryStartDrag(ev);
  }
  tryStartDrag(ev) {
    if (this.isDelayEnded && this.isDistanceSurpassed) {
      if (!this.pointer.wasTouchScroll || this.touchScrollAllowed) {
        this.isDragging = true;
        this.mirrorNeedsRevert = false;
        this.autoScroller.start(ev.pageX, ev.pageY, this.containerEl);
        this.emitter.trigger("dragstart", ev);
        if (this.touchScrollAllowed === false) {
          this.pointer.cancelTouchScroll();
        }
      }
    }
  }
  tryStopDrag(ev) {
    this.mirror.stop(this.mirrorNeedsRevert, this.stopDrag.bind(this, ev));
  }
  stopDrag(ev) {
    this.isDragging = false;
    this.emitter.trigger("dragend", ev);
  }
  // fill in the implementations...
  setIgnoreMove(bool) {
    this.pointer.shouldIgnoreMove = bool;
  }
  setMirrorIsVisible(bool) {
    this.mirror.setIsVisible(bool);
  }
  setMirrorNeedsRevert(bool) {
    this.mirrorNeedsRevert = bool;
  }
  setAutoScrollEnabled(bool) {
    this.autoScroller.isEnabled = bool;
  }
};
var OffsetTracker = class {
  constructor(el) {
    this.el = el;
    this.origRect = computeRect(el);
    this.scrollCaches = getClippingParents(el).map((scrollEl) => new ElementScrollGeomCache(scrollEl, true));
  }
  destroy() {
    for (let scrollCache of this.scrollCaches) {
      scrollCache.destroy();
    }
  }
  computeLeft() {
    let left = this.origRect.left;
    for (let scrollCache of this.scrollCaches) {
      left += scrollCache.origScrollLeft - scrollCache.getScrollLeft();
    }
    return left;
  }
  computeTop() {
    let top = this.origRect.top;
    for (let scrollCache of this.scrollCaches) {
      top += scrollCache.origScrollTop - scrollCache.getScrollTop();
    }
    return top;
  }
  isWithinClipping(pageX, pageY) {
    let point = {
      left: pageX,
      top: pageY
    };
    for (let scrollCache of this.scrollCaches) {
      if (!isIgnoredClipping(scrollCache.getEventTarget()) && !pointInsideRect(point, scrollCache.clientRect)) {
        return false;
      }
    }
    return true;
  }
};
function isIgnoredClipping(node) {
  let tagName = node.tagName;
  return tagName === "HTML" || tagName === "BODY";
}
var HitDragging = class {
  constructor(dragging, droppableStore) {
    this.useSubjectCenter = false;
    this.requireInitial = true;
    this.disablePointCheck = false;
    this.initialHit = null;
    this.movingHit = null;
    this.finalHit = null;
    this.handlePointerDown = (ev) => {
      let {
        dragging: dragging2
      } = this;
      this.initialHit = null;
      this.movingHit = null;
      this.finalHit = null;
      this.prepareHits();
      this.processFirstCoord(ev);
      if (this.initialHit || !this.requireInitial) {
        dragging2.setIgnoreMove(false);
        this.emitter.trigger("pointerdown", ev);
      } else {
        dragging2.setIgnoreMove(true);
      }
    };
    this.handleDragStart = (ev) => {
      this.emitter.trigger("dragstart", ev);
      this.handleMove(ev, true);
    };
    this.handleDragMove = (ev) => {
      this.emitter.trigger("dragmove", ev);
      this.handleMove(ev);
    };
    this.handlePointerUp = (ev) => {
      this.releaseHits();
      this.emitter.trigger("pointerup", ev);
    };
    this.handleDragEnd = (ev) => {
      if (this.movingHit) {
        this.emitter.trigger("hitupdate", null, true, ev);
      }
      this.finalHit = this.movingHit;
      this.movingHit = null;
      this.emitter.trigger("dragend", ev);
    };
    this.droppableStore = droppableStore;
    dragging.emitter.on("pointerdown", this.handlePointerDown);
    dragging.emitter.on("dragstart", this.handleDragStart);
    dragging.emitter.on("dragmove", this.handleDragMove);
    dragging.emitter.on("pointerup", this.handlePointerUp);
    dragging.emitter.on("dragend", this.handleDragEnd);
    this.dragging = dragging;
    this.emitter = new Emitter();
  }
  // sets initialHit
  // sets coordAdjust
  processFirstCoord(ev) {
    let origPoint = {
      left: ev.pageX,
      top: ev.pageY
    };
    let adjustedPoint = origPoint;
    let subjectEl = ev.subjectEl;
    let subjectRect;
    if (subjectEl instanceof HTMLElement) {
      subjectRect = computeRect(subjectEl);
      adjustedPoint = constrainPoint(adjustedPoint, subjectRect);
    }
    let initialHit = this.initialHit = this.queryHitForOffset(adjustedPoint.left, adjustedPoint.top);
    if (initialHit) {
      if (this.useSubjectCenter && subjectRect) {
        let slicedSubjectRect = intersectRects(subjectRect, initialHit.rect);
        if (slicedSubjectRect) {
          adjustedPoint = getRectCenter(slicedSubjectRect);
        }
      }
      this.coordAdjust = diffPoints(adjustedPoint, origPoint);
    } else {
      this.coordAdjust = {
        left: 0,
        top: 0
      };
    }
  }
  handleMove(ev, forceHandle) {
    let hit = this.queryHitForOffset(ev.pageX + this.coordAdjust.left, ev.pageY + this.coordAdjust.top);
    if (forceHandle || !isHitsEqual(this.movingHit, hit)) {
      this.movingHit = hit;
      this.emitter.trigger("hitupdate", hit, false, ev);
    }
  }
  prepareHits() {
    this.offsetTrackers = mapHash(this.droppableStore, (interactionSettings) => {
      interactionSettings.component.prepareHits();
      return new OffsetTracker(interactionSettings.el);
    });
  }
  releaseHits() {
    let {
      offsetTrackers
    } = this;
    for (let id in offsetTrackers) {
      offsetTrackers[id].destroy();
    }
    this.offsetTrackers = {};
  }
  queryHitForOffset(offsetLeft, offsetTop) {
    let {
      droppableStore,
      offsetTrackers
    } = this;
    let bestHit = null;
    for (let id in droppableStore) {
      let component = droppableStore[id].component;
      let offsetTracker = offsetTrackers[id];
      if (offsetTracker && // wasn't destroyed mid-drag
      offsetTracker.isWithinClipping(offsetLeft, offsetTop)) {
        let originLeft = offsetTracker.computeLeft();
        let originTop = offsetTracker.computeTop();
        let positionLeft = offsetLeft - originLeft;
        let positionTop = offsetTop - originTop;
        let {
          origRect
        } = offsetTracker;
        let width = origRect.right - origRect.left;
        let height = origRect.bottom - origRect.top;
        if (
          // must be within the element's bounds
          positionLeft >= 0 && positionLeft < width && positionTop >= 0 && positionTop < height
        ) {
          let hit = component.queryHit(positionLeft, positionTop, width, height);
          if (hit && // make sure the hit is within activeRange, meaning it's not a dead cell
          rangeContainsRange(hit.dateProfile.activeRange, hit.dateSpan.range) && // Ensure the component we are querying for the hit is accessibly my the pointer
          // Prevents obscured calendars (ex: under a modal dialog) from accepting hit
          // https://github.com/fullcalendar/fullcalendar/issues/5026
          (this.disablePointCheck || offsetTracker.el.contains(offsetTracker.el.getRootNode().elementFromPoint(
            // add-back origins to get coordinate relative to top-left of window viewport
            positionLeft + originLeft - window.scrollX,
            positionTop + originTop - window.scrollY
          ))) && (!bestHit || hit.layer > bestHit.layer)) {
            hit.componentId = id;
            hit.context = component.context;
            hit.rect.left += originLeft;
            hit.rect.right += originLeft;
            hit.rect.top += originTop;
            hit.rect.bottom += originTop;
            bestHit = hit;
          }
        }
      }
    }
    return bestHit;
  }
};
function isHitsEqual(hit0, hit1) {
  if (!hit0 && !hit1) {
    return true;
  }
  if (Boolean(hit0) !== Boolean(hit1)) {
    return false;
  }
  return isDateSpansEqual(hit0.dateSpan, hit1.dateSpan);
}
function buildDatePointApiWithContext(dateSpan, context) {
  let props = {};
  for (let transform of context.pluginHooks.datePointTransforms) {
    Object.assign(props, transform(dateSpan, context));
  }
  Object.assign(props, buildDatePointApi(dateSpan, context.dateEnv));
  return props;
}
function buildDatePointApi(span, dateEnv) {
  return {
    date: dateEnv.toDate(span.range.start),
    dateStr: dateEnv.formatIso(span.range.start, {
      omitTime: span.allDay
    }),
    allDay: span.allDay
  };
}
var DateClicking = class extends Interaction {
  constructor(settings) {
    super(settings);
    this.handlePointerDown = (pev) => {
      let {
        dragging
      } = this;
      let downEl = pev.origEvent.target;
      dragging.setIgnoreMove(!this.component.isValidDateDownEl(downEl));
    };
    this.handleDragEnd = (ev) => {
      let {
        component
      } = this;
      let {
        pointer
      } = this.dragging;
      if (!pointer.wasTouchScroll) {
        let {
          initialHit,
          finalHit
        } = this.hitDragging;
        if (initialHit && finalHit && isHitsEqual(initialHit, finalHit)) {
          let {
            context
          } = component;
          let arg = Object.assign(Object.assign({}, buildDatePointApiWithContext(initialHit.dateSpan, context)), {
            dayEl: initialHit.dayEl,
            jsEvent: ev.origEvent,
            view: context.viewApi || context.calendarApi.view
          });
          context.emitter.trigger("dateClick", arg);
        }
      }
    };
    this.dragging = new FeaturefulElementDragging(settings.el);
    this.dragging.autoScroller.isEnabled = false;
    let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsToStore(settings));
    hitDragging.emitter.on("pointerdown", this.handlePointerDown);
    hitDragging.emitter.on("dragend", this.handleDragEnd);
  }
  destroy() {
    this.dragging.destroy();
  }
};
var DateSelecting = class extends Interaction {
  constructor(settings) {
    super(settings);
    this.dragSelection = null;
    this.handlePointerDown = (ev) => {
      let {
        component: component2,
        dragging: dragging2
      } = this;
      let {
        options: options2
      } = component2.context;
      let canSelect = options2.selectable && component2.isValidDateDownEl(ev.origEvent.target);
      dragging2.setIgnoreMove(!canSelect);
      dragging2.delay = ev.isTouch ? getComponentTouchDelay$1(component2) : null;
    };
    this.handleDragStart = (ev) => {
      this.component.context.calendarApi.unselect(ev);
    };
    this.handleHitUpdate = (hit, isFinal) => {
      let {
        context
      } = this.component;
      let dragSelection = null;
      let isInvalid = false;
      if (hit) {
        let initialHit = this.hitDragging.initialHit;
        let disallowed = hit.componentId === initialHit.componentId && this.isHitComboAllowed && !this.isHitComboAllowed(initialHit, hit);
        if (!disallowed) {
          dragSelection = joinHitsIntoSelection(initialHit, hit, context.pluginHooks.dateSelectionTransformers);
        }
        if (!dragSelection || !isDateSelectionValid(dragSelection, hit.dateProfile, context)) {
          isInvalid = true;
          dragSelection = null;
        }
      }
      if (dragSelection) {
        context.dispatch({
          type: "SELECT_DATES",
          selection: dragSelection
        });
      } else if (!isFinal) {
        context.dispatch({
          type: "UNSELECT_DATES"
        });
      }
      if (!isInvalid) {
        enableCursor();
      } else {
        disableCursor();
      }
      if (!isFinal) {
        this.dragSelection = dragSelection;
      }
    };
    this.handlePointerUp = (pev) => {
      if (this.dragSelection) {
        triggerDateSelect(this.dragSelection, pev, this.component.context);
        this.dragSelection = null;
      }
    };
    let {
      component
    } = settings;
    let {
      options
    } = component.context;
    let dragging = this.dragging = new FeaturefulElementDragging(settings.el);
    dragging.touchScrollAllowed = false;
    dragging.minDistance = options.selectMinDistance || 0;
    dragging.autoScroller.isEnabled = options.dragScroll;
    let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsToStore(settings));
    hitDragging.emitter.on("pointerdown", this.handlePointerDown);
    hitDragging.emitter.on("dragstart", this.handleDragStart);
    hitDragging.emitter.on("hitupdate", this.handleHitUpdate);
    hitDragging.emitter.on("pointerup", this.handlePointerUp);
  }
  destroy() {
    this.dragging.destroy();
  }
};
function getComponentTouchDelay$1(component) {
  let {
    options
  } = component.context;
  let delay = options.selectLongPressDelay;
  if (delay == null) {
    delay = options.longPressDelay;
  }
  return delay;
}
function joinHitsIntoSelection(hit0, hit1, dateSelectionTransformers) {
  let dateSpan0 = hit0.dateSpan;
  let dateSpan1 = hit1.dateSpan;
  let ms = [dateSpan0.range.start, dateSpan0.range.end, dateSpan1.range.start, dateSpan1.range.end];
  ms.sort(compareNumbers);
  let props = {};
  for (let transformer of dateSelectionTransformers) {
    let res = transformer(hit0, hit1);
    if (res === false) {
      return null;
    }
    if (res) {
      Object.assign(props, res);
    }
  }
  props.range = {
    start: ms[0],
    end: ms[3]
  };
  props.allDay = dateSpan0.allDay;
  return props;
}
var EventDragging = class _EventDragging extends Interaction {
  constructor(settings) {
    super(settings);
    this.subjectEl = null;
    this.subjectSeg = null;
    this.isDragging = false;
    this.eventRange = null;
    this.relevantEvents = null;
    this.receivingContext = null;
    this.validMutation = null;
    this.mutatedRelevantEvents = null;
    this.handlePointerDown = (ev) => {
      let origTarget = ev.origEvent.target;
      let {
        component: component2,
        dragging: dragging2
      } = this;
      let {
        mirror
      } = dragging2;
      let {
        options: options2
      } = component2.context;
      let initialContext = component2.context;
      this.subjectEl = ev.subjectEl;
      let subjectSeg = this.subjectSeg = getElSeg(ev.subjectEl);
      let eventRange = this.eventRange = subjectSeg.eventRange;
      let eventInstanceId = eventRange.instance.instanceId;
      this.relevantEvents = getRelevantEvents(initialContext.getCurrentData().eventStore, eventInstanceId);
      dragging2.minDistance = ev.isTouch ? 0 : options2.eventDragMinDistance;
      dragging2.delay = // only do a touch delay if touch and this event hasn't been selected yet
      ev.isTouch && eventInstanceId !== component2.props.eventSelection ? getComponentTouchDelay(component2) : null;
      if (options2.fixedMirrorParent) {
        mirror.parentNode = options2.fixedMirrorParent;
      } else {
        mirror.parentNode = elementClosest(origTarget, ".fc");
      }
      mirror.revertDuration = options2.dragRevertDuration;
      let isValid = component2.isValidSegDownEl(origTarget) && !elementClosest(origTarget, ".fc-event-resizer");
      dragging2.setIgnoreMove(!isValid);
      this.isDragging = isValid && ev.subjectEl.classList.contains("fc-event-draggable");
    };
    this.handleDragStart = (ev) => {
      let initialContext = this.component.context;
      let eventRange = this.eventRange;
      let eventInstanceId = eventRange.instance.instanceId;
      if (ev.isTouch) {
        if (eventInstanceId !== this.component.props.eventSelection) {
          initialContext.dispatch({
            type: "SELECT_EVENT",
            eventInstanceId
          });
        }
      } else {
        initialContext.dispatch({
          type: "UNSELECT_EVENT"
        });
      }
      if (this.isDragging) {
        initialContext.calendarApi.unselect(ev);
        initialContext.emitter.trigger("eventDragStart", {
          el: this.subjectEl,
          event: new EventImpl(initialContext, eventRange.def, eventRange.instance),
          jsEvent: ev.origEvent,
          view: initialContext.viewApi
        });
      }
    };
    this.handleHitUpdate = (hit, isFinal) => {
      if (!this.isDragging) {
        return;
      }
      let relevantEvents = this.relevantEvents;
      let initialHit = this.hitDragging.initialHit;
      let initialContext = this.component.context;
      let receivingContext = null;
      let mutation = null;
      let mutatedRelevantEvents = null;
      let isInvalid = false;
      let interaction = {
        affectedEvents: relevantEvents,
        mutatedEvents: createEmptyEventStore(),
        isEvent: true
      };
      if (hit) {
        receivingContext = hit.context;
        let receivingOptions = receivingContext.options;
        if (initialContext === receivingContext || receivingOptions.editable && receivingOptions.droppable) {
          mutation = computeEventMutation(initialHit, hit, this.eventRange.instance.range.start, receivingContext.getCurrentData().pluginHooks.eventDragMutationMassagers);
          if (mutation) {
            mutatedRelevantEvents = applyMutationToEventStore(relevantEvents, receivingContext.getCurrentData().eventUiBases, mutation, receivingContext);
            interaction.mutatedEvents = mutatedRelevantEvents;
            if (!isInteractionValid(interaction, hit.dateProfile, receivingContext)) {
              isInvalid = true;
              mutation = null;
              mutatedRelevantEvents = null;
              interaction.mutatedEvents = createEmptyEventStore();
            }
          }
        } else {
          receivingContext = null;
        }
      }
      this.displayDrag(receivingContext, interaction);
      if (!isInvalid) {
        enableCursor();
      } else {
        disableCursor();
      }
      if (!isFinal) {
        if (initialContext === receivingContext && // TODO: write test for this
        isHitsEqual(initialHit, hit)) {
          mutation = null;
        }
        this.dragging.setMirrorNeedsRevert(!mutation);
        this.dragging.setMirrorIsVisible(!hit || !this.subjectEl.getRootNode().querySelector(".fc-event-mirror"));
        this.receivingContext = receivingContext;
        this.validMutation = mutation;
        this.mutatedRelevantEvents = mutatedRelevantEvents;
      }
    };
    this.handlePointerUp = () => {
      if (!this.isDragging) {
        this.cleanup();
      }
    };
    this.handleDragEnd = (ev) => {
      if (this.isDragging) {
        let initialContext = this.component.context;
        let initialView = initialContext.viewApi;
        let {
          receivingContext,
          validMutation
        } = this;
        let eventDef = this.eventRange.def;
        let eventInstance = this.eventRange.instance;
        let eventApi = new EventImpl(initialContext, eventDef, eventInstance);
        let relevantEvents = this.relevantEvents;
        let mutatedRelevantEvents = this.mutatedRelevantEvents;
        let {
          finalHit
        } = this.hitDragging;
        this.clearDrag();
        initialContext.emitter.trigger("eventDragStop", {
          el: this.subjectEl,
          event: eventApi,
          jsEvent: ev.origEvent,
          view: initialView
        });
        if (validMutation) {
          if (receivingContext === initialContext) {
            let updatedEventApi = new EventImpl(initialContext, mutatedRelevantEvents.defs[eventDef.defId], eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null);
            initialContext.dispatch({
              type: "MERGE_EVENTS",
              eventStore: mutatedRelevantEvents
            });
            let eventChangeArg = {
              oldEvent: eventApi,
              event: updatedEventApi,
              relatedEvents: buildEventApis(mutatedRelevantEvents, initialContext, eventInstance),
              revert() {
                initialContext.dispatch({
                  type: "MERGE_EVENTS",
                  eventStore: relevantEvents
                  // the pre-change data
                });
              }
            };
            let transformed = {};
            for (let transformer of initialContext.getCurrentData().pluginHooks.eventDropTransformers) {
              Object.assign(transformed, transformer(validMutation, initialContext));
            }
            initialContext.emitter.trigger("eventDrop", Object.assign(Object.assign(Object.assign({}, eventChangeArg), transformed), {
              el: ev.subjectEl,
              delta: validMutation.datesDelta,
              jsEvent: ev.origEvent,
              view: initialView
            }));
            initialContext.emitter.trigger("eventChange", eventChangeArg);
          } else if (receivingContext) {
            let eventRemoveArg = {
              event: eventApi,
              relatedEvents: buildEventApis(relevantEvents, initialContext, eventInstance),
              revert() {
                initialContext.dispatch({
                  type: "MERGE_EVENTS",
                  eventStore: relevantEvents
                });
              }
            };
            initialContext.emitter.trigger("eventLeave", Object.assign(Object.assign({}, eventRemoveArg), {
              draggedEl: ev.subjectEl,
              view: initialView
            }));
            initialContext.dispatch({
              type: "REMOVE_EVENTS",
              eventStore: relevantEvents
            });
            initialContext.emitter.trigger("eventRemove", eventRemoveArg);
            let addedEventDef = mutatedRelevantEvents.defs[eventDef.defId];
            let addedEventInstance = mutatedRelevantEvents.instances[eventInstance.instanceId];
            let addedEventApi = new EventImpl(receivingContext, addedEventDef, addedEventInstance);
            receivingContext.dispatch({
              type: "MERGE_EVENTS",
              eventStore: mutatedRelevantEvents
            });
            let eventAddArg = {
              event: addedEventApi,
              relatedEvents: buildEventApis(mutatedRelevantEvents, receivingContext, addedEventInstance),
              revert() {
                receivingContext.dispatch({
                  type: "REMOVE_EVENTS",
                  eventStore: mutatedRelevantEvents
                });
              }
            };
            receivingContext.emitter.trigger("eventAdd", eventAddArg);
            if (ev.isTouch) {
              receivingContext.dispatch({
                type: "SELECT_EVENT",
                eventInstanceId: eventInstance.instanceId
              });
            }
            receivingContext.emitter.trigger("drop", Object.assign(Object.assign({}, buildDatePointApiWithContext(finalHit.dateSpan, receivingContext)), {
              draggedEl: ev.subjectEl,
              jsEvent: ev.origEvent,
              view: finalHit.context.viewApi
            }));
            receivingContext.emitter.trigger("eventReceive", Object.assign(Object.assign({}, eventAddArg), {
              draggedEl: ev.subjectEl,
              view: finalHit.context.viewApi
            }));
          }
        } else {
          initialContext.emitter.trigger("_noEventDrop");
        }
      }
      this.cleanup();
    };
    let {
      component
    } = this;
    let {
      options
    } = component.context;
    let dragging = this.dragging = new FeaturefulElementDragging(settings.el);
    dragging.pointer.selector = _EventDragging.SELECTOR;
    dragging.touchScrollAllowed = false;
    dragging.autoScroller.isEnabled = options.dragScroll;
    let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsStore);
    hitDragging.useSubjectCenter = settings.useEventCenter;
    hitDragging.emitter.on("pointerdown", this.handlePointerDown);
    hitDragging.emitter.on("dragstart", this.handleDragStart);
    hitDragging.emitter.on("hitupdate", this.handleHitUpdate);
    hitDragging.emitter.on("pointerup", this.handlePointerUp);
    hitDragging.emitter.on("dragend", this.handleDragEnd);
  }
  destroy() {
    this.dragging.destroy();
  }
  // render a drag state on the next receivingCalendar
  displayDrag(nextContext, state) {
    let initialContext = this.component.context;
    let prevContext = this.receivingContext;
    if (prevContext && prevContext !== nextContext) {
      if (prevContext === initialContext) {
        prevContext.dispatch({
          type: "SET_EVENT_DRAG",
          state: {
            affectedEvents: state.affectedEvents,
            mutatedEvents: createEmptyEventStore(),
            isEvent: true
          }
        });
      } else {
        prevContext.dispatch({
          type: "UNSET_EVENT_DRAG"
        });
      }
    }
    if (nextContext) {
      nextContext.dispatch({
        type: "SET_EVENT_DRAG",
        state
      });
    }
  }
  clearDrag() {
    let initialCalendar = this.component.context;
    let {
      receivingContext
    } = this;
    if (receivingContext) {
      receivingContext.dispatch({
        type: "UNSET_EVENT_DRAG"
      });
    }
    if (initialCalendar !== receivingContext) {
      initialCalendar.dispatch({
        type: "UNSET_EVENT_DRAG"
      });
    }
  }
  cleanup() {
    this.subjectSeg = null;
    this.isDragging = false;
    this.eventRange = null;
    this.relevantEvents = null;
    this.receivingContext = null;
    this.validMutation = null;
    this.mutatedRelevantEvents = null;
  }
};
EventDragging.SELECTOR = ".fc-event-draggable, .fc-event-resizable";
function computeEventMutation(hit0, hit1, eventInstanceStart, massagers) {
  let dateSpan0 = hit0.dateSpan;
  let dateSpan1 = hit1.dateSpan;
  let date0 = dateSpan0.range.start;
  let date1 = dateSpan1.range.start;
  let standardProps = {};
  if (dateSpan0.allDay !== dateSpan1.allDay) {
    standardProps.allDay = dateSpan1.allDay;
    standardProps.hasEnd = hit1.context.options.allDayMaintainDuration;
    if (dateSpan1.allDay) {
      date0 = startOfDay(eventInstanceStart);
    } else {
      date0 = eventInstanceStart;
    }
  }
  let delta = diffDates(date0, date1, hit0.context.dateEnv, hit0.componentId === hit1.componentId ? hit0.largeUnit : null);
  if (delta.milliseconds) {
    standardProps.allDay = false;
  }
  let mutation = {
    datesDelta: delta,
    standardProps
  };
  for (let massager of massagers) {
    massager(mutation, hit0, hit1);
  }
  return mutation;
}
function getComponentTouchDelay(component) {
  let {
    options
  } = component.context;
  let delay = options.eventLongPressDelay;
  if (delay == null) {
    delay = options.longPressDelay;
  }
  return delay;
}
var EventResizing = class extends Interaction {
  constructor(settings) {
    super(settings);
    this.draggingSegEl = null;
    this.draggingSeg = null;
    this.eventRange = null;
    this.relevantEvents = null;
    this.validMutation = null;
    this.mutatedRelevantEvents = null;
    this.handlePointerDown = (ev) => {
      let {
        component: component2
      } = this;
      let segEl = this.querySegEl(ev);
      let seg = getElSeg(segEl);
      let eventRange = this.eventRange = seg.eventRange;
      this.dragging.minDistance = component2.context.options.eventDragMinDistance;
      this.dragging.setIgnoreMove(!this.component.isValidSegDownEl(ev.origEvent.target) || ev.isTouch && this.component.props.eventSelection !== eventRange.instance.instanceId);
    };
    this.handleDragStart = (ev) => {
      let {
        context
      } = this.component;
      let eventRange = this.eventRange;
      this.relevantEvents = getRelevantEvents(context.getCurrentData().eventStore, this.eventRange.instance.instanceId);
      let segEl = this.querySegEl(ev);
      this.draggingSegEl = segEl;
      this.draggingSeg = getElSeg(segEl);
      context.calendarApi.unselect();
      context.emitter.trigger("eventResizeStart", {
        el: segEl,
        event: new EventImpl(context, eventRange.def, eventRange.instance),
        jsEvent: ev.origEvent,
        view: context.viewApi
      });
    };
    this.handleHitUpdate = (hit, isFinal, ev) => {
      let {
        context
      } = this.component;
      let relevantEvents = this.relevantEvents;
      let initialHit = this.hitDragging.initialHit;
      let eventInstance = this.eventRange.instance;
      let mutation = null;
      let mutatedRelevantEvents = null;
      let isInvalid = false;
      let interaction = {
        affectedEvents: relevantEvents,
        mutatedEvents: createEmptyEventStore(),
        isEvent: true
      };
      if (hit) {
        let disallowed = hit.componentId === initialHit.componentId && this.isHitComboAllowed && !this.isHitComboAllowed(initialHit, hit);
        if (!disallowed) {
          mutation = computeMutation(initialHit, hit, ev.subjectEl.classList.contains("fc-event-resizer-start"), eventInstance.range);
        }
      }
      if (mutation) {
        mutatedRelevantEvents = applyMutationToEventStore(relevantEvents, context.getCurrentData().eventUiBases, mutation, context);
        interaction.mutatedEvents = mutatedRelevantEvents;
        if (!isInteractionValid(interaction, hit.dateProfile, context)) {
          isInvalid = true;
          mutation = null;
          mutatedRelevantEvents = null;
          interaction.mutatedEvents = null;
        }
      }
      if (mutatedRelevantEvents) {
        context.dispatch({
          type: "SET_EVENT_RESIZE",
          state: interaction
        });
      } else {
        context.dispatch({
          type: "UNSET_EVENT_RESIZE"
        });
      }
      if (!isInvalid) {
        enableCursor();
      } else {
        disableCursor();
      }
      if (!isFinal) {
        if (mutation && isHitsEqual(initialHit, hit)) {
          mutation = null;
        }
        this.validMutation = mutation;
        this.mutatedRelevantEvents = mutatedRelevantEvents;
      }
    };
    this.handleDragEnd = (ev) => {
      let {
        context
      } = this.component;
      let eventDef = this.eventRange.def;
      let eventInstance = this.eventRange.instance;
      let eventApi = new EventImpl(context, eventDef, eventInstance);
      let relevantEvents = this.relevantEvents;
      let mutatedRelevantEvents = this.mutatedRelevantEvents;
      context.emitter.trigger("eventResizeStop", {
        el: this.draggingSegEl,
        event: eventApi,
        jsEvent: ev.origEvent,
        view: context.viewApi
      });
      if (this.validMutation) {
        let updatedEventApi = new EventImpl(context, mutatedRelevantEvents.defs[eventDef.defId], eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null);
        context.dispatch({
          type: "MERGE_EVENTS",
          eventStore: mutatedRelevantEvents
        });
        let eventChangeArg = {
          oldEvent: eventApi,
          event: updatedEventApi,
          relatedEvents: buildEventApis(mutatedRelevantEvents, context, eventInstance),
          revert() {
            context.dispatch({
              type: "MERGE_EVENTS",
              eventStore: relevantEvents
              // the pre-change events
            });
          }
        };
        context.emitter.trigger("eventResize", Object.assign(Object.assign({}, eventChangeArg), {
          el: this.draggingSegEl,
          startDelta: this.validMutation.startDelta || createDuration(0),
          endDelta: this.validMutation.endDelta || createDuration(0),
          jsEvent: ev.origEvent,
          view: context.viewApi
        }));
        context.emitter.trigger("eventChange", eventChangeArg);
      } else {
        context.emitter.trigger("_noEventResize");
      }
      this.draggingSeg = null;
      this.relevantEvents = null;
      this.validMutation = null;
    };
    let {
      component
    } = settings;
    let dragging = this.dragging = new FeaturefulElementDragging(settings.el);
    dragging.pointer.selector = ".fc-event-resizer";
    dragging.touchScrollAllowed = false;
    dragging.autoScroller.isEnabled = component.context.options.dragScroll;
    let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsToStore(settings));
    hitDragging.emitter.on("pointerdown", this.handlePointerDown);
    hitDragging.emitter.on("dragstart", this.handleDragStart);
    hitDragging.emitter.on("hitupdate", this.handleHitUpdate);
    hitDragging.emitter.on("dragend", this.handleDragEnd);
  }
  destroy() {
    this.dragging.destroy();
  }
  querySegEl(ev) {
    return elementClosest(ev.subjectEl, ".fc-event");
  }
};
function computeMutation(hit0, hit1, isFromStart, instanceRange) {
  let dateEnv = hit0.context.dateEnv;
  let date0 = hit0.dateSpan.range.start;
  let date1 = hit1.dateSpan.range.start;
  let delta = diffDates(date0, date1, dateEnv, hit0.largeUnit);
  if (isFromStart) {
    if (dateEnv.add(instanceRange.start, delta) < instanceRange.end) {
      return {
        startDelta: delta
      };
    }
  } else if (dateEnv.add(instanceRange.end, delta) > instanceRange.start) {
    return {
      endDelta: delta
    };
  }
  return null;
}
var UnselectAuto = class {
  constructor(context) {
    this.context = context;
    this.isRecentPointerDateSelect = false;
    this.matchesCancel = false;
    this.matchesEvent = false;
    this.onSelect = (selectInfo) => {
      if (selectInfo.jsEvent) {
        this.isRecentPointerDateSelect = true;
      }
    };
    this.onDocumentPointerDown = (pev) => {
      let unselectCancel = this.context.options.unselectCancel;
      let downEl = getEventTargetViaRoot(pev.origEvent);
      this.matchesCancel = !!elementClosest(downEl, unselectCancel);
      this.matchesEvent = !!elementClosest(downEl, EventDragging.SELECTOR);
    };
    this.onDocumentPointerUp = (pev) => {
      let {
        context: context2
      } = this;
      let {
        documentPointer: documentPointer2
      } = this;
      let calendarState = context2.getCurrentData();
      if (!documentPointer2.wasTouchScroll) {
        if (calendarState.dateSelection && // an existing date selection?
        !this.isRecentPointerDateSelect) {
          let unselectAuto = context2.options.unselectAuto;
          if (unselectAuto && (!unselectAuto || !this.matchesCancel)) {
            context2.calendarApi.unselect(pev);
          }
        }
        if (calendarState.eventSelection && // an existing event selected?
        !this.matchesEvent) {
          context2.dispatch({
            type: "UNSELECT_EVENT"
          });
        }
      }
      this.isRecentPointerDateSelect = false;
    };
    let documentPointer = this.documentPointer = new PointerDragging(document);
    documentPointer.shouldIgnoreMove = true;
    documentPointer.shouldWatchScroll = false;
    documentPointer.emitter.on("pointerdown", this.onDocumentPointerDown);
    documentPointer.emitter.on("pointerup", this.onDocumentPointerUp);
    context.emitter.on("select", this.onSelect);
  }
  destroy() {
    this.context.emitter.off("select", this.onSelect);
    this.documentPointer.destroy();
  }
};
var OPTION_REFINERS = {
  fixedMirrorParent: identity
};
var LISTENER_REFINERS = {
  dateClick: identity,
  eventDragStart: identity,
  eventDragStop: identity,
  eventDrop: identity,
  eventResizeStart: identity,
  eventResizeStop: identity,
  eventResize: identity,
  drop: identity,
  eventReceive: identity,
  eventLeave: identity
};
var ExternalElementDragging = class {
  constructor(dragging, suppliedDragMeta) {
    this.receivingContext = null;
    this.droppableEvent = null;
    this.suppliedDragMeta = null;
    this.dragMeta = null;
    this.handleDragStart = (ev) => {
      this.dragMeta = this.buildDragMeta(ev.subjectEl);
    };
    this.handleHitUpdate = (hit, isFinal, ev) => {
      let {
        dragging: dragging2
      } = this.hitDragging;
      let receivingContext = null;
      let droppableEvent = null;
      let isInvalid = false;
      let interaction = {
        affectedEvents: createEmptyEventStore(),
        mutatedEvents: createEmptyEventStore(),
        isEvent: this.dragMeta.create
      };
      if (hit) {
        receivingContext = hit.context;
        if (this.canDropElOnCalendar(ev.subjectEl, receivingContext)) {
          droppableEvent = computeEventForDateSpan(hit.dateSpan, this.dragMeta, receivingContext);
          interaction.mutatedEvents = eventTupleToStore(droppableEvent);
          isInvalid = !isInteractionValid(interaction, hit.dateProfile, receivingContext);
          if (isInvalid) {
            interaction.mutatedEvents = createEmptyEventStore();
            droppableEvent = null;
          }
        }
      }
      this.displayDrag(receivingContext, interaction);
      dragging2.setMirrorIsVisible(isFinal || !droppableEvent || !document.querySelector(".fc-event-mirror"));
      if (!isInvalid) {
        enableCursor();
      } else {
        disableCursor();
      }
      if (!isFinal) {
        dragging2.setMirrorNeedsRevert(!droppableEvent);
        this.receivingContext = receivingContext;
        this.droppableEvent = droppableEvent;
      }
    };
    this.handleDragEnd = (pev) => {
      let {
        receivingContext,
        droppableEvent
      } = this;
      this.clearDrag();
      if (receivingContext && droppableEvent) {
        let finalHit = this.hitDragging.finalHit;
        let finalView = finalHit.context.viewApi;
        let dragMeta = this.dragMeta;
        receivingContext.emitter.trigger("drop", Object.assign(Object.assign({}, buildDatePointApiWithContext(finalHit.dateSpan, receivingContext)), {
          draggedEl: pev.subjectEl,
          jsEvent: pev.origEvent,
          view: finalView
        }));
        if (dragMeta.create) {
          let addingEvents = eventTupleToStore(droppableEvent);
          receivingContext.dispatch({
            type: "MERGE_EVENTS",
            eventStore: addingEvents
          });
          if (pev.isTouch) {
            receivingContext.dispatch({
              type: "SELECT_EVENT",
              eventInstanceId: droppableEvent.instance.instanceId
            });
          }
          receivingContext.emitter.trigger("eventReceive", {
            event: new EventImpl(receivingContext, droppableEvent.def, droppableEvent.instance),
            relatedEvents: [],
            revert() {
              receivingContext.dispatch({
                type: "REMOVE_EVENTS",
                eventStore: addingEvents
              });
            },
            draggedEl: pev.subjectEl,
            view: finalView
          });
        }
      }
      this.receivingContext = null;
      this.droppableEvent = null;
    };
    let hitDragging = this.hitDragging = new HitDragging(dragging, interactionSettingsStore);
    hitDragging.requireInitial = false;
    hitDragging.emitter.on("dragstart", this.handleDragStart);
    hitDragging.emitter.on("hitupdate", this.handleHitUpdate);
    hitDragging.emitter.on("dragend", this.handleDragEnd);
    this.suppliedDragMeta = suppliedDragMeta;
  }
  buildDragMeta(subjectEl) {
    if (typeof this.suppliedDragMeta === "object") {
      return parseDragMeta(this.suppliedDragMeta);
    }
    if (typeof this.suppliedDragMeta === "function") {
      return parseDragMeta(this.suppliedDragMeta(subjectEl));
    }
    return getDragMetaFromEl(subjectEl);
  }
  displayDrag(nextContext, state) {
    let prevContext = this.receivingContext;
    if (prevContext && prevContext !== nextContext) {
      prevContext.dispatch({
        type: "UNSET_EVENT_DRAG"
      });
    }
    if (nextContext) {
      nextContext.dispatch({
        type: "SET_EVENT_DRAG",
        state
      });
    }
  }
  clearDrag() {
    if (this.receivingContext) {
      this.receivingContext.dispatch({
        type: "UNSET_EVENT_DRAG"
      });
    }
  }
  canDropElOnCalendar(el, receivingContext) {
    let dropAccept = receivingContext.options.dropAccept;
    if (typeof dropAccept === "function") {
      return dropAccept.call(receivingContext.calendarApi, el);
    }
    if (typeof dropAccept === "string" && dropAccept) {
      return Boolean(elementMatches(el, dropAccept));
    }
    return true;
  }
};
function computeEventForDateSpan(dateSpan, dragMeta, context) {
  let defProps = Object.assign({}, dragMeta.leftoverProps);
  for (let transform of context.pluginHooks.externalDefTransforms) {
    Object.assign(defProps, transform(dateSpan, dragMeta));
  }
  let {
    refined,
    extra
  } = refineEventDef(defProps, context);
  let def = parseEventDef(
    refined,
    extra,
    dragMeta.sourceId,
    dateSpan.allDay,
    context.options.forceEventDuration || Boolean(dragMeta.duration),
    // hasEnd
    context
  );
  let start = dateSpan.range.start;
  if (dateSpan.allDay && dragMeta.startTime) {
    start = context.dateEnv.add(start, dragMeta.startTime);
  }
  let end = dragMeta.duration ? context.dateEnv.add(start, dragMeta.duration) : getDefaultEventEnd(dateSpan.allDay, start, context);
  let instance = createEventInstance(def.defId, {
    start,
    end
  });
  return {
    def,
    instance
  };
}
function getDragMetaFromEl(el) {
  let str = getEmbeddedElData(el, "event");
  let obj = str ? JSON.parse(str) : {
    create: false
  };
  return parseDragMeta(obj);
}
config.dataAttrPrefix = "";
function getEmbeddedElData(el, name) {
  let prefix = config.dataAttrPrefix;
  let prefixedName = (prefix ? prefix + "-" : "") + name;
  return el.getAttribute("data-" + prefixedName) || "";
}
var ExternalDraggable = class {
  constructor(el, settings = {}) {
    this.handlePointerDown = (ev) => {
      let {
        dragging: dragging2
      } = this;
      let {
        minDistance,
        longPressDelay
      } = this.settings;
      dragging2.minDistance = minDistance != null ? minDistance : ev.isTouch ? 0 : BASE_OPTION_DEFAULTS.eventDragMinDistance;
      dragging2.delay = ev.isTouch ? (
        // TODO: eventually read eventLongPressDelay instead vvv
        longPressDelay != null ? longPressDelay : BASE_OPTION_DEFAULTS.longPressDelay
      ) : 0;
    };
    this.handleDragStart = (ev) => {
      if (ev.isTouch && this.dragging.delay && ev.subjectEl.classList.contains("fc-event")) {
        this.dragging.mirror.getMirrorEl().classList.add("fc-event-selected");
      }
    };
    this.settings = settings;
    let dragging = this.dragging = new FeaturefulElementDragging(el);
    dragging.touchScrollAllowed = false;
    if (settings.itemSelector != null) {
      dragging.pointer.selector = settings.itemSelector;
    }
    if (settings.appendTo != null) {
      dragging.mirror.parentNode = settings.appendTo;
    }
    dragging.emitter.on("pointerdown", this.handlePointerDown);
    dragging.emitter.on("dragstart", this.handleDragStart);
    new ExternalElementDragging(dragging, settings.eventData);
  }
  destroy() {
    this.dragging.destroy();
  }
};
var InferredElementDragging = class extends ElementDragging {
  constructor(containerEl) {
    super(containerEl);
    this.shouldIgnoreMove = false;
    this.mirrorSelector = "";
    this.currentMirrorEl = null;
    this.handlePointerDown = (ev) => {
      this.emitter.trigger("pointerdown", ev);
      if (!this.shouldIgnoreMove) {
        this.emitter.trigger("dragstart", ev);
      }
    };
    this.handlePointerMove = (ev) => {
      if (!this.shouldIgnoreMove) {
        this.emitter.trigger("dragmove", ev);
      }
    };
    this.handlePointerUp = (ev) => {
      this.emitter.trigger("pointerup", ev);
      if (!this.shouldIgnoreMove) {
        this.emitter.trigger("dragend", ev);
      }
    };
    let pointer = this.pointer = new PointerDragging(containerEl);
    pointer.emitter.on("pointerdown", this.handlePointerDown);
    pointer.emitter.on("pointermove", this.handlePointerMove);
    pointer.emitter.on("pointerup", this.handlePointerUp);
  }
  destroy() {
    this.pointer.destroy();
  }
  setIgnoreMove(bool) {
    this.shouldIgnoreMove = bool;
  }
  setMirrorIsVisible(bool) {
    if (bool) {
      if (this.currentMirrorEl) {
        this.currentMirrorEl.style.visibility = "";
        this.currentMirrorEl = null;
      }
    } else {
      let mirrorEl = this.mirrorSelector ? document.querySelector(this.mirrorSelector) : null;
      if (mirrorEl) {
        this.currentMirrorEl = mirrorEl;
        mirrorEl.style.visibility = "hidden";
      }
    }
  }
};
var ThirdPartyDraggable = class {
  constructor(containerOrSettings, settings) {
    let containerEl = document;
    if (
      // wish we could just test instanceof EventTarget, but doesn't work in IE11
      containerOrSettings === document || containerOrSettings instanceof Element
    ) {
      containerEl = containerOrSettings;
      settings = settings || {};
    } else {
      settings = containerOrSettings || {};
    }
    let dragging = this.dragging = new InferredElementDragging(containerEl);
    if (typeof settings.itemSelector === "string") {
      dragging.pointer.selector = settings.itemSelector;
    } else if (containerEl === document) {
      dragging.pointer.selector = "[data-event]";
    }
    if (typeof settings.mirrorSelector === "string") {
      dragging.mirrorSelector = settings.mirrorSelector;
    }
    let externalDragging = new ExternalElementDragging(dragging, settings.eventData);
    externalDragging.hitDragging.disablePointCheck = true;
  }
  destroy() {
    this.dragging.destroy();
  }
};
var index = createPlugin({
  name: "@fullcalendar/interaction",
  componentInteractions: [DateClicking, DateSelecting, EventDragging, EventResizing],
  calendarInteractions: [UnselectAuto],
  elementDraggingImpl: FeaturefulElementDragging,
  optionRefiners: OPTION_REFINERS,
  listenerRefiners: LISTENER_REFINERS
});
export {
  ExternalDraggable as Draggable,
  ThirdPartyDraggable,
  index as default
};
//# sourceMappingURL=@fullcalendar_interaction.js.map

import {
  DayTable
} from "./chunk-6RKBVFCT.js";
import "./chunk-T7UM46HU.js";
import {
  BaseComponent,
  BgEvent,
  ContentContainer,
  DateComponent,
  DayCellContainer,
  DayHeader,
  DaySeriesModel,
  DayTableModel,
  MoreLinkContainer,
  NowIndicatorContainer,
  NowTimer,
  PositionCache,
  RefMap,
  SegHierarchy,
  SimpleScrollGrid,
  Slicer,
  Splitter,
  StandardEvent,
  ViewContainer,
  ViewContextType,
  WeekNumberContainer,
  _,
  addDurations,
  asRoughMs,
  binarySearch,
  buildEntryKey,
  buildEventRangeKey,
  buildIsoString,
  buildNavLinkAttrs,
  computeEarliestSegStart,
  createDuration,
  createFormatter,
  createPlugin,
  d,
  diffDays,
  formatIsoTimeString,
  getEntrySpanEnd,
  getSegMeta,
  getStickyFooterScrollbar,
  getStickyHeaderDates,
  groupIntersectingEntries,
  hasBgRendering,
  hasCustomDayCellContent,
  injectStyles,
  intersectRanges,
  memoize,
  multiplyDuration,
  rangeContainsMarker,
  renderFill,
  renderScrollShim,
  sortEventSegs,
  startOfDay,
  wholeDivideDurations,
  y
} from "./chunk-XYHSFZAA.js";
import "./chunk-KBUIKKCC.js";

// node_modules/@fullcalendar/timegrid/internal.js
var AllDaySplitter = class extends Splitter {
  getKeyInfo() {
    return {
      allDay: {},
      timed: {}
    };
  }
  getKeysForDateSpan(dateSpan) {
    if (dateSpan.allDay) {
      return ["allDay"];
    }
    return ["timed"];
  }
  getKeysForEventDef(eventDef) {
    if (!eventDef.allDay) {
      return ["timed"];
    }
    if (hasBgRendering(eventDef)) {
      return ["timed", "allDay"];
    }
    return ["allDay"];
  }
};
var DEFAULT_SLAT_LABEL_FORMAT = createFormatter({
  hour: "numeric",
  minute: "2-digit",
  omitZeroMinute: true,
  meridiem: "short"
});
function TimeColsAxisCell(props) {
  let classNames = ["fc-timegrid-slot", "fc-timegrid-slot-label", props.isLabeled ? "fc-scrollgrid-shrink" : "fc-timegrid-slot-minor"];
  return y(ViewContextType.Consumer, null, (context) => {
    if (!props.isLabeled) {
      return y("td", {
        className: classNames.join(" "),
        "data-time": props.isoTimeStr
      });
    }
    let {
      dateEnv,
      options,
      viewApi
    } = context;
    let labelFormat = (
      // TODO: fully pre-parse
      options.slotLabelFormat == null ? DEFAULT_SLAT_LABEL_FORMAT : Array.isArray(options.slotLabelFormat) ? createFormatter(options.slotLabelFormat[0]) : createFormatter(options.slotLabelFormat)
    );
    let renderProps = {
      level: 0,
      time: props.time,
      date: dateEnv.toDate(props.date),
      view: viewApi,
      text: dateEnv.format(props.date, labelFormat)
    };
    return y(ContentContainer, {
      elTag: "td",
      elClasses: classNames,
      elAttrs: {
        "data-time": props.isoTimeStr
      },
      renderProps,
      generatorName: "slotLabelContent",
      customGenerator: options.slotLabelContent,
      defaultGenerator: renderInnerContent,
      classNameGenerator: options.slotLabelClassNames,
      didMount: options.slotLabelDidMount,
      willUnmount: options.slotLabelWillUnmount
    }, (InnerContent) => y("div", {
      className: "fc-timegrid-slot-label-frame fc-scrollgrid-shrink-frame"
    }, y(InnerContent, {
      elTag: "div",
      elClasses: ["fc-timegrid-slot-label-cushion", "fc-scrollgrid-shrink-cushion"]
    })));
  });
}
function renderInnerContent(props) {
  return props.text;
}
var TimeBodyAxis = class extends BaseComponent {
  render() {
    return this.props.slatMetas.map((slatMeta) => y("tr", {
      key: slatMeta.key
    }, y(TimeColsAxisCell, Object.assign({}, slatMeta))));
  }
};
var DEFAULT_WEEK_NUM_FORMAT = createFormatter({
  week: "short"
});
var AUTO_ALL_DAY_MAX_EVENT_ROWS = 5;
var TimeColsView = class extends DateComponent {
  constructor() {
    super(...arguments);
    this.allDaySplitter = new AllDaySplitter();
    this.headerElRef = d();
    this.rootElRef = d();
    this.scrollerElRef = d();
    this.state = {
      slatCoords: null
    };
    this.handleScrollTopRequest = (scrollTop) => {
      let scrollerEl = this.scrollerElRef.current;
      if (scrollerEl) {
        scrollerEl.scrollTop = scrollTop;
      }
    };
    this.renderHeadAxis = (rowKey, frameHeight = "") => {
      let {
        options
      } = this.context;
      let {
        dateProfile
      } = this.props;
      let range = dateProfile.renderRange;
      let dayCnt = diffDays(range.start, range.end);
      let navLinkAttrs = dayCnt === 1 ? buildNavLinkAttrs(this.context, range.start, "week") : {};
      if (options.weekNumbers && rowKey === "day") {
        return y(WeekNumberContainer, {
          elTag: "th",
          elClasses: ["fc-timegrid-axis", "fc-scrollgrid-shrink"],
          elAttrs: {
            "aria-hidden": true
          },
          date: range.start,
          defaultFormat: DEFAULT_WEEK_NUM_FORMAT
        }, (InnerContent) => y("div", {
          className: ["fc-timegrid-axis-frame", "fc-scrollgrid-shrink-frame", "fc-timegrid-axis-frame-liquid"].join(" "),
          style: {
            height: frameHeight
          }
        }, y(InnerContent, {
          elTag: "a",
          elClasses: ["fc-timegrid-axis-cushion", "fc-scrollgrid-shrink-cushion", "fc-scrollgrid-sync-inner"],
          elAttrs: navLinkAttrs
        })));
      }
      return y("th", {
        "aria-hidden": true,
        className: "fc-timegrid-axis"
      }, y("div", {
        className: "fc-timegrid-axis-frame",
        style: {
          height: frameHeight
        }
      }));
    };
    this.renderTableRowAxis = (rowHeight) => {
      let {
        options,
        viewApi
      } = this.context;
      let renderProps = {
        text: options.allDayText,
        view: viewApi
      };
      return (
        // TODO: make reusable hook. used in list view too
        y(ContentContainer, {
          elTag: "td",
          elClasses: ["fc-timegrid-axis", "fc-scrollgrid-shrink"],
          elAttrs: {
            "aria-hidden": true
          },
          renderProps,
          generatorName: "allDayContent",
          customGenerator: options.allDayContent,
          defaultGenerator: renderAllDayInner,
          classNameGenerator: options.allDayClassNames,
          didMount: options.allDayDidMount,
          willUnmount: options.allDayWillUnmount
        }, (InnerContent) => y("div", {
          className: ["fc-timegrid-axis-frame", "fc-scrollgrid-shrink-frame", rowHeight == null ? " fc-timegrid-axis-frame-liquid" : ""].join(" "),
          style: {
            height: rowHeight
          }
        }, y(InnerContent, {
          elTag: "span",
          elClasses: ["fc-timegrid-axis-cushion", "fc-scrollgrid-shrink-cushion", "fc-scrollgrid-sync-inner"]
        })))
      );
    };
    this.handleSlatCoords = (slatCoords) => {
      this.setState({
        slatCoords
      });
    };
  }
  // rendering
  // ----------------------------------------------------------------------------------------------------
  renderSimpleLayout(headerRowContent, allDayContent, timeContent) {
    let {
      context,
      props
    } = this;
    let sections = [];
    let stickyHeaderDates = getStickyHeaderDates(context.options);
    if (headerRowContent) {
      sections.push({
        type: "header",
        key: "header",
        isSticky: stickyHeaderDates,
        chunk: {
          elRef: this.headerElRef,
          tableClassName: "fc-col-header",
          rowContent: headerRowContent
        }
      });
    }
    if (allDayContent) {
      sections.push({
        type: "body",
        key: "all-day",
        chunk: {
          content: allDayContent
        }
      });
      sections.push({
        type: "body",
        key: "all-day-divider",
        outerContent: (
          // TODO: rename to cellContent so don't need to define <tr>?
          y("tr", {
            role: "presentation",
            className: "fc-scrollgrid-section"
          }, y("td", {
            className: "fc-timegrid-divider " + context.theme.getClass("tableCellShaded")
          }))
        )
      });
    }
    sections.push({
      type: "body",
      key: "body",
      liquid: true,
      expandRows: Boolean(context.options.expandRows),
      chunk: {
        scrollerElRef: this.scrollerElRef,
        content: timeContent
      }
    });
    return y(ViewContainer, {
      elRef: this.rootElRef,
      elClasses: ["fc-timegrid"],
      viewSpec: context.viewSpec
    }, y(SimpleScrollGrid, {
      liquid: !props.isHeightAuto && !props.forPrint,
      collapsibleWidth: props.forPrint,
      cols: [{
        width: "shrink"
      }],
      sections
    }));
  }
  renderHScrollLayout(headerRowContent, allDayContent, timeContent, colCnt, dayMinWidth, slatMetas, slatCoords) {
    let ScrollGrid = this.context.pluginHooks.scrollGridImpl;
    if (!ScrollGrid) {
      throw new Error("No ScrollGrid implementation");
    }
    let {
      context,
      props
    } = this;
    let stickyHeaderDates = !props.forPrint && getStickyHeaderDates(context.options);
    let stickyFooterScrollbar = !props.forPrint && getStickyFooterScrollbar(context.options);
    let sections = [];
    if (headerRowContent) {
      sections.push({
        type: "header",
        key: "header",
        isSticky: stickyHeaderDates,
        syncRowHeights: true,
        chunks: [{
          key: "axis",
          rowContent: (arg) => y("tr", {
            role: "presentation"
          }, this.renderHeadAxis("day", arg.rowSyncHeights[0]))
        }, {
          key: "cols",
          elRef: this.headerElRef,
          tableClassName: "fc-col-header",
          rowContent: headerRowContent
        }]
      });
    }
    if (allDayContent) {
      sections.push({
        type: "body",
        key: "all-day",
        syncRowHeights: true,
        chunks: [{
          key: "axis",
          rowContent: (contentArg) => y("tr", {
            role: "presentation"
          }, this.renderTableRowAxis(contentArg.rowSyncHeights[0]))
        }, {
          key: "cols",
          content: allDayContent
        }]
      });
      sections.push({
        key: "all-day-divider",
        type: "body",
        outerContent: (
          // TODO: rename to cellContent so don't need to define <tr>?
          y("tr", {
            role: "presentation",
            className: "fc-scrollgrid-section"
          }, y("td", {
            colSpan: 2,
            className: "fc-timegrid-divider " + context.theme.getClass("tableCellShaded")
          }))
        )
      });
    }
    let isNowIndicator = context.options.nowIndicator;
    sections.push({
      type: "body",
      key: "body",
      liquid: true,
      expandRows: Boolean(context.options.expandRows),
      chunks: [{
        key: "axis",
        content: (arg) => (
          // TODO: make this now-indicator arrow more DRY with TimeColsContent
          y("div", {
            className: "fc-timegrid-axis-chunk"
          }, y("table", {
            "aria-hidden": true,
            style: {
              height: arg.expandRows ? arg.clientHeight : ""
            }
          }, arg.tableColGroupNode, y("tbody", null, y(TimeBodyAxis, {
            slatMetas
          }))), y("div", {
            className: "fc-timegrid-now-indicator-container"
          }, y(NowTimer, {
            unit: isNowIndicator ? "minute" : "day"
            /* hacky */
          }, (nowDate) => {
            let nowIndicatorTop = isNowIndicator && slatCoords && slatCoords.safeComputeTop(nowDate);
            if (typeof nowIndicatorTop === "number") {
              return y(NowIndicatorContainer, {
                elClasses: ["fc-timegrid-now-indicator-arrow"],
                elStyle: {
                  top: nowIndicatorTop
                },
                isAxis: true,
                date: nowDate
              });
            }
            return null;
          })))
        )
      }, {
        key: "cols",
        scrollerElRef: this.scrollerElRef,
        content: timeContent
      }]
    });
    if (stickyFooterScrollbar) {
      sections.push({
        key: "footer",
        type: "footer",
        isSticky: true,
        chunks: [{
          key: "axis",
          content: renderScrollShim
        }, {
          key: "cols",
          content: renderScrollShim
        }]
      });
    }
    return y(ViewContainer, {
      elRef: this.rootElRef,
      elClasses: ["fc-timegrid"],
      viewSpec: context.viewSpec
    }, y(ScrollGrid, {
      liquid: !props.isHeightAuto && !props.forPrint,
      forPrint: props.forPrint,
      collapsibleWidth: false,
      colGroups: [{
        width: "shrink",
        cols: [{
          width: "shrink"
        }]
      }, {
        cols: [{
          span: colCnt,
          minWidth: dayMinWidth
        }]
      }],
      sections
    }));
  }
  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/
  getAllDayMaxEventProps() {
    let {
      dayMaxEvents,
      dayMaxEventRows
    } = this.context.options;
    if (dayMaxEvents === true || dayMaxEventRows === true) {
      dayMaxEvents = void 0;
      dayMaxEventRows = AUTO_ALL_DAY_MAX_EVENT_ROWS;
    }
    return {
      dayMaxEvents,
      dayMaxEventRows
    };
  }
};
function renderAllDayInner(renderProps) {
  return renderProps.text;
}
var TimeColsSlatsCoords = class {
  constructor(positions, dateProfile, slotDuration) {
    this.positions = positions;
    this.dateProfile = dateProfile;
    this.slotDuration = slotDuration;
  }
  safeComputeTop(date) {
    let {
      dateProfile
    } = this;
    if (rangeContainsMarker(dateProfile.currentRange, date)) {
      let startOfDayDate = startOfDay(date);
      let timeMs = date.valueOf() - startOfDayDate.valueOf();
      if (timeMs >= asRoughMs(dateProfile.slotMinTime) && timeMs < asRoughMs(dateProfile.slotMaxTime)) {
        return this.computeTimeTop(createDuration(timeMs));
      }
    }
    return null;
  }
  // Computes the top coordinate, relative to the bounds of the grid, of the given date.
  // A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
  computeDateTop(when, startOfDayDate) {
    if (!startOfDayDate) {
      startOfDayDate = startOfDay(when);
    }
    return this.computeTimeTop(createDuration(when.valueOf() - startOfDayDate.valueOf()));
  }
  // Computes the top coordinate, relative to the bounds of the grid, of the given time (a Duration).
  // This is a makeshify way to compute the time-top. Assumes all slatMetas dates are uniform.
  // Eventually allow computation with arbirary slat dates.
  computeTimeTop(duration) {
    let {
      positions,
      dateProfile
    } = this;
    let len = positions.els.length;
    let slatCoverage = (duration.milliseconds - asRoughMs(dateProfile.slotMinTime)) / asRoughMs(this.slotDuration);
    let slatIndex;
    let slatRemainder;
    slatCoverage = Math.max(0, slatCoverage);
    slatCoverage = Math.min(len, slatCoverage);
    slatIndex = Math.floor(slatCoverage);
    slatIndex = Math.min(slatIndex, len - 1);
    slatRemainder = slatCoverage - slatIndex;
    return positions.tops[slatIndex] + positions.getHeight(slatIndex) * slatRemainder;
  }
};
var TimeColsSlatsBody = class extends BaseComponent {
  render() {
    let {
      props,
      context
    } = this;
    let {
      options
    } = context;
    let {
      slatElRefs
    } = props;
    return y("tbody", null, props.slatMetas.map((slatMeta, i) => {
      let renderProps = {
        time: slatMeta.time,
        date: context.dateEnv.toDate(slatMeta.date),
        view: context.viewApi
      };
      return y("tr", {
        key: slatMeta.key,
        ref: slatElRefs.createRef(slatMeta.key)
      }, props.axis && y(TimeColsAxisCell, Object.assign({}, slatMeta)), y(ContentContainer, {
        elTag: "td",
        elClasses: ["fc-timegrid-slot", "fc-timegrid-slot-lane", !slatMeta.isLabeled && "fc-timegrid-slot-minor"],
        elAttrs: {
          "data-time": slatMeta.isoTimeStr
        },
        renderProps,
        generatorName: "slotLaneContent",
        customGenerator: options.slotLaneContent,
        classNameGenerator: options.slotLaneClassNames,
        didMount: options.slotLaneDidMount,
        willUnmount: options.slotLaneWillUnmount
      }));
    }));
  }
};
var TimeColsSlats = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.rootElRef = d();
    this.slatElRefs = new RefMap();
  }
  render() {
    let {
      props,
      context
    } = this;
    return y("div", {
      ref: this.rootElRef,
      className: "fc-timegrid-slots"
    }, y("table", {
      "aria-hidden": true,
      className: context.theme.getClass("table"),
      style: {
        minWidth: props.tableMinWidth,
        width: props.clientWidth,
        height: props.minHeight
      }
    }, props.tableColGroupNode, y(TimeColsSlatsBody, {
      slatElRefs: this.slatElRefs,
      axis: props.axis,
      slatMetas: props.slatMetas
    })));
  }
  componentDidMount() {
    this.updateSizing();
  }
  componentDidUpdate() {
    this.updateSizing();
  }
  componentWillUnmount() {
    if (this.props.onCoords) {
      this.props.onCoords(null);
    }
  }
  updateSizing() {
    let {
      context,
      props
    } = this;
    if (props.onCoords && props.clientWidth !== null) {
      let rootEl = this.rootElRef.current;
      if (rootEl.offsetHeight) {
        props.onCoords(new TimeColsSlatsCoords(new PositionCache(this.rootElRef.current, collectSlatEls(this.slatElRefs.currentMap, props.slatMetas), false, true), this.props.dateProfile, context.options.slotDuration));
      }
    }
  }
};
function collectSlatEls(elMap, slatMetas) {
  return slatMetas.map((slatMeta) => elMap[slatMeta.key]);
}
function splitSegsByCol(segs, colCnt) {
  let segsByCol = [];
  let i;
  for (i = 0; i < colCnt; i += 1) {
    segsByCol.push([]);
  }
  if (segs) {
    for (i = 0; i < segs.length; i += 1) {
      segsByCol[segs[i].col].push(segs[i]);
    }
  }
  return segsByCol;
}
function splitInteractionByCol(ui, colCnt) {
  let byRow = [];
  if (!ui) {
    for (let i = 0; i < colCnt; i += 1) {
      byRow[i] = null;
    }
  } else {
    for (let i = 0; i < colCnt; i += 1) {
      byRow[i] = {
        affectedInstances: ui.affectedInstances,
        isEvent: ui.isEvent,
        segs: []
      };
    }
    for (let seg of ui.segs) {
      byRow[seg.col].segs.push(seg);
    }
  }
  return byRow;
}
var TimeColMoreLink = class extends BaseComponent {
  render() {
    let {
      props
    } = this;
    return y(MoreLinkContainer, {
      elClasses: ["fc-timegrid-more-link"],
      elStyle: {
        top: props.top,
        bottom: props.bottom
      },
      allDayDate: null,
      moreCnt: props.hiddenSegs.length,
      allSegs: props.hiddenSegs,
      hiddenSegs: props.hiddenSegs,
      extraDateSpan: props.extraDateSpan,
      dateProfile: props.dateProfile,
      todayRange: props.todayRange,
      popoverContent: () => renderPlainFgSegs(props.hiddenSegs, props),
      defaultGenerator: renderMoreLinkInner,
      forceTimed: true
    }, (InnerContent) => y(InnerContent, {
      elTag: "div",
      elClasses: ["fc-timegrid-more-link-inner", "fc-sticky"]
    }));
  }
};
function renderMoreLinkInner(props) {
  return props.shortText;
}
function buildPositioning(segInputs, strictOrder, maxStackCnt) {
  let hierarchy = new SegHierarchy();
  if (strictOrder != null) {
    hierarchy.strictOrder = strictOrder;
  }
  if (maxStackCnt != null) {
    hierarchy.maxStackCnt = maxStackCnt;
  }
  let hiddenEntries = hierarchy.addSegs(segInputs);
  let hiddenGroups = groupIntersectingEntries(hiddenEntries);
  let web = buildWeb(hierarchy);
  web = stretchWeb(web, 1);
  let segRects = webToRects(web);
  return {
    segRects,
    hiddenGroups
  };
}
function buildWeb(hierarchy) {
  const {
    entriesByLevel
  } = hierarchy;
  const buildNode = cacheable((level, lateral) => level + ":" + lateral, (level, lateral) => {
    let siblingRange = findNextLevelSegs(hierarchy, level, lateral);
    let nextLevelRes = buildNodes(siblingRange, buildNode);
    let entry = entriesByLevel[level][lateral];
    return [
      Object.assign(Object.assign({}, entry), {
        nextLevelNodes: nextLevelRes[0]
      }),
      entry.thickness + nextLevelRes[1]
      // the pressure builds
    ];
  });
  return buildNodes(entriesByLevel.length ? {
    level: 0,
    lateralStart: 0,
    lateralEnd: entriesByLevel[0].length
  } : null, buildNode)[0];
}
function buildNodes(siblingRange, buildNode) {
  if (!siblingRange) {
    return [[], 0];
  }
  let {
    level,
    lateralStart,
    lateralEnd
  } = siblingRange;
  let lateral = lateralStart;
  let pairs = [];
  while (lateral < lateralEnd) {
    pairs.push(buildNode(level, lateral));
    lateral += 1;
  }
  pairs.sort(cmpDescPressures);
  return [
    pairs.map(extractNode),
    pairs[0][1]
    // first item's pressure
  ];
}
function cmpDescPressures(a, b) {
  return b[1] - a[1];
}
function extractNode(a) {
  return a[0];
}
function findNextLevelSegs(hierarchy, subjectLevel, subjectLateral) {
  let {
    levelCoords,
    entriesByLevel
  } = hierarchy;
  let subjectEntry = entriesByLevel[subjectLevel][subjectLateral];
  let afterSubject = levelCoords[subjectLevel] + subjectEntry.thickness;
  let levelCnt = levelCoords.length;
  let level = subjectLevel;
  for (; level < levelCnt && levelCoords[level] < afterSubject; level += 1) ;
  for (; level < levelCnt; level += 1) {
    let entries = entriesByLevel[level];
    let entry;
    let searchIndex = binarySearch(entries, subjectEntry.span.start, getEntrySpanEnd);
    let lateralStart = searchIndex[0] + searchIndex[1];
    let lateralEnd = lateralStart;
    while (
      // loop through entries that horizontally intersect
      (entry = entries[lateralEnd]) && // but not past the whole seg list
      entry.span.start < subjectEntry.span.end
    ) {
      lateralEnd += 1;
    }
    if (lateralStart < lateralEnd) {
      return {
        level,
        lateralStart,
        lateralEnd
      };
    }
  }
  return null;
}
function stretchWeb(topLevelNodes, totalThickness) {
  const stretchNode = cacheable((node, startCoord, prevThickness) => buildEntryKey(node), (node, startCoord, prevThickness) => {
    let {
      nextLevelNodes,
      thickness
    } = node;
    let allThickness = thickness + prevThickness;
    let thicknessFraction = thickness / allThickness;
    let endCoord;
    let newChildren = [];
    if (!nextLevelNodes.length) {
      endCoord = totalThickness;
    } else {
      for (let childNode of nextLevelNodes) {
        if (endCoord === void 0) {
          let res = stretchNode(childNode, startCoord, allThickness);
          endCoord = res[0];
          newChildren.push(res[1]);
        } else {
          let res = stretchNode(childNode, endCoord, 0);
          newChildren.push(res[1]);
        }
      }
    }
    let newThickness = (endCoord - startCoord) * thicknessFraction;
    return [endCoord - newThickness, Object.assign(Object.assign({}, node), {
      thickness: newThickness,
      nextLevelNodes: newChildren
    })];
  });
  return topLevelNodes.map((node) => stretchNode(node, 0, 0)[1]);
}
function webToRects(topLevelNodes) {
  let rects = [];
  const processNode = cacheable((node, levelCoord, stackDepth) => buildEntryKey(node), (node, levelCoord, stackDepth) => {
    let rect = Object.assign(Object.assign({}, node), {
      levelCoord,
      stackDepth,
      stackForward: 0
    });
    rects.push(rect);
    return rect.stackForward = processNodes(node.nextLevelNodes, levelCoord + node.thickness, stackDepth + 1) + 1;
  });
  function processNodes(nodes, levelCoord, stackDepth) {
    let stackForward = 0;
    for (let node of nodes) {
      stackForward = Math.max(processNode(node, levelCoord, stackDepth), stackForward);
    }
    return stackForward;
  }
  processNodes(topLevelNodes, 0, 0);
  return rects;
}
function cacheable(keyFunc, workFunc) {
  const cache = {};
  return (...args) => {
    let key = keyFunc(...args);
    return key in cache ? cache[key] : cache[key] = workFunc(...args);
  };
}
function computeSegVCoords(segs, colDate, slatCoords = null, eventMinHeight = 0) {
  let vcoords = [];
  if (slatCoords) {
    for (let i = 0; i < segs.length; i += 1) {
      let seg = segs[i];
      let spanStart = slatCoords.computeDateTop(seg.start, colDate);
      let spanEnd = Math.max(
        spanStart + (eventMinHeight || 0),
        // :(
        slatCoords.computeDateTop(seg.end, colDate)
      );
      vcoords.push({
        start: Math.round(spanStart),
        end: Math.round(spanEnd)
        //
      });
    }
  }
  return vcoords;
}
function computeFgSegPlacements(segs, segVCoords, eventOrderStrict, eventMaxStack) {
  let segInputs = [];
  let dumbSegs = [];
  for (let i = 0; i < segs.length; i += 1) {
    let vcoords = segVCoords[i];
    if (vcoords) {
      segInputs.push({
        index: i,
        thickness: 1,
        span: vcoords
      });
    } else {
      dumbSegs.push(segs[i]);
    }
  }
  let {
    segRects,
    hiddenGroups
  } = buildPositioning(segInputs, eventOrderStrict, eventMaxStack);
  let segPlacements = [];
  for (let segRect of segRects) {
    segPlacements.push({
      seg: segs[segRect.index],
      rect: segRect
    });
  }
  for (let dumbSeg of dumbSegs) {
    segPlacements.push({
      seg: dumbSeg,
      rect: null
    });
  }
  return {
    segPlacements,
    hiddenGroups
  };
}
var DEFAULT_TIME_FORMAT = createFormatter({
  hour: "numeric",
  minute: "2-digit",
  meridiem: false
});
var TimeColEvent = class extends BaseComponent {
  render() {
    return y(StandardEvent, Object.assign({}, this.props, {
      elClasses: ["fc-timegrid-event", "fc-v-event", this.props.isShort && "fc-timegrid-event-short"],
      defaultTimeFormat: DEFAULT_TIME_FORMAT
    }));
  }
};
var TimeCol = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.sortEventSegs = memoize(sortEventSegs);
  }
  // TODO: memoize event-placement?
  render() {
    let {
      props,
      context
    } = this;
    let {
      options
    } = context;
    let isSelectMirror = options.selectMirror;
    let mirrorSegs = (
      // yuck
      props.eventDrag && props.eventDrag.segs || props.eventResize && props.eventResize.segs || isSelectMirror && props.dateSelectionSegs || []
    );
    let interactionAffectedInstances = (
      // TODO: messy way to compute this
      props.eventDrag && props.eventDrag.affectedInstances || props.eventResize && props.eventResize.affectedInstances || {}
    );
    let sortedFgSegs = this.sortEventSegs(props.fgEventSegs, options.eventOrder);
    return y(DayCellContainer, {
      elTag: "td",
      elRef: props.elRef,
      elClasses: ["fc-timegrid-col", ...props.extraClassNames || []],
      elAttrs: Object.assign({
        role: "gridcell"
      }, props.extraDataAttrs),
      date: props.date,
      dateProfile: props.dateProfile,
      todayRange: props.todayRange,
      extraRenderProps: props.extraRenderProps
    }, (InnerContent) => y("div", {
      className: "fc-timegrid-col-frame"
    }, y("div", {
      className: "fc-timegrid-col-bg"
    }, this.renderFillSegs(props.businessHourSegs, "non-business"), this.renderFillSegs(props.bgEventSegs, "bg-event"), this.renderFillSegs(props.dateSelectionSegs, "highlight")), y("div", {
      className: "fc-timegrid-col-events"
    }, this.renderFgSegs(sortedFgSegs, interactionAffectedInstances, false, false, false)), y("div", {
      className: "fc-timegrid-col-events"
    }, this.renderFgSegs(mirrorSegs, {}, Boolean(props.eventDrag), Boolean(props.eventResize), Boolean(isSelectMirror), "mirror")), y("div", {
      className: "fc-timegrid-now-indicator-container"
    }, this.renderNowIndicator(props.nowIndicatorSegs)), hasCustomDayCellContent(options) && y(InnerContent, {
      elTag: "div",
      elClasses: ["fc-timegrid-col-misc"]
    })));
  }
  renderFgSegs(sortedFgSegs, segIsInvisible, isDragging, isResizing, isDateSelecting, forcedKey) {
    let {
      props
    } = this;
    if (props.forPrint) {
      return renderPlainFgSegs(sortedFgSegs, props);
    }
    return this.renderPositionedFgSegs(sortedFgSegs, segIsInvisible, isDragging, isResizing, isDateSelecting, forcedKey);
  }
  renderPositionedFgSegs(segs, segIsInvisible, isDragging, isResizing, isDateSelecting, forcedKey) {
    let {
      eventMaxStack,
      eventShortHeight,
      eventOrderStrict,
      eventMinHeight
    } = this.context.options;
    let {
      date,
      slatCoords,
      eventSelection,
      todayRange,
      nowDate
    } = this.props;
    let isMirror = isDragging || isResizing || isDateSelecting;
    let segVCoords = computeSegVCoords(segs, date, slatCoords, eventMinHeight);
    let {
      segPlacements,
      hiddenGroups
    } = computeFgSegPlacements(segs, segVCoords, eventOrderStrict, eventMaxStack);
    return y(_, null, this.renderHiddenGroups(hiddenGroups, segs), segPlacements.map((segPlacement) => {
      let {
        seg,
        rect
      } = segPlacement;
      let instanceId = seg.eventRange.instance.instanceId;
      let isVisible = isMirror || Boolean(!segIsInvisible[instanceId] && rect);
      let vStyle = computeSegVStyle(rect && rect.span);
      let hStyle = !isMirror && rect ? this.computeSegHStyle(rect) : {
        left: 0,
        right: 0
      };
      let isInset = Boolean(rect) && rect.stackForward > 0;
      let isShort = Boolean(rect) && rect.span.end - rect.span.start < eventShortHeight;
      return y("div", {
        className: "fc-timegrid-event-harness" + (isInset ? " fc-timegrid-event-harness-inset" : ""),
        key: forcedKey || instanceId,
        style: Object.assign(Object.assign({
          visibility: isVisible ? "" : "hidden"
        }, vStyle), hStyle)
      }, y(TimeColEvent, Object.assign({
        seg,
        isDragging,
        isResizing,
        isDateSelecting,
        isSelected: instanceId === eventSelection,
        isShort
      }, getSegMeta(seg, todayRange, nowDate))));
    }));
  }
  // will already have eventMinHeight applied because segInputs already had it
  renderHiddenGroups(hiddenGroups, segs) {
    let {
      extraDateSpan,
      dateProfile,
      todayRange,
      nowDate,
      eventSelection,
      eventDrag,
      eventResize
    } = this.props;
    return y(_, null, hiddenGroups.map((hiddenGroup) => {
      let positionCss = computeSegVStyle(hiddenGroup.span);
      let hiddenSegs = compileSegsFromEntries(hiddenGroup.entries, segs);
      return y(TimeColMoreLink, {
        key: buildIsoString(computeEarliestSegStart(hiddenSegs)),
        hiddenSegs,
        top: positionCss.top,
        bottom: positionCss.bottom,
        extraDateSpan,
        dateProfile,
        todayRange,
        nowDate,
        eventSelection,
        eventDrag,
        eventResize
      });
    }));
  }
  renderFillSegs(segs, fillType) {
    let {
      props,
      context
    } = this;
    let segVCoords = computeSegVCoords(segs, props.date, props.slatCoords, context.options.eventMinHeight);
    let children = segVCoords.map((vcoords, i) => {
      let seg = segs[i];
      return y("div", {
        key: buildEventRangeKey(seg.eventRange),
        className: "fc-timegrid-bg-harness",
        style: computeSegVStyle(vcoords)
      }, fillType === "bg-event" ? y(BgEvent, Object.assign({
        seg
      }, getSegMeta(seg, props.todayRange, props.nowDate))) : renderFill(fillType));
    });
    return y(_, null, children);
  }
  renderNowIndicator(segs) {
    let {
      slatCoords,
      date
    } = this.props;
    if (!slatCoords) {
      return null;
    }
    return segs.map((seg, i) => y(
      NowIndicatorContainer,
      {
        // key doesn't matter. will only ever be one
        key: i,
        elClasses: ["fc-timegrid-now-indicator-line"],
        elStyle: {
          top: slatCoords.computeDateTop(seg.start, date)
        },
        isAxis: false,
        date
      }
    ));
  }
  computeSegHStyle(segHCoords) {
    let {
      isRtl,
      options
    } = this.context;
    let shouldOverlap = options.slotEventOverlap;
    let nearCoord = segHCoords.levelCoord;
    let farCoord = segHCoords.levelCoord + segHCoords.thickness;
    let left;
    let right;
    if (shouldOverlap) {
      farCoord = Math.min(1, nearCoord + (farCoord - nearCoord) * 2);
    }
    if (isRtl) {
      left = 1 - farCoord;
      right = nearCoord;
    } else {
      left = nearCoord;
      right = 1 - farCoord;
    }
    let props = {
      zIndex: segHCoords.stackDepth + 1,
      left: left * 100 + "%",
      right: right * 100 + "%"
    };
    if (shouldOverlap && !segHCoords.stackForward) {
      props[isRtl ? "marginLeft" : "marginRight"] = 10 * 2;
    }
    return props;
  }
};
function renderPlainFgSegs(sortedFgSegs, {
  todayRange,
  nowDate,
  eventSelection,
  eventDrag,
  eventResize
}) {
  let hiddenInstances = (eventDrag ? eventDrag.affectedInstances : null) || (eventResize ? eventResize.affectedInstances : null) || {};
  return y(_, null, sortedFgSegs.map((seg) => {
    let instanceId = seg.eventRange.instance.instanceId;
    return y("div", {
      key: instanceId,
      style: {
        visibility: hiddenInstances[instanceId] ? "hidden" : ""
      }
    }, y(TimeColEvent, Object.assign({
      seg,
      isDragging: false,
      isResizing: false,
      isDateSelecting: false,
      isSelected: instanceId === eventSelection,
      isShort: false
    }, getSegMeta(seg, todayRange, nowDate))));
  }));
}
function computeSegVStyle(segVCoords) {
  if (!segVCoords) {
    return {
      top: "",
      bottom: ""
    };
  }
  return {
    top: segVCoords.start,
    bottom: -segVCoords.end
  };
}
function compileSegsFromEntries(segEntries, allSegs) {
  return segEntries.map((segEntry) => allSegs[segEntry.index]);
}
var TimeColsContent = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.splitFgEventSegs = memoize(splitSegsByCol);
    this.splitBgEventSegs = memoize(splitSegsByCol);
    this.splitBusinessHourSegs = memoize(splitSegsByCol);
    this.splitNowIndicatorSegs = memoize(splitSegsByCol);
    this.splitDateSelectionSegs = memoize(splitSegsByCol);
    this.splitEventDrag = memoize(splitInteractionByCol);
    this.splitEventResize = memoize(splitInteractionByCol);
    this.rootElRef = d();
    this.cellElRefs = new RefMap();
  }
  render() {
    let {
      props,
      context
    } = this;
    let nowIndicatorTop = context.options.nowIndicator && props.slatCoords && props.slatCoords.safeComputeTop(props.nowDate);
    let colCnt = props.cells.length;
    let fgEventSegsByRow = this.splitFgEventSegs(props.fgEventSegs, colCnt);
    let bgEventSegsByRow = this.splitBgEventSegs(props.bgEventSegs, colCnt);
    let businessHourSegsByRow = this.splitBusinessHourSegs(props.businessHourSegs, colCnt);
    let nowIndicatorSegsByRow = this.splitNowIndicatorSegs(props.nowIndicatorSegs, colCnt);
    let dateSelectionSegsByRow = this.splitDateSelectionSegs(props.dateSelectionSegs, colCnt);
    let eventDragByRow = this.splitEventDrag(props.eventDrag, colCnt);
    let eventResizeByRow = this.splitEventResize(props.eventResize, colCnt);
    return y("div", {
      className: "fc-timegrid-cols",
      ref: this.rootElRef
    }, y("table", {
      role: "presentation",
      style: {
        minWidth: props.tableMinWidth,
        width: props.clientWidth
      }
    }, props.tableColGroupNode, y("tbody", {
      role: "presentation"
    }, y("tr", {
      role: "row"
    }, props.axis && y("td", {
      "aria-hidden": true,
      className: "fc-timegrid-col fc-timegrid-axis"
    }, y("div", {
      className: "fc-timegrid-col-frame"
    }, y("div", {
      className: "fc-timegrid-now-indicator-container"
    }, typeof nowIndicatorTop === "number" && y(NowIndicatorContainer, {
      elClasses: ["fc-timegrid-now-indicator-arrow"],
      elStyle: {
        top: nowIndicatorTop
      },
      isAxis: true,
      date: props.nowDate
    })))), props.cells.map((cell, i) => y(TimeCol, {
      key: cell.key,
      elRef: this.cellElRefs.createRef(cell.key),
      dateProfile: props.dateProfile,
      date: cell.date,
      nowDate: props.nowDate,
      todayRange: props.todayRange,
      extraRenderProps: cell.extraRenderProps,
      extraDataAttrs: cell.extraDataAttrs,
      extraClassNames: cell.extraClassNames,
      extraDateSpan: cell.extraDateSpan,
      fgEventSegs: fgEventSegsByRow[i],
      bgEventSegs: bgEventSegsByRow[i],
      businessHourSegs: businessHourSegsByRow[i],
      nowIndicatorSegs: nowIndicatorSegsByRow[i],
      dateSelectionSegs: dateSelectionSegsByRow[i],
      eventDrag: eventDragByRow[i],
      eventResize: eventResizeByRow[i],
      slatCoords: props.slatCoords,
      eventSelection: props.eventSelection,
      forPrint: props.forPrint
    }))))));
  }
  componentDidMount() {
    this.updateCoords();
  }
  componentDidUpdate() {
    this.updateCoords();
  }
  updateCoords() {
    let {
      props
    } = this;
    if (props.onColCoords && props.clientWidth !== null) {
      props.onColCoords(new PositionCache(
        this.rootElRef.current,
        collectCellEls(this.cellElRefs.currentMap, props.cells),
        true,
        // horizontal
        false
      ));
    }
  }
};
function collectCellEls(elMap, cells) {
  return cells.map((cell) => elMap[cell.key]);
}
var TimeCols = class extends DateComponent {
  constructor() {
    super(...arguments);
    this.processSlotOptions = memoize(processSlotOptions);
    this.state = {
      slatCoords: null
    };
    this.handleRootEl = (el) => {
      if (el) {
        this.context.registerInteractiveComponent(this, {
          el,
          isHitComboAllowed: this.props.isHitComboAllowed
        });
      } else {
        this.context.unregisterInteractiveComponent(this);
      }
    };
    this.handleScrollRequest = (request) => {
      let {
        onScrollTopRequest
      } = this.props;
      let {
        slatCoords
      } = this.state;
      if (onScrollTopRequest && slatCoords) {
        if (request.time) {
          let top = slatCoords.computeTimeTop(request.time);
          top = Math.ceil(top);
          if (top) {
            top += 1;
          }
          onScrollTopRequest(top);
        }
        return true;
      }
      return false;
    };
    this.handleColCoords = (colCoords) => {
      this.colCoords = colCoords;
    };
    this.handleSlatCoords = (slatCoords) => {
      this.setState({
        slatCoords
      });
      if (this.props.onSlatCoords) {
        this.props.onSlatCoords(slatCoords);
      }
    };
  }
  render() {
    let {
      props,
      state
    } = this;
    return y("div", {
      className: "fc-timegrid-body",
      ref: this.handleRootEl,
      style: {
        // these props are important to give this wrapper correct dimensions for interactions
        // TODO: if we set it here, can we avoid giving to inner tables?
        width: props.clientWidth,
        minWidth: props.tableMinWidth
      }
    }, y(TimeColsSlats, {
      axis: props.axis,
      dateProfile: props.dateProfile,
      slatMetas: props.slatMetas,
      clientWidth: props.clientWidth,
      minHeight: props.expandRows ? props.clientHeight : "",
      tableMinWidth: props.tableMinWidth,
      tableColGroupNode: props.axis ? props.tableColGroupNode : null,
      onCoords: this.handleSlatCoords
    }), y(TimeColsContent, {
      cells: props.cells,
      axis: props.axis,
      dateProfile: props.dateProfile,
      businessHourSegs: props.businessHourSegs,
      bgEventSegs: props.bgEventSegs,
      fgEventSegs: props.fgEventSegs,
      dateSelectionSegs: props.dateSelectionSegs,
      eventSelection: props.eventSelection,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize,
      todayRange: props.todayRange,
      nowDate: props.nowDate,
      nowIndicatorSegs: props.nowIndicatorSegs,
      clientWidth: props.clientWidth,
      tableMinWidth: props.tableMinWidth,
      tableColGroupNode: props.tableColGroupNode,
      slatCoords: state.slatCoords,
      onColCoords: this.handleColCoords,
      forPrint: props.forPrint
    }));
  }
  componentDidMount() {
    this.scrollResponder = this.context.createScrollResponder(this.handleScrollRequest);
  }
  componentDidUpdate(prevProps) {
    this.scrollResponder.update(prevProps.dateProfile !== this.props.dateProfile);
  }
  componentWillUnmount() {
    this.scrollResponder.detach();
  }
  queryHit(positionLeft, positionTop) {
    let {
      dateEnv,
      options
    } = this.context;
    let {
      colCoords
    } = this;
    let {
      dateProfile
    } = this.props;
    let {
      slatCoords
    } = this.state;
    let {
      snapDuration,
      snapsPerSlot
    } = this.processSlotOptions(this.props.slotDuration, options.snapDuration);
    let colIndex = colCoords.leftToIndex(positionLeft);
    let slatIndex = slatCoords.positions.topToIndex(positionTop);
    if (colIndex != null && slatIndex != null) {
      let cell = this.props.cells[colIndex];
      let slatTop = slatCoords.positions.tops[slatIndex];
      let slatHeight = slatCoords.positions.getHeight(slatIndex);
      let partial = (positionTop - slatTop) / slatHeight;
      let localSnapIndex = Math.floor(partial * snapsPerSlot);
      let snapIndex = slatIndex * snapsPerSlot + localSnapIndex;
      let dayDate = this.props.cells[colIndex].date;
      let time = addDurations(dateProfile.slotMinTime, multiplyDuration(snapDuration, snapIndex));
      let start = dateEnv.add(dayDate, time);
      let end = dateEnv.add(start, snapDuration);
      return {
        dateProfile,
        dateSpan: Object.assign({
          range: {
            start,
            end
          },
          allDay: false
        }, cell.extraDateSpan),
        dayEl: colCoords.els[colIndex],
        rect: {
          left: colCoords.lefts[colIndex],
          right: colCoords.rights[colIndex],
          top: slatTop,
          bottom: slatTop + slatHeight
        },
        layer: 0
      };
    }
    return null;
  }
};
function processSlotOptions(slotDuration, snapDurationOverride) {
  let snapDuration = snapDurationOverride || slotDuration;
  let snapsPerSlot = wholeDivideDurations(slotDuration, snapDuration);
  if (snapsPerSlot === null) {
    snapDuration = slotDuration;
    snapsPerSlot = 1;
  }
  return {
    snapDuration,
    snapsPerSlot
  };
}
var DayTimeColsSlicer = class extends Slicer {
  sliceRange(range, dayRanges) {
    let segs = [];
    for (let col = 0; col < dayRanges.length; col += 1) {
      let segRange = intersectRanges(range, dayRanges[col]);
      if (segRange) {
        segs.push({
          start: segRange.start,
          end: segRange.end,
          isStart: segRange.start.valueOf() === range.start.valueOf(),
          isEnd: segRange.end.valueOf() === range.end.valueOf(),
          col
        });
      }
    }
    return segs;
  }
};
var DayTimeCols = class extends DateComponent {
  constructor() {
    super(...arguments);
    this.buildDayRanges = memoize(buildDayRanges);
    this.slicer = new DayTimeColsSlicer();
    this.timeColsRef = d();
  }
  render() {
    let {
      props,
      context
    } = this;
    let {
      dateProfile,
      dayTableModel
    } = props;
    let {
      nowIndicator,
      nextDayThreshold
    } = context.options;
    let dayRanges = this.buildDayRanges(dayTableModel, dateProfile, context.dateEnv);
    return y(NowTimer, {
      unit: nowIndicator ? "minute" : "day"
    }, (nowDate, todayRange) => y(TimeCols, Object.assign({
      ref: this.timeColsRef
    }, this.slicer.sliceProps(props, dateProfile, null, context, dayRanges), {
      forPrint: props.forPrint,
      axis: props.axis,
      dateProfile,
      slatMetas: props.slatMetas,
      slotDuration: props.slotDuration,
      cells: dayTableModel.cells[0],
      tableColGroupNode: props.tableColGroupNode,
      tableMinWidth: props.tableMinWidth,
      clientWidth: props.clientWidth,
      clientHeight: props.clientHeight,
      expandRows: props.expandRows,
      nowDate,
      nowIndicatorSegs: nowIndicator && this.slicer.sliceNowDate(nowDate, dateProfile, nextDayThreshold, context, dayRanges),
      todayRange,
      onScrollTopRequest: props.onScrollTopRequest,
      onSlatCoords: props.onSlatCoords
    })));
  }
};
function buildDayRanges(dayTableModel, dateProfile, dateEnv) {
  let ranges = [];
  for (let date of dayTableModel.headerDates) {
    ranges.push({
      start: dateEnv.add(date, dateProfile.slotMinTime),
      end: dateEnv.add(date, dateProfile.slotMaxTime)
    });
  }
  return ranges;
}
var STOCK_SUB_DURATIONS = [{
  hours: 1
}, {
  minutes: 30
}, {
  minutes: 15
}, {
  seconds: 30
}, {
  seconds: 15
}];
function buildSlatMetas(slotMinTime, slotMaxTime, explicitLabelInterval, slotDuration, dateEnv) {
  let dayStart = /* @__PURE__ */ new Date(0);
  let slatTime = slotMinTime;
  let slatIterator = createDuration(0);
  let labelInterval = explicitLabelInterval || computeLabelInterval(slotDuration);
  let metas = [];
  while (asRoughMs(slatTime) < asRoughMs(slotMaxTime)) {
    let date = dateEnv.add(dayStart, slatTime);
    let isLabeled = wholeDivideDurations(slatIterator, labelInterval) !== null;
    metas.push({
      date,
      time: slatTime,
      key: date.toISOString(),
      isoTimeStr: formatIsoTimeString(date),
      isLabeled
    });
    slatTime = addDurations(slatTime, slotDuration);
    slatIterator = addDurations(slatIterator, slotDuration);
  }
  return metas;
}
function computeLabelInterval(slotDuration) {
  let i;
  let labelInterval;
  let slotsPerLabel;
  for (i = STOCK_SUB_DURATIONS.length - 1; i >= 0; i -= 1) {
    labelInterval = createDuration(STOCK_SUB_DURATIONS[i]);
    slotsPerLabel = wholeDivideDurations(labelInterval, slotDuration);
    if (slotsPerLabel !== null && slotsPerLabel > 1) {
      return labelInterval;
    }
  }
  return slotDuration;
}
var DayTimeColsView = class extends TimeColsView {
  constructor() {
    super(...arguments);
    this.buildTimeColsModel = memoize(buildTimeColsModel);
    this.buildSlatMetas = memoize(buildSlatMetas);
  }
  render() {
    let {
      options,
      dateEnv,
      dateProfileGenerator
    } = this.context;
    let {
      props
    } = this;
    let {
      dateProfile
    } = props;
    let dayTableModel = this.buildTimeColsModel(dateProfile, dateProfileGenerator);
    let splitProps = this.allDaySplitter.splitProps(props);
    let slatMetas = this.buildSlatMetas(dateProfile.slotMinTime, dateProfile.slotMaxTime, options.slotLabelInterval, options.slotDuration, dateEnv);
    let {
      dayMinWidth
    } = options;
    let hasAttachedAxis = !dayMinWidth;
    let hasDetachedAxis = dayMinWidth;
    let headerContent = options.dayHeaders && y(DayHeader, {
      dates: dayTableModel.headerDates,
      dateProfile,
      datesRepDistinctDays: true,
      renderIntro: hasAttachedAxis ? this.renderHeadAxis : null
    });
    let allDayContent = options.allDaySlot !== false && ((contentArg) => y(DayTable, Object.assign({}, splitProps.allDay, {
      dateProfile,
      dayTableModel,
      nextDayThreshold: options.nextDayThreshold,
      tableMinWidth: contentArg.tableMinWidth,
      colGroupNode: contentArg.tableColGroupNode,
      renderRowIntro: hasAttachedAxis ? this.renderTableRowAxis : null,
      showWeekNumbers: false,
      expandRows: false,
      headerAlignElRef: this.headerElRef,
      clientWidth: contentArg.clientWidth,
      clientHeight: contentArg.clientHeight,
      forPrint: props.forPrint
    }, this.getAllDayMaxEventProps())));
    let timeGridContent = (contentArg) => y(DayTimeCols, Object.assign({}, splitProps.timed, {
      dayTableModel,
      dateProfile,
      axis: hasAttachedAxis,
      slotDuration: options.slotDuration,
      slatMetas,
      forPrint: props.forPrint,
      tableColGroupNode: contentArg.tableColGroupNode,
      tableMinWidth: contentArg.tableMinWidth,
      clientWidth: contentArg.clientWidth,
      clientHeight: contentArg.clientHeight,
      onSlatCoords: this.handleSlatCoords,
      expandRows: contentArg.expandRows,
      onScrollTopRequest: this.handleScrollTopRequest
    }));
    return hasDetachedAxis ? this.renderHScrollLayout(headerContent, allDayContent, timeGridContent, dayTableModel.colCnt, dayMinWidth, slatMetas, this.state.slatCoords) : this.renderSimpleLayout(headerContent, allDayContent, timeGridContent);
  }
};
function buildTimeColsModel(dateProfile, dateProfileGenerator) {
  let daySeries = new DaySeriesModel(dateProfile.renderRange, dateProfileGenerator);
  return new DayTableModel(daySeries, false);
}
var css_248z = '.fc-v-event{background-color:var(--fc-event-bg-color);border:1px solid var(--fc-event-border-color);display:block}.fc-v-event .fc-event-main{color:var(--fc-event-text-color);height:100%}.fc-v-event .fc-event-main-frame{display:flex;flex-direction:column;height:100%}.fc-v-event .fc-event-time{flex-grow:0;flex-shrink:0;max-height:100%;overflow:hidden}.fc-v-event .fc-event-title-container{flex-grow:1;flex-shrink:1;min-height:0}.fc-v-event .fc-event-title{bottom:0;max-height:100%;overflow:hidden;top:0}.fc-v-event:not(.fc-event-start){border-top-left-radius:0;border-top-right-radius:0;border-top-width:0}.fc-v-event:not(.fc-event-end){border-bottom-left-radius:0;border-bottom-right-radius:0;border-bottom-width:0}.fc-v-event.fc-event-selected:before{left:-10px;right:-10px}.fc-v-event .fc-event-resizer-start{cursor:n-resize}.fc-v-event .fc-event-resizer-end{cursor:s-resize}.fc-v-event:not(.fc-event-selected) .fc-event-resizer{height:var(--fc-event-resizer-thickness);left:0;right:0}.fc-v-event:not(.fc-event-selected) .fc-event-resizer-start{top:calc(var(--fc-event-resizer-thickness)/-2)}.fc-v-event:not(.fc-event-selected) .fc-event-resizer-end{bottom:calc(var(--fc-event-resizer-thickness)/-2)}.fc-v-event.fc-event-selected .fc-event-resizer{left:50%;margin-left:calc(var(--fc-event-resizer-dot-total-width)/-2)}.fc-v-event.fc-event-selected .fc-event-resizer-start{top:calc(var(--fc-event-resizer-dot-total-width)/-2)}.fc-v-event.fc-event-selected .fc-event-resizer-end{bottom:calc(var(--fc-event-resizer-dot-total-width)/-2)}.fc .fc-timegrid .fc-daygrid-body{z-index:2}.fc .fc-timegrid-divider{padding:0 0 2px}.fc .fc-timegrid-body{min-height:100%;position:relative;z-index:1}.fc .fc-timegrid-axis-chunk{position:relative}.fc .fc-timegrid-axis-chunk>table,.fc .fc-timegrid-slots{position:relative;z-index:1}.fc .fc-timegrid-slot{border-bottom:0;height:1.5em}.fc .fc-timegrid-slot:empty:before{content:"\\00a0"}.fc .fc-timegrid-slot-minor{border-top-style:dotted}.fc .fc-timegrid-slot-label-cushion{display:inline-block;white-space:nowrap}.fc .fc-timegrid-slot-label{vertical-align:middle}.fc .fc-timegrid-axis-cushion,.fc .fc-timegrid-slot-label-cushion{padding:0 4px}.fc .fc-timegrid-axis-frame-liquid{height:100%}.fc .fc-timegrid-axis-frame{align-items:center;display:flex;justify-content:flex-end;overflow:hidden}.fc .fc-timegrid-axis-cushion{flex-shrink:0;max-width:60px}.fc-direction-ltr .fc-timegrid-slot-label-frame{text-align:right}.fc-direction-rtl .fc-timegrid-slot-label-frame{text-align:left}.fc-liquid-hack .fc-timegrid-axis-frame-liquid{bottom:0;height:auto;left:0;position:absolute;right:0;top:0}.fc .fc-timegrid-col.fc-day-today{background-color:var(--fc-today-bg-color)}.fc .fc-timegrid-col-frame{min-height:100%;position:relative}.fc-media-screen.fc-liquid-hack .fc-timegrid-col-frame{bottom:0;height:auto;left:0;position:absolute;right:0;top:0}.fc-media-screen .fc-timegrid-cols{bottom:0;left:0;position:absolute;right:0;top:0}.fc-media-screen .fc-timegrid-cols>table{height:100%}.fc-media-screen .fc-timegrid-col-bg,.fc-media-screen .fc-timegrid-col-events,.fc-media-screen .fc-timegrid-now-indicator-container{left:0;position:absolute;right:0;top:0}.fc .fc-timegrid-col-bg{z-index:2}.fc .fc-timegrid-col-bg .fc-non-business{z-index:1}.fc .fc-timegrid-col-bg .fc-bg-event{z-index:2}.fc .fc-timegrid-col-bg .fc-highlight{z-index:3}.fc .fc-timegrid-bg-harness{left:0;position:absolute;right:0}.fc .fc-timegrid-col-events{z-index:3}.fc .fc-timegrid-now-indicator-container{bottom:0;overflow:hidden}.fc-direction-ltr .fc-timegrid-col-events{margin:0 2.5% 0 2px}.fc-direction-rtl .fc-timegrid-col-events{margin:0 2px 0 2.5%}.fc-timegrid-event-harness{position:absolute}.fc-timegrid-event-harness>.fc-timegrid-event{bottom:0;left:0;position:absolute;right:0;top:0}.fc-timegrid-event-harness-inset .fc-timegrid-event,.fc-timegrid-event.fc-event-mirror,.fc-timegrid-more-link{box-shadow:0 0 0 1px var(--fc-page-bg-color)}.fc-timegrid-event,.fc-timegrid-more-link{border-radius:3px;font-size:var(--fc-small-font-size)}.fc-timegrid-event{margin-bottom:1px}.fc-timegrid-event .fc-event-main{padding:1px 1px 0}.fc-timegrid-event .fc-event-time{font-size:var(--fc-small-font-size);margin-bottom:1px;white-space:nowrap}.fc-timegrid-event-short .fc-event-main-frame{flex-direction:row;overflow:hidden}.fc-timegrid-event-short .fc-event-time:after{content:"\\00a0-\\00a0"}.fc-timegrid-event-short .fc-event-title{font-size:var(--fc-small-font-size)}.fc-timegrid-more-link{background:var(--fc-more-link-bg-color);color:var(--fc-more-link-text-color);cursor:pointer;margin-bottom:1px;position:absolute;z-index:9999}.fc-timegrid-more-link-inner{padding:3px 2px;top:0}.fc-direction-ltr .fc-timegrid-more-link{right:0}.fc-direction-rtl .fc-timegrid-more-link{left:0}.fc .fc-timegrid-now-indicator-arrow,.fc .fc-timegrid-now-indicator-line{pointer-events:none}.fc .fc-timegrid-now-indicator-line{border-color:var(--fc-now-indicator-color);border-style:solid;border-width:1px 0 0;left:0;position:absolute;right:0;z-index:4}.fc .fc-timegrid-now-indicator-arrow{border-color:var(--fc-now-indicator-color);border-style:solid;margin-top:-5px;position:absolute;z-index:4}.fc-direction-ltr .fc-timegrid-now-indicator-arrow{border-bottom-color:transparent;border-top-color:transparent;border-width:5px 0 5px 6px;left:0}.fc-direction-rtl .fc-timegrid-now-indicator-arrow{border-bottom-color:transparent;border-top-color:transparent;border-width:5px 6px 5px 0;right:0}';
injectStyles(css_248z);

// node_modules/@fullcalendar/timegrid/index.js
var OPTION_REFINERS = {
  allDaySlot: Boolean
};
var index = createPlugin({
  name: "@fullcalendar/timegrid",
  initialView: "timeGridWeek",
  optionRefiners: OPTION_REFINERS,
  views: {
    timeGrid: {
      component: DayTimeColsView,
      usesMinMaxTime: true,
      allDaySlot: true,
      slotDuration: "00:30:00",
      slotEventOverlap: true
      // a bad name. confused with overlap/constraint system
    },
    timeGridDay: {
      type: "timeGrid",
      duration: {
        days: 1
      }
    },
    timeGridWeek: {
      type: "timeGrid",
      duration: {
        weeks: 1
      }
    }
  }
});
export {
  index as default
};
//# sourceMappingURL=@fullcalendar_timegrid.js.map

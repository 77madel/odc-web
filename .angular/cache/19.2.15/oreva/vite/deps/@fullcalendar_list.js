import "./chunk-T7UM46HU.js";
import {
  BaseComponent,
  ContentContainer,
  DateComponent,
  EventContainer,
  NowTimer,
  Scroller,
  ViewContainer,
  _,
  addDays,
  buildNavLinkAttrs,
  buildSegTimeText,
  createFormatter,
  createPlugin,
  formatDayString,
  getDateMeta,
  getDayClassNames,
  getSegAnchorAttrs,
  getSegMeta,
  getUniqueDomId,
  identity,
  injectStyles,
  intersectRanges,
  isMultiDayRange,
  memoize,
  sliceEventStore,
  sortEventSegs,
  startOfDay,
  y
} from "./chunk-XYHSFZAA.js";
import "./chunk-KBUIKKCC.js";

// node_modules/@fullcalendar/list/internal.js
var ListViewHeaderRow = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.state = {
      textId: getUniqueDomId()
    };
  }
  render() {
    let {
      theme,
      dateEnv,
      options,
      viewApi
    } = this.context;
    let {
      cellId,
      dayDate,
      todayRange
    } = this.props;
    let {
      textId
    } = this.state;
    let dayMeta = getDateMeta(dayDate, todayRange);
    let text = options.listDayFormat ? dateEnv.format(dayDate, options.listDayFormat) : "";
    let sideText = options.listDaySideFormat ? dateEnv.format(dayDate, options.listDaySideFormat) : "";
    let renderProps = Object.assign({
      date: dateEnv.toDate(dayDate),
      view: viewApi,
      textId,
      text,
      sideText,
      navLinkAttrs: buildNavLinkAttrs(this.context, dayDate),
      sideNavLinkAttrs: buildNavLinkAttrs(this.context, dayDate, "day", false)
    }, dayMeta);
    return y(ContentContainer, {
      elTag: "tr",
      elClasses: ["fc-list-day", ...getDayClassNames(dayMeta, theme)],
      elAttrs: {
        "data-date": formatDayString(dayDate)
      },
      renderProps,
      generatorName: "dayHeaderContent",
      customGenerator: options.dayHeaderContent,
      defaultGenerator: renderInnerContent,
      classNameGenerator: options.dayHeaderClassNames,
      didMount: options.dayHeaderDidMount,
      willUnmount: options.dayHeaderWillUnmount
    }, (InnerContent) => (
      // TODO: force-hide top border based on :first-child
      y("th", {
        scope: "colgroup",
        colSpan: 3,
        id: cellId,
        "aria-labelledby": textId
      }, y(InnerContent, {
        elTag: "div",
        elClasses: ["fc-list-day-cushion", theme.getClass("tableCellShaded")]
      }))
    ));
  }
};
function renderInnerContent(props) {
  return y(_, null, props.text && y("a", Object.assign({
    id: props.textId,
    className: "fc-list-day-text"
  }, props.navLinkAttrs), props.text), props.sideText && /* not keyboard tabbable */
  y("a", Object.assign({
    "aria-hidden": true,
    className: "fc-list-day-side-text"
  }, props.sideNavLinkAttrs), props.sideText));
}
var DEFAULT_TIME_FORMAT = createFormatter({
  hour: "numeric",
  minute: "2-digit",
  meridiem: "short"
});
var ListViewEventRow = class extends BaseComponent {
  render() {
    let {
      props,
      context
    } = this;
    let {
      options
    } = context;
    let {
      seg,
      timeHeaderId,
      eventHeaderId,
      dateHeaderId
    } = props;
    let timeFormat = options.eventTimeFormat || DEFAULT_TIME_FORMAT;
    return y(EventContainer, Object.assign({}, props, {
      elTag: "tr",
      elClasses: ["fc-list-event", seg.eventRange.def.url && "fc-event-forced-url"],
      defaultGenerator: () => renderEventInnerContent(seg, context),
      seg,
      timeText: "",
      disableDragging: true,
      disableResizing: true
    }), (InnerContent, eventContentArg) => y(_, null, buildTimeContent(seg, timeFormat, context, timeHeaderId, dateHeaderId), y("td", {
      "aria-hidden": true,
      className: "fc-list-event-graphic"
    }, y("span", {
      className: "fc-list-event-dot",
      style: {
        borderColor: eventContentArg.borderColor || eventContentArg.backgroundColor
      }
    })), y(InnerContent, {
      elTag: "td",
      elClasses: ["fc-list-event-title"],
      elAttrs: {
        headers: `${eventHeaderId} ${dateHeaderId}`
      }
    })));
  }
};
function renderEventInnerContent(seg, context) {
  let interactiveAttrs = getSegAnchorAttrs(seg, context);
  return y("a", Object.assign({}, interactiveAttrs), seg.eventRange.def.title);
}
function buildTimeContent(seg, timeFormat, context, timeHeaderId, dateHeaderId) {
  let {
    options
  } = context;
  if (options.displayEventTime !== false) {
    let eventDef = seg.eventRange.def;
    let eventInstance = seg.eventRange.instance;
    let doAllDay = false;
    let timeText;
    if (eventDef.allDay) {
      doAllDay = true;
    } else if (isMultiDayRange(seg.eventRange.range)) {
      if (seg.isStart) {
        timeText = buildSegTimeText(seg, timeFormat, context, null, null, eventInstance.range.start, seg.end);
      } else if (seg.isEnd) {
        timeText = buildSegTimeText(seg, timeFormat, context, null, null, seg.start, eventInstance.range.end);
      } else {
        doAllDay = true;
      }
    } else {
      timeText = buildSegTimeText(seg, timeFormat, context);
    }
    if (doAllDay) {
      let renderProps = {
        text: context.options.allDayText,
        view: context.viewApi
      };
      return y(ContentContainer, {
        elTag: "td",
        elClasses: ["fc-list-event-time"],
        elAttrs: {
          headers: `${timeHeaderId} ${dateHeaderId}`
        },
        renderProps,
        generatorName: "allDayContent",
        customGenerator: options.allDayContent,
        defaultGenerator: renderAllDayInner,
        classNameGenerator: options.allDayClassNames,
        didMount: options.allDayDidMount,
        willUnmount: options.allDayWillUnmount
      });
    }
    return y("td", {
      className: "fc-list-event-time"
    }, timeText);
  }
  return null;
}
function renderAllDayInner(renderProps) {
  return renderProps.text;
}
var ListView = class extends DateComponent {
  constructor() {
    super(...arguments);
    this.computeDateVars = memoize(computeDateVars);
    this.eventStoreToSegs = memoize(this._eventStoreToSegs);
    this.state = {
      timeHeaderId: getUniqueDomId(),
      eventHeaderId: getUniqueDomId(),
      dateHeaderIdRoot: getUniqueDomId()
    };
    this.setRootEl = (rootEl) => {
      if (rootEl) {
        this.context.registerInteractiveComponent(this, {
          el: rootEl
        });
      } else {
        this.context.unregisterInteractiveComponent(this);
      }
    };
  }
  render() {
    let {
      props,
      context
    } = this;
    let {
      dayDates,
      dayRanges
    } = this.computeDateVars(props.dateProfile);
    let eventSegs = this.eventStoreToSegs(props.eventStore, props.eventUiBases, dayRanges);
    return y(ViewContainer, {
      elRef: this.setRootEl,
      elClasses: ["fc-list", context.theme.getClass("table"), context.options.stickyHeaderDates !== false ? "fc-list-sticky" : ""],
      viewSpec: context.viewSpec
    }, y(Scroller, {
      liquid: !props.isHeightAuto,
      overflowX: props.isHeightAuto ? "visible" : "hidden",
      overflowY: props.isHeightAuto ? "visible" : "auto"
    }, eventSegs.length > 0 ? this.renderSegList(eventSegs, dayDates) : this.renderEmptyMessage()));
  }
  renderEmptyMessage() {
    let {
      options,
      viewApi
    } = this.context;
    let renderProps = {
      text: options.noEventsText,
      view: viewApi
    };
    return y(ContentContainer, {
      elTag: "div",
      elClasses: ["fc-list-empty"],
      renderProps,
      generatorName: "noEventsContent",
      customGenerator: options.noEventsContent,
      defaultGenerator: renderNoEventsInner,
      classNameGenerator: options.noEventsClassNames,
      didMount: options.noEventsDidMount,
      willUnmount: options.noEventsWillUnmount
    }, (InnerContent) => y(InnerContent, {
      elTag: "div",
      elClasses: ["fc-list-empty-cushion"]
    }));
  }
  renderSegList(allSegs, dayDates) {
    let {
      theme,
      options
    } = this.context;
    let {
      timeHeaderId,
      eventHeaderId,
      dateHeaderIdRoot
    } = this.state;
    let segsByDay = groupSegsByDay(allSegs);
    return y(NowTimer, {
      unit: "day"
    }, (nowDate, todayRange) => {
      let innerNodes = [];
      for (let dayIndex = 0; dayIndex < segsByDay.length; dayIndex += 1) {
        let daySegs = segsByDay[dayIndex];
        if (daySegs) {
          let dayStr = formatDayString(dayDates[dayIndex]);
          let dateHeaderId = dateHeaderIdRoot + "-" + dayStr;
          innerNodes.push(y(ListViewHeaderRow, {
            key: dayStr,
            cellId: dateHeaderId,
            dayDate: dayDates[dayIndex],
            todayRange
          }));
          daySegs = sortEventSegs(daySegs, options.eventOrder);
          for (let seg of daySegs) {
            innerNodes.push(y(ListViewEventRow, Object.assign({
              key: dayStr + ":" + seg.eventRange.instance.instanceId,
              seg,
              isDragging: false,
              isResizing: false,
              isDateSelecting: false,
              isSelected: false,
              timeHeaderId,
              eventHeaderId,
              dateHeaderId
            }, getSegMeta(seg, todayRange, nowDate))));
          }
        }
      }
      return y("table", {
        className: "fc-list-table " + theme.getClass("table")
      }, y("thead", null, y("tr", null, y("th", {
        scope: "col",
        id: timeHeaderId
      }, options.timeHint), y("th", {
        scope: "col",
        "aria-hidden": true
      }), y("th", {
        scope: "col",
        id: eventHeaderId
      }, options.eventHint))), y("tbody", null, innerNodes));
    });
  }
  _eventStoreToSegs(eventStore, eventUiBases, dayRanges) {
    return this.eventRangesToSegs(sliceEventStore(eventStore, eventUiBases, this.props.dateProfile.activeRange, this.context.options.nextDayThreshold).fg, dayRanges);
  }
  eventRangesToSegs(eventRanges, dayRanges) {
    let segs = [];
    for (let eventRange of eventRanges) {
      segs.push(...this.eventRangeToSegs(eventRange, dayRanges));
    }
    return segs;
  }
  eventRangeToSegs(eventRange, dayRanges) {
    let {
      dateEnv
    } = this.context;
    let {
      nextDayThreshold
    } = this.context.options;
    let range = eventRange.range;
    let allDay = eventRange.def.allDay;
    let dayIndex;
    let segRange;
    let seg;
    let segs = [];
    for (dayIndex = 0; dayIndex < dayRanges.length; dayIndex += 1) {
      segRange = intersectRanges(range, dayRanges[dayIndex]);
      if (segRange) {
        seg = {
          component: this,
          eventRange,
          start: segRange.start,
          end: segRange.end,
          isStart: eventRange.isStart && segRange.start.valueOf() === range.start.valueOf(),
          isEnd: eventRange.isEnd && segRange.end.valueOf() === range.end.valueOf(),
          dayIndex
        };
        segs.push(seg);
        if (!seg.isEnd && !allDay && dayIndex + 1 < dayRanges.length && range.end < dateEnv.add(dayRanges[dayIndex + 1].start, nextDayThreshold)) {
          seg.end = range.end;
          seg.isEnd = true;
          break;
        }
      }
    }
    return segs;
  }
};
function renderNoEventsInner(renderProps) {
  return renderProps.text;
}
function computeDateVars(dateProfile) {
  let dayStart = startOfDay(dateProfile.renderRange.start);
  let viewEnd = dateProfile.renderRange.end;
  let dayDates = [];
  let dayRanges = [];
  while (dayStart < viewEnd) {
    dayDates.push(dayStart);
    dayRanges.push({
      start: dayStart,
      end: addDays(dayStart, 1)
    });
    dayStart = addDays(dayStart, 1);
  }
  return {
    dayDates,
    dayRanges
  };
}
function groupSegsByDay(segs) {
  let segsByDay = [];
  let i;
  let seg;
  for (i = 0; i < segs.length; i += 1) {
    seg = segs[i];
    (segsByDay[seg.dayIndex] || (segsByDay[seg.dayIndex] = [])).push(seg);
  }
  return segsByDay;
}
var css_248z = ':root{--fc-list-event-dot-width:10px;--fc-list-event-hover-bg-color:#f5f5f5}.fc-theme-standard .fc-list{border:1px solid var(--fc-border-color)}.fc .fc-list-empty{align-items:center;background-color:var(--fc-neutral-bg-color);display:flex;height:100%;justify-content:center}.fc .fc-list-empty-cushion{margin:5em 0}.fc .fc-list-table{border-style:hidden;width:100%}.fc .fc-list-table tr>*{border-left:0;border-right:0}.fc .fc-list-sticky .fc-list-day>*{background:var(--fc-page-bg-color);position:sticky;top:0}.fc .fc-list-table thead{left:-10000px;position:absolute}.fc .fc-list-table tbody>tr:first-child th{border-top:0}.fc .fc-list-table th{padding:0}.fc .fc-list-day-cushion,.fc .fc-list-table td{padding:8px 14px}.fc .fc-list-day-cushion:after{clear:both;content:"";display:table}.fc-theme-standard .fc-list-day-cushion{background-color:var(--fc-neutral-bg-color)}.fc-direction-ltr .fc-list-day-text,.fc-direction-rtl .fc-list-day-side-text{float:left}.fc-direction-ltr .fc-list-day-side-text,.fc-direction-rtl .fc-list-day-text{float:right}.fc-direction-ltr .fc-list-table .fc-list-event-graphic{padding-right:0}.fc-direction-rtl .fc-list-table .fc-list-event-graphic{padding-left:0}.fc .fc-list-event.fc-event-forced-url{cursor:pointer}.fc .fc-list-event:hover td{background-color:var(--fc-list-event-hover-bg-color)}.fc .fc-list-event-graphic,.fc .fc-list-event-time{white-space:nowrap;width:1px}.fc .fc-list-event-dot{border:calc(var(--fc-list-event-dot-width)/2) solid var(--fc-event-border-color);border-radius:calc(var(--fc-list-event-dot-width)/2);box-sizing:content-box;display:inline-block;height:0;width:0}.fc .fc-list-event-title a{color:inherit;text-decoration:none}.fc .fc-list-event.fc-event-forced-url:hover a{text-decoration:underline}';
injectStyles(css_248z);

// node_modules/@fullcalendar/list/index.js
var OPTION_REFINERS = {
  listDayFormat: createFalsableFormatter,
  listDaySideFormat: createFalsableFormatter,
  noEventsClassNames: identity,
  noEventsContent: identity,
  noEventsDidMount: identity,
  noEventsWillUnmount: identity
  // noEventsText is defined in base options
};
function createFalsableFormatter(input) {
  return input === false ? null : createFormatter(input);
}
var index = createPlugin({
  name: "@fullcalendar/list",
  optionRefiners: OPTION_REFINERS,
  views: {
    list: {
      component: ListView,
      buttonTextKey: "list",
      listDayFormat: {
        month: "long",
        day: "numeric",
        year: "numeric"
      }
      // like "January 1, 2016"
    },
    listDay: {
      type: "list",
      duration: {
        days: 1
      },
      listDayFormat: {
        weekday: "long"
      }
      // day-of-week is all we need. full date is probably in headerToolbar
    },
    listWeek: {
      type: "list",
      duration: {
        weeks: 1
      },
      listDayFormat: {
        weekday: "long"
      },
      listDaySideFormat: {
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    },
    listMonth: {
      type: "list",
      duration: {
        month: 1
      },
      listDaySideFormat: {
        weekday: "long"
      }
      // day-of-week is nice-to-have
    },
    listYear: {
      type: "list",
      duration: {
        year: 1
      },
      listDaySideFormat: {
        weekday: "long"
      }
      // day-of-week is nice-to-have
    }
  }
});
export {
  index as default
};
//# sourceMappingURL=@fullcalendar_list.js.map

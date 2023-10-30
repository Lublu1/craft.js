'use strict';
var craftjsUtilsMeetovo = require('craftjs-utils-meetovo'),
  React = require('react'),
  invariant = require('tiny-invariant'),
  lodash = require('lodash'),
  cloneDeep = require('lodash/cloneDeep'),
  _extendStatics = function (e, t) {
    return (_extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (e, t) {
          e.__proto__ = t;
        }) ||
      function (e, t) {
        for (var n in t)
          Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
      })(e, t);
  };
function __extends(e, t) {
  if ('function' != typeof t && null !== t)
    throw new TypeError(
      'Class extends value ' + String(t) + ' is not a constructor or null'
    );
  function n() {
    this.constructor = e;
  }
  _extendStatics(e, t),
    (e.prototype =
      null === t ? Object.create(t) : ((n.prototype = t.prototype), new n()));
}
var _assign = function () {
  return (_assign =
    Object.assign ||
    function (e) {
      for (var t, n = 1, r = arguments.length; n < r; n++)
        for (var o in (t = arguments[n]))
          Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
      return e;
    }).apply(this, arguments);
};
function __rest(e, t) {
  var n = {};
  for (var r in e)
    Object.prototype.hasOwnProperty.call(e, r) &&
      t.indexOf(r) < 0 &&
      (n[r] = e[r]);
  if (null != e && 'function' == typeof Object.getOwnPropertySymbols) {
    var o = 0;
    for (r = Object.getOwnPropertySymbols(e); o < r.length; o++)
      t.indexOf(r[o]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(e, r[o]) &&
        (n[r[o]] = e[r[o]]);
  }
  return n;
}
function __spreadArrays() {
  for (var e = 0, t = 0, n = arguments.length; t < n; t++)
    e += arguments[t].length;
  var r = Array(e),
    o = 0;
  for (t = 0; t < n; t++)
    for (var a = arguments[t], s = 0, i = a.length; s < i; s++, o++)
      r[o] = a[s];
  return r;
}
var NodeContext = React.createContext(null),
  NodeProvider = function (e) {
    var t = e.related;
    return React.createElement(
      NodeContext.Provider,
      { value: { id: e.id, related: void 0 !== t && t } },
      e.children
    );
  },
  EditorContext = React.createContext(null),
  EventHandlerContext = React.createContext(null),
  useEventHandler = function () {
    return React.useContext(EventHandlerContext);
  };
function useInternalEditor(e) {
  var t = useEventHandler(),
    n = React.useContext(EditorContext);
  invariant(n, craftjsUtilsMeetovo.ERROR_USE_EDITOR_OUTSIDE_OF_EDITOR_CONTEXT);
  var r = craftjsUtilsMeetovo.useCollector(n, e),
    o = React.useMemo(
      function () {
        return t && t.createConnectorsUsage();
      },
      [t]
    );
  React.useEffect(
    function () {
      return function () {
        o && o.cleanup();
      };
    },
    [o]
  );
  var a = React.useMemo(
    function () {
      return o && craftjsUtilsMeetovo.wrapConnectorHooks(o.connectors);
    },
    [o]
  );
  return _assign(_assign({}, r), { connectors: a, inContext: !!n, store: n });
}
function useInternalNode(e) {
  var t = React.useContext(NodeContext);
  invariant(t, craftjsUtilsMeetovo.ERROR_USE_NODE_OUTSIDE_OF_EDITOR_CONTEXT);
  var n = t.id,
    r = t.related,
    o = useInternalEditor(function (t) {
      return n && t.nodes[n] && e && e(t.nodes[n]);
    }),
    a = o.actions,
    s = o.connectors,
    i = __rest(o, ['actions', 'query', 'connectors']),
    d = React.useMemo(
      function () {
        return craftjsUtilsMeetovo.wrapConnectorHooks({
          connect: function (e) {
            return s.connect(e, n);
          },
          drag: function (e) {
            return s.drag(e, n);
          },
        });
      },
      [s, n]
    ),
    c = React.useMemo(
      function () {
        return {
          setProp: function (e, t) {
            t ? a.history.throttle(t).setProp(n, e) : a.setProp(n, e);
          },
          setCustom: function (e, t) {
            t ? a.history.throttle(t).setCustom(n, e) : a.setCustom(n, e);
          },
          setHidden: function (e) {
            return a.setHidden(n, e);
          },
        };
      },
      [a, n]
    );
  return _assign(_assign({}, i), {
    id: n,
    related: r,
    inNodeContext: !!t,
    actions: c,
    connectors: d,
  });
}
function useNode(e) {
  var t = useInternalNode(e),
    n = t.id,
    r = t.related,
    o = t.actions,
    a = t.inNodeContext,
    s = t.connectors,
    i = __rest(t, ['id', 'related', 'actions', 'inNodeContext', 'connectors']);
  return _assign(_assign({}, i), {
    actions: o,
    id: n,
    related: r,
    setProp: function (e, t) {
      return (
        craftjsUtilsMeetovo.deprecationWarning('useNode().setProp()', {
          suggest: 'useNode().actions.setProp()',
        }),
        o.setProp(e, t)
      );
    },
    inNodeContext: a,
    connectors: s,
  });
}
var SimpleElement = function (e) {
    var t = e.render,
      n = useNode().connectors;
    return 'string' == typeof t.type
      ? (0, n.connect)((0, n.drag)(React.cloneElement(t)))
      : t;
  },
  DefaultRender = function () {
    var e = useInternalNode(function (e) {
        return {
          type: e.data.type,
          props: e.data.props,
          nodes: e.data.nodes,
          hydrationTimestamp: e._hydrationTimestamp,
        };
      }),
      t = e.type,
      n = e.props,
      r = e.nodes;
    return React.useMemo(
      function () {
        var e = n.children;
        r &&
          r.length > 0 &&
          (e = React.createElement(
            React.Fragment,
            null,
            r.map(function (e) {
              return React.createElement(NodeElement, { id: e, key: e });
            })
          ));
        var o = React.createElement(t, n, e);
        return 'string' == typeof t
          ? React.createElement(SimpleElement, { render: o })
          : o;
      },
      [t, n, e.hydrationTimestamp, r]
    );
  },
  RenderNodeToElement = function (e) {
    var t = e.render,
      n = useInternalNode(function (e) {
        return { hidden: e.data.hidden };
      }).hidden,
      r = useInternalEditor(function (e) {
        return { onRender: e.options.onRender };
      }).onRender;
    return n
      ? null
      : React.createElement(r, {
          render: t || React.createElement(DefaultRender, null),
        });
  },
  NodeElement = function (e) {
    return React.createElement(
      NodeProvider,
      { id: e.id },
      React.createElement(RenderNodeToElement, { render: e.render })
    );
  },
  defaultElementProps = { is: 'div', canvas: !1, custom: {}, hidden: !1 },
  elementPropToNodeData = { is: 'type', canvas: 'isCanvas' };
function Element$1(e) {
  var t = e.id,
    n = e.children,
    r = __rest(e, ['id', 'children']),
    o = _assign(_assign({}, defaultElementProps), r).is,
    a = useInternalEditor(),
    s = a.query,
    i = a.actions,
    d = useInternalNode(function (e) {
      return { node: { id: e.id, data: e.data } };
    }),
    c = d.node,
    u = d.inNodeContext,
    l = React.useState(null),
    f = l[0],
    p = l[1];
  return (
    craftjsUtilsMeetovo.useEffectOnce(function () {
      invariant(!!t, craftjsUtilsMeetovo.ERROR_TOP_LEVEL_ELEMENT_NO_ID);
      var e = c.id,
        a = c.data;
      if (u) {
        var d,
          l =
            a.linkedNodes && a.linkedNodes[t] && s.node(a.linkedNodes[t]).get();
        if (l && l.data.type === o) d = l.id;
        else {
          var f = React.createElement(Element$1, r, n),
            v = s.parseReactElement(f).toNodeTree();
          (d = v.rootNodeId), i.history.ignore().addLinkedNodeFromTree(v, e, t);
        }
        p(d);
      }
    }),
    f ? React.createElement(NodeElement, { id: f }) : null
  );
}
var deprecateCanvasComponent = function () {
  return craftjsUtilsMeetovo.deprecationWarning('<Canvas />', {
    suggest: '<Element canvas={true} />',
  });
};
function Canvas(e) {
  var t = __rest(e, []);
  return (
    React.useEffect(function () {
      return deprecateCanvasComponent();
    }, []),
    React.createElement(Element$1, _assign({}, t, { canvas: !0 }))
  );
}
var RenderRootNode = function () {
    var e = useInternalEditor(function (e) {
      return {
        timestamp:
          e.nodes[craftjsUtilsMeetovo.ROOT_NODE] &&
          e.nodes[craftjsUtilsMeetovo.ROOT_NODE]._hydrationTimestamp,
      };
    }).timestamp;
    return e
      ? React.createElement(NodeElement, {
          id: craftjsUtilsMeetovo.ROOT_NODE,
          key: e,
        })
      : null;
  },
  Frame = function (e) {
    var t = e.children,
      n = e.json,
      r = e.data,
      o = useInternalEditor(),
      a = o.actions,
      s = o.query;
    n &&
      craftjsUtilsMeetovo.deprecationWarning('<Frame json={...} />', {
        suggest: '<Frame data={...} />',
      });
    var i = React.useRef({ initialChildren: t, initialData: r || n });
    return (
      React.useEffect(
        function () {
          var e = i.current,
            t = e.initialChildren,
            n = e.initialData;
          if (n) a.history.ignore().deserialize(n);
          else if (t) {
            var r = React.Children.only(t),
              o = s.parseReactElement(r).toNodeTree(function (e, t) {
                return t === r && (e.id = craftjsUtilsMeetovo.ROOT_NODE), e;
              });
            a.history.ignore().addNodeTree(o);
          }
        },
        [a, s]
      ),
      React.createElement(RenderRootNode, null)
    );
  };
(exports.NodeSelectorType = void 0),
  (function (e) {
    (e[(e.Any = 0)] = 'Any'), (e[(e.Id = 1)] = 'Id'), (e[(e.Obj = 2)] = 'Obj');
  })(exports.NodeSelectorType || (exports.NodeSelectorType = {}));
var getPublicActions = function (e) {
  return __rest(e, [
    'addLinkedNodeFromTree',
    'setDOM',
    'setNodeEvent',
    'replaceNodes',
    'reset',
  ]);
};
function useEditor(e) {
  var t = useInternalEditor(e),
    n = t.connectors,
    r = t.actions,
    o = __rest(t.query, ['deserialize']),
    a = t.store,
    s = __rest(t, ['connectors', 'actions', 'query', 'store']),
    i = getPublicActions(r),
    d = React.useMemo(
      function () {
        return _assign(_assign({}, i), {
          history: _assign(_assign({}, i.history), {
            ignore: function () {
              for (var e, t = [], n = 0; n < arguments.length; n++)
                t[n] = arguments[n];
              return getPublicActions((e = i.history).ignore.apply(e, t));
            },
            throttle: function () {
              for (var e, t = [], n = 0; n < arguments.length; n++)
                t[n] = arguments[n];
              return getPublicActions((e = i.history).throttle.apply(e, t));
            },
          }),
        });
      },
      [i]
    );
  return _assign({ connectors: n, actions: d, query: o, store: a }, s);
}
function connectEditor(e) {
  return function (t) {
    return function (n) {
      var r = e ? useEditor(e) : useEditor();
      return React.createElement(t, _assign({}, r, n));
    };
  };
}
function connectNode(e) {
  return function (t) {
    return function (n) {
      var r = useNode(e);
      return React.createElement(t, _assign({}, r, n));
    };
  };
}
var fromEntries = function (e) {
    return Object.fromEntries
      ? Object.fromEntries(e)
      : e.reduce(function (e, t) {
          var n,
            r = t[0],
            o = t[1];
          return _assign(_assign({}, e), (((n = {})[r] = o), n));
        }, {});
  },
  getNodesFromSelector = function (e, t, n, r) {
    var o = Array.isArray(t) ? t : [t],
      a = _assign({ existOnly: !1, idOnly: !1 }, n || {}),
      s = o
        .filter(function (e) {
          return !!e;
        })
        .map(function (t) {
          return 'string' == typeof t
            ? { node: e[t], exists: !!e[t] }
            : 'object' != typeof t || a.idOnly
            ? { node: null, exists: !1 }
            : { node: t, exists: !!e[t.id] };
        });
    return (
      a.existOnly &&
        invariant(
          0 ===
            s.filter(function (e) {
              return !e.exists;
            }).length,
          craftjsUtilsMeetovo.ERROR_INVALID_NODEID +
            '-Failed to fetch nodes-' +
            (r || '')
        ),
      s
    );
  },
  removeNodeFromEvents = function (e, t) {
    return Object.keys(e.events).forEach(function (n) {
      var r = e.events[n];
      r &&
        r.has &&
        r.has(t) &&
        (e.events[n] = new Set(
          Array.from(r).filter(function (e) {
            return t !== e;
          })
        ));
    });
  },
  Methods = function (e, t) {
    var n = function (t, n, o) {
        var a = function (n, r) {
          var o = t.nodes[n];
          'string' != typeof o.data.type &&
            invariant(
              e.options.resolver[o.data.name],
              craftjsUtilsMeetovo.ERROR_NOT_IN_RESOLVER.replace(
                '%node_type%',
                '' + o.data.type.name
              )
            ),
            (e.nodes[n] = _assign(_assign({}, o), {
              data: _assign(_assign({}, o.data), { parent: r }),
            })),
            o.data.nodes.length > 0 &&
              (delete e.nodes[n].data.props.children,
              o.data.nodes.forEach(function (e) {
                return a(e, o.id);
              })),
            Object.values(o.data.linkedNodes).forEach(function (e) {
              return a(e, o.id);
            });
        };
        if ((a(t.rootNodeId, n), n)) {
          var s = r(n);
          if ('child' !== o.type) s.data.linkedNodes[o.id] = t.rootNodeId;
          else {
            var i = o.index;
            null != i
              ? s.data.nodes.splice(i, 0, t.rootNodeId)
              : s.data.nodes.push(t.rootNodeId);
          }
        } else
          invariant(
            t.rootNodeId === craftjsUtilsMeetovo.ROOT_NODE,
            'Cannot add non-root Node without a parent'
          );
      },
      r = function (t) {
        invariant(t, craftjsUtilsMeetovo.ERROR_NOPARENT);
        var n = e.nodes[t];
        return (
          invariant(
            n,
            craftjsUtilsMeetovo.ERROR_INVALID_NODEID +
              '-Parent validation failed-' +
              t
          ),
          n
        );
      },
      o = function (t) {
        var n = e.nodes[t],
          r = e.nodes[n.data.parent];
        if (
          (n.data.nodes &&
            __spreadArrays(n.data.nodes).forEach(function (e) {
              return o(e);
            }),
          n.data.linkedNodes &&
            Object.values(n.data.linkedNodes).map(function (e) {
              return o(e);
            }),
          r.data.nodes.includes(t))
        ) {
          var a = r.data.nodes;
          a.splice(a.indexOf(t), 1);
        } else {
          var s = Object.keys(r.data.linkedNodes).find(function (e) {
            return r.data.linkedNodes[e] === e;
          });
          s && delete r.data.linkedNodes[s];
        }
        removeNodeFromEvents(e, t), delete e.nodes[t];
      };
    return {
      addLinkedNodeFromTree: function (e, t, a) {
        var s = r(t).data.linkedNodes[a];
        s && o(s), n(e, t, { type: 'linked', id: a });
      },
      add: function (e, t, r) {
        var o = [e];
        Array.isArray(e) &&
          (craftjsUtilsMeetovo.deprecationWarning('actions.add(node: Node[])', {
            suggest: 'actions.add(node: Node)',
          }),
          (o = e)),
          o.forEach(function (e) {
            var o;
            n({ nodes: ((o = {}), (o[e.id] = e), o), rootNodeId: e.id }, t, {
              type: 'child',
              index: r,
            });
          });
      },
      addNodeTree: function (e, t, r) {
        n(e, t, { type: 'child', index: r });
      },
      delete: function (n) {
        getNodesFromSelector(
          e.nodes,
          n,
          { existOnly: !0, idOnly: !0 },
          'delete'
        ).forEach(function (e) {
          var n = e.node;
          invariant(
            !t.node(n.id).isTopLevelNode(),
            craftjsUtilsMeetovo.ERROR_DELETE_TOP_LEVEL_NODE
          ),
            o(n.id);
        });
      },
      deserialize: function (e) {
        var n = 'string' == typeof e ? JSON.parse(e) : e,
          r = Object.keys(n).map(function (e) {
            var r = e;
            return (
              e === craftjsUtilsMeetovo.DEPRECATED_ROOT_NODE &&
                (r = craftjsUtilsMeetovo.ROOT_NODE),
              [
                r,
                t.parseSerializedNode(n[e]).toNode(function (e) {
                  return (e.id = r);
                }),
              ]
            );
          });
        this.replaceNodes(fromEntries(r));
      },
      move: function (n, r, o) {
        var a = getNodesFromSelector(e.nodes, n, { existOnly: !0 }, 'move'),
          s = e.nodes[r];
        a.forEach(function (n, a) {
          var i = n.node,
            d = i.id,
            c = i.data.parent;
          t.node(r).isDroppable([d], function (e) {
            throw new Error(e);
          });
          var u = e.nodes[c].data.nodes;
          (u[u.indexOf(d)] = 'marked'),
            s.data.nodes.splice(o + a, 0, d),
            (e.nodes[d].data.parent = r),
            u.splice(u.indexOf('marked'), 1);
        });
      },
      replaceNodes: function (t) {
        this.clearEvents(), (e.nodes = t);
      },
      clearEvents: function () {
        this.setNodeEvent('selected', null),
          this.setNodeEvent('hovered', null),
          this.setNodeEvent('dragged', null),
          this.setIndicator(null);
      },
      reset: function () {
        this.clearEvents(), this.replaceNodes({});
      },
      setOptions: function (t) {
        t(e.options);
      },
      setNodeEvent: function (t, n) {
        if (
          (e.events[t].forEach(function (n) {
            e.nodes[n] && (e.nodes[n].events[t] = !1);
          }),
          (e.events[t] = new Set()),
          n)
        ) {
          var r = getNodesFromSelector(
              e.nodes,
              n,
              { idOnly: !0, existOnly: !0 },
              'setNodeEvent'
            ),
            o = new Set(
              r.map(function (e) {
                return e.node.id;
              })
            );
          o.forEach(function (n) {
            e.nodes[n].events[t] = !0;
          }),
            (e.events[t] = o);
        }
      },
      setCustom: function (t, n) {
        getNodesFromSelector(
          e.nodes,
          t,
          { idOnly: !0, existOnly: !0 },
          'setCustom'
        ).forEach(function (t) {
          return n(e.nodes[t.node.id].data.custom);
        });
      },
      setDOM: function (t, n) {
        e.nodes[t] && (e.nodes[t].dom = n);
      },
      setIndicator: function (t) {
        (t &&
          (!t.placement.parent.dom ||
            (t.placement.currentNode && !t.placement.currentNode.dom))) ||
          (e.indicator = t);
      },
      setHidden: function (t, n) {
        e.nodes[t].data.hidden = n;
      },
      setProp: function (t, n) {
        getNodesFromSelector(
          e.nodes,
          t,
          { idOnly: !0, existOnly: !0 },
          'setProp'
        ).forEach(function (t) {
          return n(e.nodes[t.node.id].data.props);
        });
      },
      selectNode: function (t) {
        if (t) {
          var n = getNodesFromSelector(
            e.nodes,
            t,
            { idOnly: !0, existOnly: !0 },
            'selectNode'
          );
          this.setNodeEvent(
            'selected',
            n.map(function (e) {
              return e.node.id;
            })
          );
        } else this.setNodeEvent('selected', null);
        this.setNodeEvent('hovered', null);
      },
    };
  },
  ActionMethods = function (e, t) {
    return _assign(_assign({}, Methods(e, t)), {
      setState: function (t) {
        var n = __rest(this, ['history']);
        t(e, n);
      },
    });
  };
function EventHelpers(e, t) {
  var n = e.events[t];
  return {
    contains: function (e) {
      return n.has(e);
    },
    isEmpty: function () {
      return 0 === this.all().length;
    },
    first: function () {
      return this.all()[0];
    },
    last: function () {
      var e = this.all();
      return e[e.length - 1];
    },
    all: function () {
      return Array.from(n);
    },
    size: function () {
      return this.all().length;
    },
    at: function (e) {
      return this.all()[e];
    },
    raw: function () {
      return n;
    },
  };
}
var resolveComponent = function (e, t) {
    var n = t.name || t.displayName,
      r = (function () {
        if (e[n]) return n;
        for (var r = 0; r < Object.keys(e).length; r++) {
          var o = Object.keys(e)[r];
          if (e[o] === t) return o;
        }
        return 'string' == typeof t ? t : void 0;
      })();
    return (
      invariant(
        r,
        craftjsUtilsMeetovo.ERROR_NOT_IN_RESOLVER.replace('%node_type%', n)
      ),
      r
    );
  },
  reduceType = function (e, t) {
    return 'string' == typeof e ? e : { resolvedName: resolveComponent(t, e) };
  },
  serializeComp = function (e, t) {
    var n = e.type,
      r = e.isCanvas,
      o = e.props;
    return (
      (o = Object.keys(o).reduce(function (e, n) {
        var r = o[n];
        return null == r
          ? e
          : ((e[n] =
              'children' === n && 'string' != typeof r
                ? React.Children.map(r, function (e) {
                    return 'string' == typeof e ? e : serializeComp(e, t);
                  })
                : r.type
                ? serializeComp(r, t)
                : r),
            e);
      }, {})),
      { type: reduceType(n, t), isCanvas: !!r, props: o }
    );
  },
  serializeNode = function (e, t) {
    var n = e.type,
      r = e.props,
      o = e.isCanvas,
      a = __rest(e, ['type', 'props', 'isCanvas', 'name']),
      s = serializeComp({ type: n, isCanvas: o, props: r }, t);
    return _assign(_assign({}, s), a);
  };
function NodeHelpers(e, t) {
  invariant('string' == typeof t, craftjsUtilsMeetovo.ERROR_INVALID_NODE_ID);
  var n = e.nodes[t],
    r = function (t) {
      return NodeHelpers(e, t);
    };
  return {
    isCanvas: function () {
      return !!n.data.isCanvas;
    },
    isRoot: function () {
      return n.id === craftjsUtilsMeetovo.ROOT_NODE;
    },
    isLinkedNode: function () {
      return n.data.parent && r(n.data.parent).linkedNodes().includes(n.id);
    },
    isTopLevelNode: function () {
      return this.isRoot() || this.isLinkedNode();
    },
    isDeletable: function () {
      return !this.isTopLevelNode();
    },
    isParentOfTopLevelNodes: function () {
      return n.data.linkedNodes && Object.keys(n.data.linkedNodes).length > 0;
    },
    isParentOfTopLevelCanvas: function () {
      return (
        craftjsUtilsMeetovo.deprecationWarning(
          'query.node(id).isParentOfTopLevelCanvas',
          { suggest: 'query.node(id).isParentOfTopLevelNodes' }
        ),
        this.isParentOfTopLevelNodes()
      );
    },
    isSelected: function () {
      return e.events.selected.has(t);
    },
    isHovered: function () {
      return e.events.hovered.has(t);
    },
    isDragged: function () {
      return e.events.dragged.has(t);
    },
    get: function () {
      return n;
    },
    ancestors: function (t) {
      return (
        void 0 === t && (t = !1),
        (function n(r, o, a) {
          void 0 === o && (o = []), void 0 === a && (a = 0);
          var s = e.nodes[r];
          return s
            ? (o.push(r),
              s.data.parent
                ? ((t || (!t && 0 === a)) && (o = n(s.data.parent, o, a + 1)),
                  o)
                : o)
            : o;
        })(n.data.parent)
      );
    },
    descendants: function (n, o) {
      return (
        void 0 === n && (n = !1),
        (function t(a, s, i) {
          return (
            void 0 === s && (s = []),
            void 0 === i && (i = 0),
            (n || (!n && 0 === i)) && e.nodes[a]
              ? ('childNodes' !== o &&
                  r(a)
                    .linkedNodes()
                    .forEach(function (e) {
                      s.push(e), (s = t(e, s, i + 1));
                    }),
                'linkedNodes' !== o &&
                  r(a)
                    .childNodes()
                    .forEach(function (e) {
                      s.push(e), (s = t(e, s, i + 1));
                    }),
                s)
              : s
          );
        })(t)
      );
    },
    linkedNodes: function () {
      return Object.values(n.data.linkedNodes || {});
    },
    childNodes: function () {
      return n.data.nodes || [];
    },
    isDraggable: function (t) {
      try {
        var o = n;
        return (
          invariant(
            !this.isTopLevelNode(),
            craftjsUtilsMeetovo.ERROR_MOVE_TOP_LEVEL_NODE
          ),
          invariant(
            NodeHelpers(e, o.data.parent).isCanvas(),
            craftjsUtilsMeetovo.ERROR_MOVE_NONCANVAS_CHILD
          ),
          invariant(
            o.rules.canDrag(o, r),
            craftjsUtilsMeetovo.ERROR_CANNOT_DRAG
          ),
          !0
        );
      } catch (e) {
        return t && t(e), !1;
      }
    },
    isDroppable: function (t, o) {
      var a = getNodesFromSelector(e.nodes, t),
        s = n;
      try {
        invariant(
          this.isCanvas(),
          craftjsUtilsMeetovo.ERROR_MOVE_TO_NONCANVAS_PARENT
        ),
          invariant(
            s.rules.canMoveIn(
              a.map(function (e) {
                return e.node;
              }),
              s,
              r
            ),
            craftjsUtilsMeetovo.ERROR_MOVE_INCOMING_PARENT
          );
        var i = {};
        return (
          a.forEach(function (t) {
            var n = t.node,
              o = t.exists;
            if (
              (invariant(
                n.rules.canDrop(s, n, r),
                craftjsUtilsMeetovo.ERROR_MOVE_CANNOT_DROP
              ),
              o)
            ) {
              invariant(
                !r(n.id).isTopLevelNode(),
                craftjsUtilsMeetovo.ERROR_MOVE_TOP_LEVEL_NODE
              );
              var a = r(n.id).descendants(!0);
              invariant(
                !a.includes(s.id) && s.id !== n.id,
                craftjsUtilsMeetovo.ERROR_MOVE_TO_DESCENDANT
              );
              var d = n.data.parent && e.nodes[n.data.parent];
              invariant(
                d.data.isCanvas,
                craftjsUtilsMeetovo.ERROR_MOVE_NONCANVAS_CHILD
              ),
                invariant(
                  d || (!d && !e.nodes[n.id]),
                  craftjsUtilsMeetovo.ERROR_DUPLICATE_NODEID
                ),
                d.id !== s.id && (i[d.id] || (i[d.id] = []), i[d.id].push(n));
            }
          }),
          Object.keys(i).forEach(function (t) {
            var n = e.nodes[t];
            invariant(
              n.rules.canMoveOut(i[t], n, r),
              craftjsUtilsMeetovo.ERROR_MOVE_OUTGOING_PARENT
            );
          }),
          !0
        );
      } catch (e) {
        return o && o(e), !1;
      }
    },
    toSerializedNode: function () {
      return serializeNode(n.data, e.options.resolver);
    },
    toNodeTree: function (e) {
      var n = __spreadArrays([t], this.descendants(!0, e)).reduce(function (
        e,
        t
      ) {
        return (e[t] = r(t).get()), e;
      },
      {});
      return { rootNodeId: t, nodes: n };
    },
    decendants: function (e) {
      return (
        void 0 === e && (e = !1),
        craftjsUtilsMeetovo.deprecationWarning('query.node(id).decendants', {
          suggest: 'query.node(id).descendants',
        }),
        this.descendants(e)
      );
    },
    isTopLevelCanvas: function () {
      return !this.isRoot() && !n.data.parent;
    },
  };
}
function findPosition(e, t, n, r) {
  for (
    var o = { parent: e, index: 0, where: 'before' },
      a = 0,
      s = 0,
      i = 0,
      d = 0,
      c = 0,
      u = 0,
      l = 0,
      f = t.length;
    l < f;
    l++
  ) {
    var p = t[l];
    if (
      ((u = p.top + p.outerHeight),
      (d = p.left + p.outerWidth / 2),
      (c = p.top + p.outerHeight / 2),
      !((s && p.left > s) || (i && c >= i) || (a && p.left + p.outerWidth < a)))
    )
      if (((o.index = l), p.inFlow)) {
        if (r < c) {
          o.where = 'before';
          break;
        }
        o.where = 'after';
      } else
        r < u && (i = u),
          n < d
            ? ((s = d), (o.where = 'before'))
            : ((a = d), (o.where = 'after'));
  }
  return o;
}
var getNodeTypeName = function (e) {
  return 'string' == typeof e ? e : e.name;
};
function createNode(e, t) {
  var n = e.data.type,
    r = {
      id: e.id || craftjsUtilsMeetovo.getRandomId(),
      _hydrationTimestamp: Date.now(),
      data: _assign(
        {
          type: n,
          name: getNodeTypeName(n),
          displayName: getNodeTypeName(n),
          props: {},
          custom: {},
          parent: null,
          isCanvas: !1,
          hidden: !1,
          nodes: [],
          linkedNodes: {},
        },
        e.data
      ),
      related: {},
      events: { selected: !1, dragged: !1, hovered: !1 },
      rules: {
        canDrag: function () {
          return !0;
        },
        canDrop: function () {
          return !0;
        },
        canMoveIn: function () {
          return !0;
        },
        canMoveOut: function () {
          return !0;
        },
      },
      dom: null,
    };
  if (r.data.type === Element$1 || r.data.type === Canvas) {
    var o = _assign(_assign({}, defaultElementProps), r.data.props);
    (r.data.props = Object.keys(r.data.props).reduce(function (e, t) {
      return (
        Object.keys(defaultElementProps).includes(t)
          ? (r.data[elementPropToNodeData[t] || t] = o[t])
          : (e[t] = r.data.props[t]),
        e
      );
    }, {})),
      (r.data.name = getNodeTypeName((n = r.data.type))),
      (r.data.displayName = getNodeTypeName(n)),
      r.data.type === Canvas &&
        ((r.data.isCanvas = !0), deprecateCanvasComponent());
  }
  t && t(r);
  var a = n.craft;
  if (
    a &&
    ((r.data.displayName = a.displayName || a.name || r.data.displayName),
    (r.data.props = _assign(
      _assign({}, a.props || a.defaultProps || {}),
      r.data.props
    )),
    (r.data.custom = _assign(_assign({}, a.custom || {}), r.data.custom)),
    null != a.isCanvas && (r.data.isCanvas = a.isCanvas),
    a.rules &&
      Object.keys(a.rules).forEach(function (e) {
        ['canDrag', 'canDrop', 'canMoveIn', 'canMoveOut'].includes(e) &&
          (r.rules[e] = a.rules[e]);
      }),
    a.related)
  ) {
    var s = { id: r.id, related: !0 };
    Object.keys(a.related).forEach(function (e) {
      r.related[e] = function () {
        return React.createElement(
          NodeProvider,
          s,
          React.createElement(a.related[e])
        );
      };
    });
  }
  return r;
}
var restoreType = function (e, t) {
    return 'object' == typeof e && e.resolvedName
      ? 'Canvas' === e.resolvedName
        ? Canvas
        : t[e.resolvedName]
      : 'string' == typeof e
      ? e
      : null;
  },
  deserializeComp = function (e, t, n) {
    var r = e.props,
      o = restoreType(e.type, t);
    if (o) {
      (r = Object.keys(r).reduce(function (e, n) {
        var o = r[n];
        return (
          (e[n] =
            null == o
              ? null
              : 'object' == typeof o && o.resolvedName
              ? deserializeComp(o, t)
              : 'children' === n && Array.isArray(o)
              ? o.map(function (e) {
                  return 'string' == typeof e ? e : deserializeComp(e, t);
                })
              : o),
          e
        );
      }, {})),
        n && (r.key = n);
      var a = _assign({}, React.createElement(o, _assign({}, r)));
      return _assign(_assign({}, a), { name: resolveComponent(t, a.type) });
    }
  },
  deserializeNode = function (e, t) {
    var n = e.type,
      r = __rest(e, ['type', 'props']);
    invariant(
      (void 0 !== n && 'string' == typeof n) ||
        (void 0 !== n && void 0 !== n.resolvedName),
      craftjsUtilsMeetovo.ERROR_DESERIALIZE_COMPONENT_NOT_IN_RESOLVER.replace(
        '%displayName%',
        e.displayName
      ).replace('%availableComponents%', Object.keys(t).join(', '))
    );
    var o = deserializeComp(e, t),
      a = o.name;
    return {
      type: o.type,
      name: a,
      displayName: r.displayName || a,
      props: o.props,
      custom: r.custom || {},
      isCanvas: !!r.isCanvas,
      hidden: !!r.hidden,
      parent: r.parent,
      linkedNodes: r.linkedNodes || r._childCanvas || {},
      nodes: r.nodes || [],
    };
  },
  mergeNodes = function (e, t) {
    var n, r;
    if (t.length < 1) return ((n = {})[e.id] = e), n;
    var o = t.map(function (e) {
        return e.rootNodeId;
      }),
      a = _assign(_assign({}, e), {
        data: _assign(_assign({}, e.data), { nodes: o }),
      }),
      s = (((r = {})[e.id] = a), r);
    return t.reduce(function (t, n) {
      var r,
        o = n.nodes[n.rootNodeId];
      return _assign(
        _assign(_assign({}, t), n.nodes),
        (((r = {})[o.id] = _assign(_assign({}, o), {
          data: _assign(_assign({}, o.data), { parent: e.id }),
        })),
        r)
      );
    }, s);
  },
  mergeTrees = function (e, t) {
    return { rootNodeId: e.id, nodes: mergeNodes(e, t) };
  };
function parseNodeFromJSX(e, t) {
  var n = e;
  return (
    'string' == typeof n && (n = React.createElement(React.Fragment, {}, n)),
    createNode(
      { data: { type: n.type, props: _assign({}, n.props) } },
      function (e) {
        t && t(e, n);
      }
    )
  );
}
function QueryMethods(e) {
  var t = e && e.options,
    n = function () {
      return QueryMethods(e);
    };
  return {
    getDropPlaceholder: function (t, r, o, a) {
      void 0 === a &&
        (a = function (t) {
          return e.nodes[t.id].dom;
        });
      var s = e.nodes[r],
        i = n().node(s.id).isCanvas() ? s : e.nodes[s.data.parent];
      if (i) {
        var d = i.data.nodes || [],
          c = findPosition(
            i,
            d
              ? d.reduce(function (t, n) {
                  var r = a(e.nodes[n]);
                  if (r) {
                    var o = _assign(
                      { id: n },
                      craftjsUtilsMeetovo.getDOMInfo(r)
                    );
                    t.push(o);
                  }
                  return t;
                }, [])
              : [],
            o.x,
            o.y
          ),
          u = d.length && e.nodes[d[c.index]],
          l = {
            placement: _assign(_assign({}, c), { currentNode: u }),
            error: null,
          };
        return (
          getNodesFromSelector(e.nodes, t).forEach(function (e) {
            var t = e.node;
            e.exists &&
              n()
                .node(t.id)
                .isDraggable(function (e) {
                  return (l.error = e);
                });
          }),
          n()
            .node(i.id)
            .isDroppable(t, function (e) {
              return (l.error = e);
            }),
          l
        );
      }
    },
    getOptions: function () {
      return t;
    },
    getNodes: function () {
      return e.nodes;
    },
    node: function (t) {
      return NodeHelpers(e, t);
    },
    getSerializedNodes: function () {
      var t = this,
        n = Object.keys(e.nodes).map(function (e) {
          return [e, t.node(e).toSerializedNode()];
        });
      return fromEntries(n);
    },
    getEvent: function (t) {
      return EventHelpers(e, t);
    },
    serialize: function () {
      return JSON.stringify(this.getSerializedNodes());
    },
    parseReactElement: function (t) {
      return {
        toNodeTree: function (r) {
          var o = parseNodeFromJSX(t, function (t, n) {
              var o = resolveComponent(e.options.resolver, t.data.type);
              (t.data.displayName = t.data.displayName || o),
                (t.data.name = o),
                r && r(t, n);
            }),
            a = [];
          return (
            t.props &&
              t.props.children &&
              (a = React.Children.toArray(t.props.children).reduce(function (
                e,
                t
              ) {
                return (
                  React.isValidElement(t) &&
                    e.push(n().parseReactElement(t).toNodeTree(r)),
                  e
                );
              },
              [])),
            mergeTrees(o, a)
          );
        },
      };
    },
    parseSerializedNode: function (t) {
      return {
        toNode: function (r) {
          var o = deserializeNode(t, e.options.resolver);
          invariant(o.type, craftjsUtilsMeetovo.ERROR_NOT_IN_RESOLVER);
          var a = 'string' == typeof r && r;
          return (
            a &&
              craftjsUtilsMeetovo.deprecationWarning(
                'query.parseSerializedNode(...).toNode(id)',
                {
                  suggest:
                    'query.parseSerializedNode(...).toNode(node => node.id = id)',
                }
              ),
            n()
              .parseFreshNode(
                _assign(_assign({}, a ? { id: a } : {}), { data: o })
              )
              .toNode(!a && r)
          );
        },
      };
    },
    parseFreshNode: function (t) {
      return {
        toNode: function (n) {
          return createNode(t, function (t) {
            t.data.parent === craftjsUtilsMeetovo.DEPRECATED_ROOT_NODE &&
              (t.data.parent = craftjsUtilsMeetovo.ROOT_NODE);
            var r = resolveComponent(e.options.resolver, t.data.type);
            invariant(null !== r, craftjsUtilsMeetovo.ERROR_NOT_IN_RESOLVER),
              (t.data.displayName = t.data.displayName || r),
              (t.data.name = r),
              n && n(t);
          });
        },
      };
    },
    createNode: function (e, t) {
      craftjsUtilsMeetovo.deprecationWarning('query.createNode(' + e + ')', {
        suggest: 'query.parseReactElement(' + e + ').toNodeTree()',
      });
      var n = this.parseReactElement(e).toNodeTree(),
        r = n.nodes[n.rootNodeId];
      return t
        ? (t.id && (r.id = t.id),
          t.data && (r.data = _assign(_assign({}, r.data), t.data)),
          r)
        : r;
    },
    getState: function () {
      return e;
    },
  };
}
var CoreEventHandlers = (function (e) {
    function t() {
      return (null !== e && e.apply(this, arguments)) || this;
    }
    return (
      __extends(t, e),
      (t.prototype.handlers = function () {
        return {
          connect: function (e, t) {},
          select: function (e, t) {},
          hover: function (e, t) {},
          drag: function (e, t) {},
          drop: function (e, t) {},
          create: function (e, t, n) {},
        };
      }),
      t
    );
  })(craftjsUtilsMeetovo.EventHandlers),
  DerivedCoreEventHandlers = (function (e) {
    function t() {
      return (null !== e && e.apply(this, arguments)) || this;
    }
    return __extends(t, e), t;
  })(craftjsUtilsMeetovo.DerivedEventHandlers),
  Positioner = (function () {
    function e(e, t) {
      (this.store = e),
        (this.dragTarget = t),
        (this.currentIndicator = null),
        (this.currentDropTargetId = null),
        (this.currentDropTargetCanvasAncestorId = null),
        (this.currentTargetId = null),
        (this.currentTargetChildDimensions = null),
        (this.currentIndicator = null),
        (this.dragError = null),
        (this.draggedNodes = this.getDraggedNodes()),
        this.validateDraggedNodes(),
        (this.onScrollListener = this.onScroll.bind(this)),
        window.addEventListener('scroll', this.onScrollListener, !0);
    }
    return (
      (e.prototype.cleanup = function () {
        window.removeEventListener('scroll', this.onScrollListener, !0);
      }),
      (e.prototype.onScroll = function (e) {
        var t = e.target,
          n = this.store.query.node(craftjsUtilsMeetovo.ROOT_NODE).get();
        t instanceof Element &&
          n &&
          n.dom &&
          t.contains(n.dom) &&
          (this.currentTargetChildDimensions = null);
      }),
      (e.prototype.getDraggedNodes = function () {
        return getNodesFromSelector(
          this.store.query.getNodes(),
          'new' === this.dragTarget.type
            ? this.dragTarget.tree.nodes[this.dragTarget.tree.rootNodeId]
            : this.dragTarget.nodes
        );
      }),
      (e.prototype.validateDraggedNodes = function () {
        var e = this;
        'new' !== this.dragTarget.type &&
          this.draggedNodes.forEach(function (t) {
            t.exists &&
              e.store.query.node(t.node.id).isDraggable(function (t) {
                e.dragError = t;
              });
          });
      }),
      (e.prototype.isNearBorders = function (t, n, r) {
        return (
          t.top + e.BORDER_OFFSET > r ||
          t.bottom - e.BORDER_OFFSET < r ||
          t.left + e.BORDER_OFFSET > n ||
          t.right - e.BORDER_OFFSET < n
        );
      }),
      (e.prototype.isDiff = function (e) {
        return (
          !this.currentIndicator ||
          this.currentIndicator.placement.parent.id !== e.parent.id ||
          this.currentIndicator.placement.index !== e.index ||
          this.currentIndicator.placement.where !== e.where
        );
      }),
      (e.prototype.getChildDimensions = function (e) {
        var t = this,
          n = this.currentTargetChildDimensions;
        return this.currentTargetId === e.id && n
          ? n
          : e.data.nodes.reduce(function (e, n) {
              var r = t.store.query.node(n).get().dom;
              return (
                r &&
                  e.push(_assign({ id: n }, craftjsUtilsMeetovo.getDOMInfo(r))),
                e
              );
            }, []);
      }),
      (e.prototype.getCanvasAncestor = function (e) {
        var t = this;
        if (
          e === this.currentDropTargetId &&
          this.currentDropTargetCanvasAncestorId
        ) {
          var n = this.store.query
            .node(this.currentDropTargetCanvasAncestorId)
            .get();
          if (n) return n;
        }
        var r = function (e) {
          var n = t.store.query.node(e).get();
          return n && n.data.isCanvas
            ? n
            : n.data.parent
            ? r(n.data.parent)
            : null;
        };
        return r(e);
      }),
      (e.prototype.computeIndicator = function (e, t, n) {
        var r = this.getCanvasAncestor(e);
        if (
          r &&
          ((this.currentDropTargetId = e),
          (this.currentDropTargetCanvasAncestorId = r.id),
          r.data.parent &&
            this.isNearBorders(craftjsUtilsMeetovo.getDOMInfo(r.dom), t, n) &&
            !this.store.query.node(r.id).isLinkedNode() &&
            (r = this.store.query.node(r.data.parent).get()),
          r)
        ) {
          (this.currentTargetChildDimensions = this.getChildDimensions(r)),
            (this.currentTargetId = r.id);
          var o = findPosition(r, this.currentTargetChildDimensions, t, n);
          if (this.isDiff(o)) {
            var a = this.dragError;
            a ||
              this.store.query.node(r.id).isDroppable(
                this.draggedNodes.map(function (e) {
                  return e.node;
                }),
                function (e) {
                  a = e;
                }
              );
            var s = r.data.nodes[o.index],
              i = s && this.store.query.node(s).get();
            return (
              (this.currentIndicator = {
                placement: _assign(_assign({}, o), { currentNode: i }),
                error: a,
              }),
              this.currentIndicator
            );
          }
        }
      }),
      (e.prototype.getIndicator = function () {
        return this.currentIndicator;
      }),
      (e.BORDER_OFFSET = 10),
      e
    );
  })(),
  createShadow = function (e, t, n) {
    if ((void 0 === n && (n = !1), 1 === t.length || n)) {
      var r = t[0].getBoundingClientRect(),
        o = r.width,
        a = r.height,
        s = t[0].cloneNode(!0);
      return (
        (s.style.position = 'fixed'),
        (s.style.left = '-100%'),
        (s.style.top = '-100%'),
        (s.style.width = o + 'px'),
        (s.style.height = a + 'px'),
        (s.style.pointerEvents = 'none'),
        document.body.appendChild(s),
        e.dataTransfer.setDragImage(s, 0, 0),
        s
      );
    }
    var i = document.createElement('div');
    return (
      (i.style.position = 'fixed'),
      (i.style.left = '-100%'),
      (i.style.top = '-100%'),
      (i.style.width = '100%'),
      (i.style.height = '100%'),
      (i.style.pointerEvents = 'none'),
      t.forEach(function (e) {
        var t = e.getBoundingClientRect(),
          n = t.width,
          r = t.height,
          o = t.top,
          a = t.left,
          s = e.cloneNode(!0);
        (s.style.position = 'absolute'),
          (s.style.left = a + 'px'),
          (s.style.top = o + 'px'),
          (s.style.width = n + 'px'),
          (s.style.height = r + 'px'),
          i.appendChild(s);
      }),
      document.body.appendChild(i),
      e.dataTransfer.setDragImage(i, e.clientX, e.clientY),
      i
    );
  },
  DefaultEventHandlers = (function (e) {
    function t() {
      var t = (null !== e && e.apply(this, arguments)) || this;
      return (t.positioner = null), (t.currentSelectedElementIds = []), t;
    }
    return (
      __extends(t, e),
      (t.prototype.onDisable = function () {
        this.options.store.actions.clearEvents();
      }),
      (t.prototype.handlers = function () {
        var e = this,
          n = this.options.store;
        return {
          connect: function (t, r) {
            return (
              n.actions.setDOM(r, t),
              e.reflect(function (e) {
                e.select(t, r), e.hover(t, r), e.drop(t, r);
              })
            );
          },
          select: function (t, r) {
            var o = e.addCraftEventListener(t, 'mousedown', function (t) {
                t.craft.stopPropagation();
                var o = [];
                if (r) {
                  var a = n.query,
                    s = a.getEvent('selected').all();
                  (e.options.isMultiSelectEnabled(t) || s.includes(r)) &&
                    (o = s.filter(function (e) {
                      var t = a.node(e).descendants(!0),
                        n = a.node(e).ancestors(!0);
                      return !t.includes(r) && !n.includes(r);
                    })),
                    o.includes(r) || o.push(r);
                }
                n.actions.setNodeEvent('selected', o);
              }),
              a = e.addCraftEventListener(t, 'click', function (t) {
                t.craft.stopPropagation();
                var o = n.query.getEvent('selected').all(),
                  a = e.options.isMultiSelectEnabled(t),
                  s = e.currentSelectedElementIds.includes(r),
                  i = __spreadArrays(o);
                a && s
                  ? (i.splice(i.indexOf(r), 1),
                    n.actions.setNodeEvent('selected', i))
                  : !a &&
                    o.length > 1 &&
                    n.actions.setNodeEvent('selected', (i = [r])),
                  (e.currentSelectedElementIds = i);
              });
            return function () {
              o(), a();
            };
          },
          hover: function (t, r) {
            var o = e.addCraftEventListener(t, 'mouseover', function (e) {
              e.craft.stopPropagation(), n.actions.setNodeEvent('hovered', r);
            });
            return function () {
              o();
            };
          },
          drop: function (t, r) {
            var o = e.addCraftEventListener(t, 'dragover', function (t) {
                if (
                  (t.craft.stopPropagation(), t.preventDefault(), e.positioner)
                ) {
                  var o = e.positioner.computeIndicator(
                    r,
                    t.clientX,
                    t.clientY
                  );
                  o && n.actions.setIndicator(o);
                }
              }),
              a = e.addCraftEventListener(t, 'dragenter', function (e) {
                e.craft.stopPropagation(), e.preventDefault();
              });
            return function () {
              a(), o();
            };
          },
          drag: function (r, o) {
            if (!n.query.node(o).isDraggable()) return function () {};
            r.setAttribute('draggable', 'true');
            var a = e.addCraftEventListener(r, 'dragstart', function (r) {
                r.craft.stopPropagation();
                var o = n.query,
                  a = n.actions,
                  s = o.getEvent('selected').all();
                a.setNodeEvent('dragged', s);
                var i = s.map(function (e) {
                  return o.node(e).get().dom;
                });
                (e.draggedElementShadow = createShadow(
                  r,
                  i,
                  t.forceSingleDragShadow
                )),
                  (e.dragTarget = { type: 'existing', nodes: s }),
                  (e.positioner = new Positioner(
                    e.options.store,
                    e.dragTarget
                  ));
              }),
              s = e.addCraftEventListener(r, 'dragend', function (t) {
                t.craft.stopPropagation(),
                  e.dropElement(function (e, t) {
                    'new' !== e.type &&
                      n.actions.move(
                        e.nodes,
                        t.placement.parent.id,
                        t.placement.index +
                          ('after' === t.placement.where ? 1 : 0)
                      );
                  });
              });
            return function () {
              r.setAttribute('draggable', 'false'), a(), s();
            };
          },
          create: function (r, o, a) {
            r.setAttribute('draggable', 'true');
            var s = e.addCraftEventListener(r, 'dragstart', function (r) {
                r.craft.stopPropagation();
                var a = n.query.parseReactElement(o).toNodeTree();
                (e.draggedElementShadow = createShadow(
                  r,
                  [r.currentTarget],
                  t.forceSingleDragShadow
                )),
                  (e.dragTarget = { type: 'new', tree: a }),
                  (e.positioner = new Positioner(
                    e.options.store,
                    e.dragTarget
                  ));
              }),
              i = e.addCraftEventListener(r, 'dragend', function (t) {
                t.craft.stopPropagation(),
                  e.dropElement(function (e, t) {
                    'existing' !== e.type &&
                      (n.actions.addNodeTree(
                        e.tree,
                        t.placement.parent.id,
                        t.placement.index +
                          ('after' === t.placement.where ? 1 : 0)
                      ),
                      a && lodash.isFunction(a.onCreate) && a.onCreate(e.tree));
                  });
              });
            return function () {
              r.removeAttribute('draggable'), s(), i();
            };
          },
        };
      }),
      (t.prototype.dropElement = function (e) {
        var t = this.options.store;
        if (this.positioner) {
          var n = this.draggedElementShadow,
            r = this.positioner.getIndicator();
          this.dragTarget && r && !r.error && e(this.dragTarget, r),
            n &&
              (n.parentNode.removeChild(n), (this.draggedElementShadow = null)),
            (this.dragTarget = null),
            t.actions.setIndicator(null),
            t.actions.setNodeEvent('dragged', null),
            this.positioner.cleanup(),
            (this.positioner = null);
        }
      }),
      (t.forceSingleDragShadow =
        craftjsUtilsMeetovo.isChromium() && craftjsUtilsMeetovo.isLinux()),
      t
    );
  })(CoreEventHandlers);
function movePlaceholder(e, t, n, r) {
  void 0 === r && (r = 2);
  var o = 0,
    a = 0,
    s = 0,
    i = 0,
    d = e.where;
  return (
    n
      ? n.inFlow
        ? ((s = n.outerWidth),
          (i = r),
          (o = 'before' === d ? n.top : n.bottom),
          (a = n.left))
        : ((s = r),
          (i = n.outerHeight),
          (o = n.top),
          (a = 'before' === d ? n.left : n.left + n.outerWidth))
      : t &&
        ((o = t.top + t.padding.top),
        (a = t.left + t.padding.left),
        (s =
          t.outerWidth -
          t.padding.right -
          t.padding.left -
          t.margin.left -
          t.margin.right),
        (i = r)),
    { top: o + 'px', left: a + 'px', width: s + 'px', height: i + 'px' }
  );
}
var RenderEditorIndicator = function () {
    var e = useInternalEditor(function (e) {
        return {
          indicator: e.indicator,
          indicatorOptions: e.options.indicator,
          enabled: e.options.enabled,
        };
      }),
      t = e.indicator,
      n = e.indicatorOptions,
      r = e.enabled,
      o = useEventHandler();
    return (
      React.useEffect(
        function () {
          o && (r ? o.enable() : o.disable());
        },
        [r, o]
      ),
      t
        ? React.createElement(craftjsUtilsMeetovo.RenderIndicator, {
            style: _assign(
              _assign(
                {},
                movePlaceholder(
                  t.placement,
                  craftjsUtilsMeetovo.getDOMInfo(t.placement.parent.dom),
                  t.placement.currentNode &&
                    craftjsUtilsMeetovo.getDOMInfo(t.placement.currentNode.dom),
                  n.thickness
                )
              ),
              {
                backgroundColor: t.error ? n.error : n.success,
                transition: n.transition || '0.2s ease-in',
              }
            ),
            parentDom: t.placement.parent.dom,
          })
        : null
    );
  },
  Events = function (e) {
    var t = e.children,
      n = React.useContext(EditorContext),
      r = React.useMemo(
        function () {
          return n.query.getOptions().handlers(n);
        },
        [n]
      );
    return r
      ? React.createElement(
          EventHandlerContext.Provider,
          { value: r },
          React.createElement(RenderEditorIndicator, null),
          t
        )
      : null;
  },
  editorInitialState = {
    nodes: {},
    events: { dragged: new Set(), selected: new Set(), hovered: new Set() },
    indicator: null,
    handlers: null,
    options: {
      onNodesChange: function () {
        return null;
      },
      onRender: function (e) {
        return e.render;
      },
      resolver: {},
      enabled: !0,
      indicator: { error: 'red', success: 'rgb(98, 196, 98)' },
      handlers: function (e) {
        return new DefaultEventHandlers({
          store: e,
          isMultiSelectEnabled: function (e) {
            return !!e.metaKey;
          },
        });
      },
      normalizeNodes: function () {},
    },
  },
  ActionMethodsWithConfig = {
    methods: ActionMethods,
    ignoreHistoryForActions: [
      'setDOM',
      'setNodeEvent',
      'selectNode',
      'clearEvents',
      'setOptions',
      'setIndicator',
    ],
    normalizeHistory: function (e) {
      Object.keys(e.events).forEach(function (t) {
        Array.from(e.events[t] || []).forEach(function (n) {
          e.nodes[n] || e.events[t].delete(n);
        });
      }),
        Object.keys(e.nodes).forEach(function (t) {
          var n = e.nodes[t];
          Object.keys(n.events).forEach(function (t) {
            n.events[t] &&
              e.events[t] &&
              !e.events[t].has(n.id) &&
              (n.events[t] = !1);
          });
        });
    },
  },
  useEditorStore = function (e, t) {
    return craftjsUtilsMeetovo.useMethods(
      ActionMethodsWithConfig,
      _assign(_assign({}, editorInitialState), {
        options: _assign(_assign({}, editorInitialState.options), e),
      }),
      QueryMethods,
      t
    );
  },
  Editor = function (e) {
    var t = e.children,
      n = e.onRender,
      r = e.onNodesChange,
      o = e.resolver,
      a = e.enabled,
      s = e.indicator;
    void 0 !== o &&
      invariant(
        'object' == typeof o && !Array.isArray(o),
        craftjsUtilsMeetovo.ERROR_RESOLVER_NOT_AN_OBJECT
      );
    var i = React.useMemo(
        function () {
          return lodash.pickBy(
            {
              onRender: n,
              onNodesChange: r,
              resolver: o,
              enabled: a,
              indicator: s,
            },
            function (e) {
              return void 0 !== e;
            }
          );
        },
        [a, s, r, n, o]
      ),
      d = useEditorStore(i, function (e, t, n, r, o) {
        if (n)
          for (
            var a = n.patches, s = __rest(n, ['patches']), i = 0;
            i < a.length;
            i++
          ) {
            var d = a[i].path,
              c = d.length > 2 && 'nodes' === d[0] && 'data' === d[2];
            if (
              ([
                craftjsUtilsMeetovo.HISTORY_ACTIONS.IGNORE,
                craftjsUtilsMeetovo.HISTORY_ACTIONS.THROTTLE,
              ].includes(s.type) &&
                s.params &&
                (s.type = s.params[0]),
              ['setState', 'deserialize'].includes(s.type) || c)
            ) {
              o(function (n) {
                e.options.normalizeNodes &&
                  e.options.normalizeNodes(n, t, s, r);
              });
              break;
            }
          }
      });
    return (
      React.useEffect(
        function () {
          d &&
            i &&
            d.actions.setOptions(function (e) {
              Object.assign(e, i);
            });
        },
        [d, i]
      ),
      React.useEffect(
        function () {
          d.subscribe(
            function (e) {
              return { json: d.query.serialize() };
            },
            function () {
              d.query.getOptions().onNodesChange(d.query);
            }
          );
        },
        [d]
      ),
      d
        ? React.createElement(
            EditorContext.Provider,
            { value: d },
            React.createElement(Events, null, t)
          )
        : null
    );
  },
  getTestNode = function (e) {
    var t = e.events,
      n = e.data,
      r = n.nodes,
      o = n.linkedNodes,
      a = __rest(e, ['events', 'data']),
      s = createNode(cloneDeep(e));
    return {
      node: (e = _assign(_assign(_assign({}, s), a), {
        events: _assign(_assign({}, s.events), t),
        dom: e.dom || s.dom,
      })),
      childNodes: r,
      linkedNodes: o,
    };
  },
  expectEditorState = function (e, t) {
    var n = t.nodes,
      r = __rest(t, ['nodes']),
      o = e.nodes,
      a = __rest(e, ['nodes']);
    expect(a).toEqual(r);
    var s = Object.keys(n).reduce(function (e, t) {
        var r = __rest(n[t], ['_hydrationTimestamp', 'rules']);
        return (e[t] = r), e;
      }, {}),
      i = Object.keys(o).reduce(function (e, t) {
        var n = __rest(o[t], ['_hydrationTimestamp', 'rules']);
        return (e[t] = n), e;
      }, {});
    expect(i).toEqual(s);
  },
  createTestNodes = function (e) {
    var t = {},
      n = function (e) {
        var r = getTestNode(e),
          o = r.node,
          a = r.childNodes,
          s = r.linkedNodes;
        (t[o.id] = o),
          a &&
            a.forEach(function (e, r) {
              var a = getTestNode(e),
                s = a.node,
                i = a.childNodes,
                d = a.linkedNodes;
              (s.data.parent = o.id),
                (t[s.id] = s),
                (o.data.nodes[r] = s.id),
                n(
                  _assign(_assign({}, s), {
                    data: _assign(_assign({}, s.data), {
                      nodes: i || [],
                      linkedNodes: d || {},
                    }),
                  })
                );
            }),
          s &&
            Object.keys(s).forEach(function (e) {
              var r = getTestNode(s[e]),
                a = r.node,
                i = r.childNodes,
                d = r.linkedNodes;
              (o.data.linkedNodes[e] = a.id),
                (a.data.parent = o.id),
                (t[a.id] = a),
                n(
                  _assign(_assign({}, a), {
                    data: _assign(_assign({}, a.data), {
                      nodes: i || [],
                      linkedNodes: d || {},
                    }),
                  })
                );
            });
      };
    return n(e), t;
  },
  createTestState = function (e) {
    void 0 === e && (e = {});
    var t = e.nodes,
      n = e.events;
    return _assign(_assign(_assign({}, editorInitialState), e), {
      nodes: t ? createTestNodes(t) : {},
      events: _assign(_assign({}, editorInitialState.events), n || {}),
    });
  };
Object.defineProperty(exports, 'ROOT_NODE', {
  enumerable: !0,
  get: function () {
    return craftjsUtilsMeetovo.ROOT_NODE;
  },
}),
  (exports.ActionMethodsWithConfig = ActionMethodsWithConfig),
  (exports.Canvas = Canvas),
  (exports.CoreEventHandlers = CoreEventHandlers),
  (exports.DefaultEventHandlers = DefaultEventHandlers),
  (exports.DerivedCoreEventHandlers = DerivedCoreEventHandlers),
  (exports.Editor = Editor),
  (exports.Element = Element$1),
  (exports.Events = Events),
  (exports.Frame = Frame),
  (exports.NodeElement = NodeElement),
  (exports.NodeHelpers = NodeHelpers),
  (exports.NodeProvider = NodeProvider),
  (exports.QueryMethods = QueryMethods),
  (exports.connectEditor = connectEditor),
  (exports.connectNode = connectNode),
  (exports.createTestNodes = createTestNodes),
  (exports.createTestState = createTestState),
  (exports.defaultElementProps = defaultElementProps),
  (exports.deprecateCanvasComponent = deprecateCanvasComponent),
  (exports.editorInitialState = editorInitialState),
  (exports.elementPropToNodeData = elementPropToNodeData),
  (exports.expectEditorState = expectEditorState),
  (exports.useEditor = useEditor),
  (exports.useEditorStore = useEditorStore),
  (exports.useEventHandler = useEventHandler),
  (exports.useNode = useNode);

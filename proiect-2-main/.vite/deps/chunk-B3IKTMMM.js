import {
  require_react
} from "./chunk-UVNPGZG7.js";
import {
  __toESM
} from "./chunk-OL46QLBJ.js";

// node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var React = __toESM(require_react(), 1);
var useLayoutEffect2 = Boolean(globalThis?.document) ? React.useLayoutEffect : () => {
};

// node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
var React2 = __toESM(require_react(), 1);
function useCallbackRef(callback) {
  const callbackRef = React2.useRef(callback);
  React2.useEffect(() => {
    callbackRef.current = callback;
  });
  return React2.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}

export {
  useLayoutEffect2,
  useCallbackRef
};
//# sourceMappingURL=chunk-B3IKTMMM.js.map

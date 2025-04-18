import {
  require_react
} from "./chunk-UVNPGZG7.js";
import {
  __toESM
} from "./chunk-OL46QLBJ.js";

// node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
var React = __toESM(require_react(), 1);
function useCallbackRef(callback) {
  const callbackRef = React.useRef(callback);
  React.useEffect(() => {
    callbackRef.current = callback;
  });
  return React.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}

// node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var React2 = __toESM(require_react(), 1);
var useLayoutEffect2 = Boolean(globalThis?.document) ? React2.useLayoutEffect : () => {
};

export {
  useCallbackRef,
  useLayoutEffect2
};
//# sourceMappingURL=chunk-GDZR3K2D.js.map

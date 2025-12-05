import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from 'react';

/**
 * ScrollableContainer - Scrollable Container Component
 *
 * Provides automatic scroll state detection and gradient indicator display
 * When content exceeds container height and hasn't scrolled to bottom, shows bottom gradient indicator
 *
 */
const ScrollableContainer = forwardRef(
  (
    {
      children,
      maxHeight = '24rem',
      className = '',
      contentClassName = '',
      fadeIndicatorClassName = '',
      checkInterval = 100,
      scrollThreshold = 5,
      debounceDelay = 16, // ~60fps
      onScroll,
      onScrollStateChange,
      ...props
    },
    ref,
  ) => {
    const scrollRef = useRef(null);
    const containerRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const onScrollStateChangeRef = useRef(onScrollStateChange);
    const onScrollRef = useRef(onScroll);
    const debouncedCheckScrollableRef = useRef(null);

    const [showScrollHint, setShowScrollHint] = useState(false);

    useEffect(() => {
      onScrollStateChangeRef.current = onScrollStateChange;
    }, [onScrollStateChange]);

    useEffect(() => {
      onScrollRef.current = onScroll;
    }, [onScroll]);

    const debounce = useCallback((func, delay) => {
      return (...args) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => func(...args), delay);
      };
    }, []);

    const checkScrollable = useCallback(() => {
      if (!scrollRef.current) return;

      const element = scrollRef.current;
      const isScrollable = element.scrollHeight > element.clientHeight;
      const isAtBottom =
        element.scrollTop + element.clientHeight >=
        element.scrollHeight - scrollThreshold;
      const shouldShowHint = isScrollable && !isAtBottom;

      setShowScrollHint(shouldShowHint);

      if (onScrollStateChangeRef.current) {
        onScrollStateChangeRef.current({
          isScrollable,
          isAtBottom,
          showScrollHint: shouldShowHint,
          scrollTop: element.scrollTop,
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
        });
      }
    }, [scrollThreshold]);

    // Create debounced function in useEffect to avoid refs-during-render error
    useEffect(() => {
      debouncedCheckScrollableRef.current = debounce(checkScrollable, debounceDelay);
    }, [debounce, checkScrollable, debounceDelay]);

    const handleScroll = useCallback(
      (e) => {
        if (debouncedCheckScrollableRef.current) {
          debouncedCheckScrollableRef.current();
        }
        if (onScrollRef.current) {
          onScrollRef.current(e);
        }
      },
      [],
    );

    useImperativeHandle(
      ref,
      () => ({
        checkScrollable: () => {
          checkScrollable();
        },
        scrollToTop: () => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
          }
        },
        scrollToBottom: () => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        },
        getScrollInfo: () => {
          if (!scrollRef.current) return null;
          const element = scrollRef.current;
          return {
            scrollTop: element.scrollTop,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
            isScrollable: element.scrollHeight > element.clientHeight,
            isAtBottom:
              element.scrollTop + element.clientHeight >=
              element.scrollHeight - scrollThreshold,
          };
        },
      }),
      [checkScrollable, scrollThreshold],
    );

    useEffect(() => {
      const timer = setTimeout(() => {
        checkScrollable();
      }, checkInterval);
      return () => clearTimeout(timer);
    }, [checkScrollable, checkInterval]);

    useEffect(() => {
      if (!scrollRef.current) return;

      if (typeof ResizeObserver === 'undefined') {
        if (typeof MutationObserver !== 'undefined') {
          const observer = new MutationObserver(() => {
            if (debouncedCheckScrollableRef.current) {
              debouncedCheckScrollableRef.current();
            }
          });

          observer.observe(scrollRef.current, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
          });

          return () => observer.disconnect();
        }
        return;
      }

      resizeObserverRef.current = new ResizeObserver(() => {
        if (debouncedCheckScrollableRef.current) {
          debouncedCheckScrollableRef.current();
        }
      });

      resizeObserverRef.current.observe(scrollRef.current);

      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }, []);

    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    const containerStyle = useMemo(
      () => ({
        maxHeight,
      }),
      [maxHeight],
    );

    const fadeIndicatorStyle = useMemo(
      () => ({
        opacity: showScrollHint ? 1 : 0,
      }),
      [showScrollHint],
    );

    return (
      <div
        ref={containerRef}
        className={`card-content-container ${className}`}
        {...props}
      >
        <div
          ref={scrollRef}
          className={`overflow-y-auto card-content-scroll ${contentClassName}`}
          style={containerStyle}
          onScroll={handleScroll}
        >
          {children}
        </div>
        <div
          className={`card-content-fade-indicator ${fadeIndicatorClassName}`}
          style={fadeIndicatorStyle}
        />
      </div>
    );
  },
);

ScrollableContainer.displayName = 'ScrollableContainer';

export default ScrollableContainer;
